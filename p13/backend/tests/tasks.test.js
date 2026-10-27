const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Task = require('../models/Task');

let inMemoryTasks = [];

beforeEach(() => {
  inMemoryTasks = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      title: 'Automated CI/CD Test Task',
      description: 'Verifying GitHub Actions pipeline with Jest & Supertest',
      completed: false,
      priority: 'high',
      createdAt: new Date().toISOString()
    }
  ];

  jest.spyOn(Task, 'find').mockImplementation(() => ({
    sort: jest.fn().mockResolvedValue([...inMemoryTasks])
  }));

  jest.spyOn(Task, 'findById').mockImplementation((id) => {
    const found = inMemoryTasks.find((t) => t._id === id.toString());
    return Promise.resolve(found || null);
  });

  jest.spyOn(Task.prototype, 'save').mockImplementation(function () {
    const created = {
      _id: this._id || new mongoose.Types.ObjectId().toString(),
      title: this.title,
      description: this.description,
      completed: this.completed || false,
      priority: this.priority || 'medium',
      createdAt: new Date().toISOString()
    };
    inMemoryTasks.push(created);
    return Promise.resolve(created);
  });

  jest.spyOn(Task, 'create').mockImplementation((taskData) => {
    const created = {
      _id: new mongoose.Types.ObjectId().toString(),
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      ...taskData
    };
    inMemoryTasks.push(created);
    return Promise.resolve(created);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Task Management API - Practical 13 AI Integration & Core Suite', () => {
  // Test 1: Verify Core Task Retrieval
  test('GET /tasks returns 200 and list of tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Test 2: Verify Task Creation
  test('POST /tasks creates a new task and returns 201', async () => {
    const newTask = {
      title: 'Deploy to Cloud Engine',
      description: 'Automated deploy pipeline',
      priority: 'high'
    };

    const res = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.title).toBe(newTask.title);
  });

  // Test 3: AI Feature - Auto-Generate Task Description & Priority (Practical 13)
  test('POST /api/ai/generate-description returns 200 with AI suggestion', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Fix login JWT authentication bug' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('description');
    expect(typeof res.body.description).toBe('string');
    expect(res.body.description.length).toBeGreaterThan(10);
    expect(res.body).toHaveProperty('suggestedPriority');
    expect(['low', 'medium', 'high']).toContain(res.body.suggestedPriority);
    expect(res.body).toHaveProperty('disclaimer');
  });

  // Test 4: AI Feature - Graceful Degradation / Failure Handling (Practical 13 Requirement)
  test('POST /api/ai/generate-description degrades gracefully with fallback flag when external service fails or is unconfigured', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Optimize MongoDB indexing for performance' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('fallback', true);
    expect(res.body.description).toMatch(/mongo|index|query|Review/i);
    expect(res.body.disclaimer).toMatch(/AI-generated/i);
  });

  // Test 5: AI Feature - Validation Error when title is omitted
  test('POST /api/ai/generate-description returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/title is required/i);
  });

  // Test 6: AI Feature - Rate Limiter Protection
  test('POST /api/ai/generate-description enforces rate limiting when threshold exceeded', async () => {
    // Send multiple rapid requests to trigger rate limit
    let lastRes;
    for (let i = 0; i < 12; i++) {
      lastRes = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: `Stress Test Call ${i}` })
        .set('Content-Type', 'application/json');
    }

    expect(lastRes.statusCode).toBe(429);
    expect(lastRes.body).toHaveProperty('error', 'Too Many Requests');
    expect(lastRes.body).toHaveProperty('fallback', true);
  });
});
