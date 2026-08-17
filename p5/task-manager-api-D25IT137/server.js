const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();

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
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// GET /tasks - Fetch all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
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

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
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
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
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

    res.status(200).json({
      success: true,
      message: `Task ${id} deleted successfully`,
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
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
