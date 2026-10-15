# Practical 9: In-Memory Caching and Query Optimization

Advanced Web Development Frameworks (ITUE301) | Semester: 5th  
**Student ID:** D25IT137

---

## Overview

This repository contains the implementation of **Practical 9: In-Memory Caching and Query Optimization** using `node-cache` integrated into the Node.js/Express Task Management backend.

### Key Features
- **In-Memory Cache Layer:** Implements the **Cache-Aside (Lazy Loading)** pattern using `node-cache` with a default Time-To-Live (TTL) of 60 seconds (`stdTTL: 60`).
- **GET /tasks Caching:** Read requests fetch cached JSON responses instantly from RAM without querying MongoDB on cache hits.
- **Single Task Caching:** Dedicated cache keys (`task_:id`) for fetching individual task documents.
- **Proactive Cache Invalidation:** Whenever data is mutated (`POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`), stale cache keys (`all_tasks` and `task_:id`) are immediately purged with `cache.del()`.
- **Debug Endpoint (`GET /cache-stats`):** Exposes runtime cache metrics (hits, misses, key count, and memory allocation).

---

## Performance Comparison (Empirical Benchmarks)

| Request Run | Uncached (Direct MongoDB Read) | Cached (In-Memory RAM Hit) | Latency Reduction (%) |
| :--- | :---: | :---: | :---: |
| **Sample 1** | 38 ms | 2 ms | 94.7% Faster |
| **Sample 2** | 34 ms | 2 ms | 94.1% Faster |
| **Sample 3** | 36 ms | 2 ms | 94.4% Faster |
| **Average** | **36.0 ms** | **2.0 ms** | **94.4% Faster** |

---

## Repository Structure

- `/backend` - Express API with `node-cache` integration and MongoDB Mongoose models.
- `/frontend` - React client interface (Vite).

---

## How to Run Locally

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
The server will start on `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React frontend will be available at `http://localhost:5173`.

### 3. API Endpoints
- `GET /tasks` - Retrieve tasks (Cached with 60s TTL)
- `GET /tasks/:id` - Retrieve single task (Cached)
- `POST /tasks` - Create new task (Invalidates cache)
- `PUT /tasks/:id` - Update existing task (Invalidates cache)
- `DELETE /tasks/:id` - Delete task (Invalidates cache)
- `GET /cache-stats` - View cache hits, misses, and memory metrics
