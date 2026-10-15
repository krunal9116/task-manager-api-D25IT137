const http = require('http');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const app = require('./server');

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

async function runMockTests() {
  console.log('🚀 Starting Practical 5 Verification & Endpoint Unit Tests...\n');

  // Verify Schema structure
  const taskPathTitle = Task.schema.path('title');
  const taskPathCompleted = Task.schema.path('completed');
  const taskPathPriority = Task.schema.path('priority');
  const taskPathCreatedAt = Task.schema.path('createdAt');

  assert(taskPathTitle.options.required === true || taskPathTitle.isRequired, 'Title field is required in Mongoose Schema');
  assert(taskPathTitle.options.trim === true, 'Title field has trim enabled in Mongoose Schema');
  assert(taskPathCompleted.options.default === false, 'Completed field defaults to false');
  assert(Array.isArray(taskPathPriority.options.enum.values), 'Priority field has enum values specified');
  assert(taskPathPriority.options.enum.values.join(',') === 'low,medium,high', 'Priority enum values are low, medium, high');
  assert(taskPathCreatedAt.options.default === Date.now, 'CreatedAt field defaults to Date.now');

  // Test Pre-save hook logic
  const mockTask = new Task({ title: '   Trim Me Task   ', priority: 'medium' });
  assert(mockTask.title === 'Trim Me Task', 'Title automatically trimmed by Mongoose trim option');

  // Test route responses using server instance
  server = app.listen(0);
  port = server.address().port;

  try {
    // 404 endpoint check
    let res = await request('GET', '/non-existent-route');
    assert(res.status === 404, '404 handler returns 404 status code');
    assert(res.body.error === 'Not Found', '404 handler returns structured JSON error');

    // GET /tasks/:id invalid ID check
    res = await request('GET', '/tasks/invalid-id-123');
    assert(res.status === 404, 'GET /tasks/:id with invalid ID returns 404');

    // POST /tasks without JSON content-type header
    res = await request('POST', '/tasks', {}, { 'Content-Type': 'text/plain' });
    assert(res.status === 400, 'POST /tasks without application/json Content-Type returns 400');

  } finally {
    server.close();
    console.log('\n🏁 Practical 5 Schema & Server Integration Unit Tests Completed.');
  }
}

runMockTests();
