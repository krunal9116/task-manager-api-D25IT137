process.env.NODE_ENV = 'test';
const http = require('http');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const app = require('./server');
const taskEvents = require('./events');
const { notificationLogs } = require('./listeners');

let server;
let port;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runPractical10Tests() {
  console.log('🚀 Starting Practical 10 Event-Driven Architecture Unit Tests...\n');

  // 1. Verify EventEmitter instance and listener registration
  assert(typeof taskEvents.emit === 'function', 'taskEvents is an instance of EventEmitter');
  assert(taskEvents.listenerCount('task-created') > 0, "'task-created' listener is registered in listeners.js");
  assert(taskEvents.listenerCount('task-deleted') > 0, "'task-deleted' listener is registered in listeners.js");
  assert(taskEvents.listenerCount('error') > 0, "'error' listener is registered to prevent server crashes");

  // 2. Verify Schema structure
  const taskPathTitle = Task.schema.path('title');
  const taskPathCompleted = Task.schema.path('completed');
  const taskPathPriority = Task.schema.path('priority');
  const taskPathCreatedAt = Task.schema.path('createdAt');

  assert(taskPathTitle.options.required === true || taskPathTitle.isRequired, 'Title field is required in Mongoose Schema');
  assert(taskPathCompleted.options.default === false, 'Completed field defaults to false');
  assert(Array.isArray(taskPathPriority.options.enum.values), 'Priority field has enum values specified');
  assert(taskPathCreatedAt.options.default === Date.now, 'CreatedAt field defaults to Date.now');

  // 3. Test HTTP routes using server instance
  server = app.listen(0);
  port = server.address().port;

  try {
    // Check /notifications endpoint
    let res = await request('GET', '/notifications');
    assert(res.status === 200, 'GET /notifications returns HTTP 200');
    assert(res.body.success === true, 'GET /notifications response has success: true');
    assert(Array.isArray(res.body.data), 'GET /notifications response contains notification array');

    // Test safe error handling endpoint (Supplementary Problem)
    res = await request('POST', '/events/test-error', { message: 'Unit test error emission' });
    assert(res.status === 200, 'POST /events/test-error returns 200 and error is caught gracefully');

    // Test non-blocking event emission
    let eventHandled = false;
    taskEvents.once('test-async-event', (data) => {
      eventHandled = true;
    });
    taskEvents.emit('test-async-event', { test: true });
    assert(eventHandled === true, 'Custom event is dispatched and handled synchronously/asynchronously');

    // 404 endpoint check
    res = await request('GET', '/non-existent-route');
    assert(res.status === 404, '404 handler returns 404 status code');
    assert(res.body.error === 'Not Found', '404 handler returns structured JSON error');

    // POST /tasks without JSON content-type header
    res = await request('POST', '/tasks', {}, { 'Content-Type': 'text/plain' });
    assert(res.status === 400, 'POST /tasks without application/json Content-Type returns 400');

  } finally {
    server.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log('\n🏁 Practical 10 Verification & Unit Tests Completed Successfully.');
    process.exit(process.exitCode || 0);
  }
}

runPractical10Tests();
