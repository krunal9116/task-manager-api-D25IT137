const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runDemo() {
  console.log('\n=== PRACTICAL 5 ENDPOINT DEMO ===\n');

  // 1. GET /tasks
  console.log('1. GET /tasks ...');
  let res = await makeRequest('GET', '/tasks');
  console.log(`Status: ${res.status}`);
  console.log('Response:', JSON.stringify(res.data, null, 2));

  // 2. POST /tasks
  console.log('\n2. POST /tasks (Creating new task) ...');
  const newTask = {
    title: '  Prepare Lab Report for P5  ',
    description: 'Include code and MongoDB Compass screenshots',
    priority: 'high'
  };
  res = await makeRequest('POST', '/tasks', newTask);
  console.log(`Status: ${res.status}`);
  console.log('Response:', JSON.stringify(res.data, null, 2));
  const createdId = res.data.data ? res.data.data._id : null;

  // 3. GET /tasks/:id
  if (createdId) {
    console.log(`\n3. GET /tasks/${createdId} ...`);
    res = await makeRequest('GET', `/tasks/${createdId}`);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));

    // 4. PUT /tasks/:id
    console.log(`\n4. PUT /tasks/${createdId} (Updating task) ...`);
    res = await makeRequest('PUT', `/tasks/${createdId}`, { completed: true, priority: 'medium' });
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));

    // 5. DELETE /tasks/:id
    console.log(`\n5. DELETE /tasks/${createdId} ...`);
    res = await makeRequest('DELETE', `/tasks/${createdId}`);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  }

  console.log('\n=== DEMO COMPLETED SUCCESSFULLY ===\n');
}

runDemo().catch(console.error);
