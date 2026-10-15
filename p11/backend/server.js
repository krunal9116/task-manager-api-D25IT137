const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const taskEvents = require('./events');
const { notificationLogs } = require('./listeners');

// Initialize cache with 60 seconds Time-To-Live
const cache = new NodeCache({ stdTTL: 60 });

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Content-Type validator for POST/PUT
const requireJsonContent = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type header must be application/json for POST and PUT requests'
      });
    }
  }
  next();
};

app.use(requireJsonContent);

// Connect to MongoDB if not in test mode or already connected
if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState === 0) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/task_manager_db';
  console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// --- AUTHENTICATION ROUTES ---

app.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ success: true, message: 'User registered successfully', data: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
});

// --- MIDDLEWARE ---

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

const taskValidation = (req, res, next) => {
  if (req.method === 'POST' && (!req.body.title || req.body.title.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Validation Error: Title is required' });
  }
  next();
};

app.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Apply auth & validation middleware to all /tasks routes
app.use('/tasks', authMiddleware, taskValidation);

// Debug endpoint for cache stats
app.get('/cache-stats', (req, res) => {
  res.json(cache.getStats());
});

// GET /tasks - Fetch all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const cached = cache.get('all_tasks');
    if (cached) {
      return res.status(200).json(cached);
    }
    const tasks = await Task.find().sort({ createdAt: -1 });
    const responseData = {
      success: true,
      count: tasks.length,
      data: tasks
    };
    cache.set('all_tasks', responseData);
    res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Fetch task by ID (Supplementary Requirement)
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    const cacheKey = `task_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    const responseData = {
      success: true,
      data: task
    };
    cache.set(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a new task
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = new Task({
      title,
      description,
      completed,
      priority
    });

    const savedTask = await task.save();
    
    // Invalidate cache
    cache.del('all_tasks');

    const apiResponseTime = new Date().toISOString();
    console.log(`[API] Response (201 Created) sent for Task "${savedTask.title}" at ${apiResponseTime}`);

    // Respond immediately before background event processing finishes
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask,
      respondedAt: apiResponseTime
    });

    // Emit event asynchronously after response is sent
    taskEvents.emit('task-created', {
      task: savedTask,
      user: req.user,
      apiResponseSentAt: apiResponseTime
    });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    const { title, description, completed, priority } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = typeof title === 'string' ? title.trim() : title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    // Invalidate cache
    cache.del('all_tasks');
    cache.del(`task_${id}`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    // Invalidate cache
    cache.del('all_tasks');
    cache.del(`task_${id}`);

    const apiResponseTime = new Date().toISOString();
    console.log(`[API] Response (200 OK) sent for Delete Task "${deletedTask.title}" at ${apiResponseTime}`);

    res.status(200).json({
      success: true,
      message: `Task ${id} deleted successfully`,
      data: deletedTask,
      respondedAt: apiResponseTime
    });

    // Emit event asynchronously after response is sent
    taskEvents.emit('task-deleted', {
      taskId: id,
      taskTitle: deletedTask.title,
      user: req.user,
      apiResponseSentAt: apiResponseTime
    });
  } catch (err) {
    next(err);
  }
});

// --- PRACTICAL 10 EVENT-DRIVEN DEMONSTRATION ENDPOINTS ---

// GET /notifications - Retrieve background notification log entries
app.get('/notifications', (req, res) => {
  res.status(200).json({
    success: true,
    count: notificationLogs.length,
    data: notificationLogs
  });
});

// POST /events/test-error - Demonstrate safe error event listener (Supplementary Problem)
app.post('/events/test-error', (req, res) => {
  const errMsg = req.body.message || 'Simulated EventEmitter error';
  taskEvents.emit('error', new Error(errMsg));
  res.status(200).json({
    success: true,
    message: 'Error event emitted and handled safely without server crash',
    errorTested: errMsg
  });
});

// Route for testing internal server errors
app.get('/cause-error', (req, res, next) => {
  next(new Error('Simulated internal server error'));
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url} - Endpoint does not exist`
  });
});

// Structured Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error Logged]: ${err.message}`);

  // Handle Mongoose Schema Validation Errors cleanly
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: errors.join(', '),
      details: errors
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid Identifier',
      message: `Invalid value '${err.value}' for field '${err.path}'`
    });
  }

  // Default 500 error
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
