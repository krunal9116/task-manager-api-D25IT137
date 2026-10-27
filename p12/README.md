# Practical 12: CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/krunal9116/task-manager-api-D25IT137/actions/workflows/ci.yml/badge.svg)](https://github.com/krunal9116/task-manager-api-D25IT137/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Testing Framework](https://img.shields.io/badge/Testing-Jest%20%26%20Supertest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Code Quality](https://img.shields.io/badge/Linter-ESLint-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**Student ID:** D25IT137  
**Course:** Advanced Web Development Frameworks (ITUE301)  
**Department:** Information Technology, Faculty of Technology & Engineering, CHARUSAT  

---

## 1. Problem Definition & Objectives

The primary objective of Practical 12 is to design, implement, and automate a complete **Continuous Integration (CI)** pipeline using **GitHub Actions** for the full-stack **Task Management Application**.

### Specific Deliverables:
1. **GitHub Actions Workflow Configuration**: Declarative YAML configuration at `.github/workflows/ci.yml` triggered automatically upon every `push` and `pull_request` targeting the `main` branch.
2. **Automated Dependency Installation**: Dedicated pipeline step executing clean dependency resolution (`npm install`).
3. **Automated Test Suite Execution**: Automated test execution using **Jest** and **Supertest** covering multiple API endpoints (`GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `GET /cache-stats`).
4. **Deliberate Failure Demonstration**: Demonstration of pipeline failure (Red ❌) caused by an intentional assertion error, analyzing the failure log output.
5. **Pipeline Resolution**: Correction of the test to achieve a verified passing status (Green ✔️).
6. **Code Quality & Linting (Supplementary)**: Multi-job pipeline incorporating **ESLint** code inspection before running unit/integration tests.
7. **CI Status Badge Integration (Supplementary)**: Live workflow badge embedded into project documentation reflecting real-time pipeline status.

---

## 2. CI/CD Architecture & Workflow Pipeline

```
Developer Workspace
        │
        │  git push origin main / PR to main
        ▼
GitHub Remote Repository (.github/workflows/ci.yml)
        │
        ├──► Trigger Event: on [push, pull_request]
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ Job 1: Code Quality & Linting (runs-on: ubuntu-latest) │
├────────────────────────────────────────────────────────┤
│ 1. Checkout Repository (actions/checkout@v4)           │
│ 2. Setup Node.js Runtime (actions/setup-node@v4 @ 18)  │
│ 3. Install Dependencies (npm install)                  │
│ 4. Run ESLint Code Analysis (npm run lint)             │
└────────────────────────────────────────────────────────┘
        │
        │ (needs: lint - proceeds only if linting passes)
        ▼
┌────────────────────────────────────────────────────────┐
│ Job 2: Build & Automated Tests (ubuntu-latest)         │
├────────────────────────────────────────────────────────┤
│ 1. Checkout Repository (actions/checkout@v4)           │
│ 2. Setup Node.js Runtime (actions/setup-node@v4 @ 18)  │
│ 3. Install Dependencies (npm install)                  │
│ 4. Run Jest & Supertest Suite (npm test)               │
│    ├── GET /tasks returns 200 & task array             │
│    ├── POST /tasks creates task & returns 201          │
│    ├── GET /tasks/:id returns 404 for invalid ID       │
│    ├── GET /cache-stats returns 200 cache metrics      │
│    └── GET /tasks returns 401 on invalid token         │
└────────────────────────────────────────────────────────┘
        │
        ├──► All Assertions Pass (Exit Code 0) ──► ✔️ Green Checkmark / Badge: passing
        │
        └──► Any Assertion Fails (Exit Code 1) ──► ❌ Red X / Badge: failing
```

---

## 3. Directory Structure

```
AWDF/
├── .github/
│   └── workflows/
│       └── ci.yml               # Declarative GitHub Actions CI workflow
├── package.json                 # Root monorepo proxy scripts
├── p12/
│   ├── README.md                # Comprehensive documentation with CI status badge
│   ├── docker-compose.yml       # Multi-container orchestration (Practical 11)
│   ├── backend/
│   │   ├── .eslintrc.json       # ESLint rules and parser configuration
│   │   ├── package.json         # Backend manifest with Jest, Supertest & ESLint
│   │   ├── server.js            # Express API server exporting app
│   │   ├── models/              # Mongoose schemas (Task.js, User.js)
│   │   ├── events.js            # EventEmitter definitions (Practical 10)
│   │   ├── listeners.js         # Asynchronous event handlers
│   │   └── tests/
│   │       └── tasks.test.js    # Automated Jest & Supertest test suite
│   └── frontend/
│       ├── Dockerfile           # Multi-stage production container
│       ├── package.json         # React SPA dependencies
│       └── src/                 # React UI components and state management
└── p12_report_assets/           # High-resolution pipeline evidence & diagrams
```

---

## 4. Automated Test Suite Implementation

The test suite is located at `p12/backend/tests/tasks.test.js` and leverages **Jest** as the runner and **Supertest** for making HTTP requests against the Express `app` instance without binding to external host ports.

```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Task = require('../models/Task');

describe('Task Management API - CI/CD Automated Test Suite', () => {
  // 1. Core Practical 12 Requirement: Verify GET /tasks returns 200
  test('GET /tasks returns 200 and list of tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 2. Post-Lab Requirement: Verify POST /tasks creates a new task
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
    expect(res.body.data.title).toBe(newTask.title);
  });

  // 3. Error Handling: Verify 404 on non-existent ObjectId
  test('GET /tasks/:id returns 404 for non-existent ObjectId', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/tasks/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  // 4. In-Memory Cache Stats: Verify GET /cache-stats returns 200
  test('GET /cache-stats returns 200 and cache statistics', async () => {
    const res = await request(app).get('/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('keys');
    expect(res.body).toHaveProperty('hits');
  });

  // 5. Security & Auth: Verify 401 when invalid Bearer token is provided
  test('GET /tasks returns 401 when invalid Bearer token is passed', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer invalid_signature_token');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
```

---

## 5. Deliberate Failure & Pipeline Fix Demonstration

### Phase A: The Deliberate Test Failure
To verify that the GitHub Actions pipeline genuinely acts as a safety gate, a test expectation in `tests/tasks.test.js` was modified from `200` to `500`:

```javascript
test('GET /tasks returns 200 and list of tasks', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(500); // Deliberate failure assertion
});
```

#### CI Failure Log Output:
```text
FAIL tests/tasks.test.js
  Task Management API - CI/CD Automated Test Suite
    ✕ GET /tasks returns 200 and list of tasks (28 ms)

  ● Task Management API - CI/CD Automated Test Suite › GET /tasks returns 200 and list of tasks

    expect(received).toBe(expected) // Object.is equality

    Expected: 500
    Received: 200

      41 |     const res = await request(app).get('/tasks');
    > 42 |     expect(res.statusCode).toBe(500);
         |                            ^

Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total
Error: Process completed with exit code 1.
```
**Outcome:** GitHub Actions immediately flagged the commit with a **Red ❌**, aborted downstream deployment tasks, and notified the development team.

---

### Phase B: Correcting the Test (Pipeline Green)
The test assertion was corrected back to the intended status code:

```javascript
test('GET /tasks returns 200 and list of tasks', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(200); // Corrected assertion
});
```

#### CI Success Log Output:
```text
PASS tests/tasks.test.js
  Task Management API - CI/CD Automated Test Suite
    ✓ GET /tasks returns 200 and list of tasks (30 ms)
    ✓ POST /tasks creates a new task and returns 201 (9 ms)
    ✓ GET /tasks/:id returns 404 for non-existent ObjectId (5 ms)
    ✓ GET /cache-stats returns 200 and cache statistics (5 ms)
    ✓ GET /tasks returns 401 when invalid Bearer token is passed (7 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.298 s
Ran all test suites.
```
**Outcome:** The pipeline completed with exit code `0`, turning the GitHub Actions status badge **Green (passing)**.

---

## 6. Key Questions & In-Depth Analysis

### Question 1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical actually demonstrate?
- **Continuous Integration (CI):** The software engineering practice where developers regularly merge their code alterations into a shared central repository. Every push triggers automated builds, dependency resolutions, and automated test suites to validate code correctness and immediately detect regressions.
- **Continuous Deployment (CD):** The phase immediately succeeding CI where every change that successfully passes the automated validation suite is automatically released and deployed into staging or production server environments without manual intervention.
- **Demonstrated Scope:** Practical 12 focuses strictly on **Continuous Integration (CI)**. It automates code checkout, runtime provisioning, dependency caching, linting, and automated unit/integration test execution on every commit. No production hosting environment (e.g., AWS, Render, Vercel) is provisioned for deployment.

### Question 2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?
1. **Minimizes Debugging Surface Area:** Running tests on each push isolates errors to the exact diff introduced by that specific commit (typically tens of lines), making root-cause diagnosis trivial compared to debugging an entire release cycle consisting of hundreds of combined commits.
2. **Prevents Compounding Bugs:** An uncaught bug merged early in development can be built upon by peer developers, causing architectural entanglements that are exponentially more expensive to decouple late in the release cycle.
3. **Eliminates Human Error & Fatigue:** Manual release-gate testing is susceptible to checklist fatigue, skipped edge-case scenarios, and environment inconsistencies. Automated CI runs identically and objectively on pristine Ubuntu runner images every single time.

### Question 3: What would happen to the pipeline if the test file path were incorrect — would the workflow fail at the same step as a genuine test failure?
- **Outcome:** The pipeline **would still fail**, but at a fundamentally different failure stage with distinct error semantics:
  - **With an incorrect file path (or misconfigured testMatch):** Jest terminates during the configuration/file discovery phase with `No tests found related to files matching <path>` (or exits with code 1 if `--passWithNoTests` is not set). In the workflow logs, the error appears as a **Test Runner Configuration Error**, not an assertion failure.
  - **With a genuine test failure:** Jest successfully discovers and executes the test files, executes API requests against Express, but encounters an **Assertion Mismatch** (`Expected 200, Received 500`), producing line-numbered diffs and failure reports.
  - While both result in a non-zero exit code (Red ❌) on GitHub Actions, the failure logs distinguish a **broken pipeline configuration** from **regressed application code**.

---

## 7. How to Run Locally

### Running the Test Suite:
```bash
# From workspace root
npm test

# Or directly within backend directory
cd p12/backend
npm test
```

### Running the Linter:
```bash
# From workspace root
npm run lint

# Or directly within backend directory
cd p12/backend
npm run lint
```

### Starting the Backend Server:
```bash
cd p12/backend
npm start
```
