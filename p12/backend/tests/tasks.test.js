const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Task = require('../models/Task');

// In-memory mock data store for pure unit testing without external socket/daemon dependency
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

  // Mock Task.find to return query chaining with sort()
  jest.spyOn(Task, 'find').mockImplementation(() => ({
    sort: jest.fn().mockResolvedValue([...inMemoryTasks])
  }));

  // Mock Task.findById
  jest.spyOn(Task, 'findById').mockImplementation((id) => {
    const found = inMemoryTasks.find((t) => t._id === id.toString());
    return Promise.resolve(found || null);
  });

  // Mock Task.prototype.save
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

  // Mock Task.create
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

describe('Task Management API - CI/CD Automated Test Suite', () => {
  // Test 1: Required endpoint test from Practical 12 Problem Definition
  test('GET /tasks returns 200 and list of tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].title).toBe('Automated CI/CD Test Task');
  });

  // Test 2: Supplementary endpoint test (Post-Lab assignment requirement)
  test('POST /tasks creates a new task and returns 201', async () => {
    const newTask = {
      title: 'Deploy to Staging',
      description: 'Trigger automated CI/CD pipeline on push to main',
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

  // Test 3: Endpoint test covering error handling and validation
  test('GET /tasks/:id returns 404 for non-existent ObjectId', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/tasks/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  // Test 4: Endpoint test covering cache and metrics
  test('GET /cache-stats returns 200 and cache statistics', async () => {
    const res = await request(app).get('/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('keys');
    expect(res.body).toHaveProperty('hits');
  });

  // Test 5: Endpoint test verifying unauthorized access with invalid token
  test('GET /tasks returns 401 when invalid Bearer token is passed', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer invalid_signature_token');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/Unauthorized/i);
  });
});
