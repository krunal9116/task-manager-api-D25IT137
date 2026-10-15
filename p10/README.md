# Practical 10: Asynchronous Processing with Event-Driven Architecture

**Course**: Advanced Web Development Frameworks (ITUE301)  
**Student ID**: D25IT137  
**Technology Stack**: Node.js (`events` native module), Express.js, MongoDB (Mongoose), React (Vite)

---

## 📌 Objective
To implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies, decoupling side-effects (e.g. notifications, logging, webhook dispatches) from the critical request-response path.

---

## 🏗️ Architecture & Data Flow Diagram

```text
POST /tasks request (Client)
       │
       ▼
 Save task to MongoDB
       │
       ▼
 [API Response (201 Created)] ──► Immediate Response to Client (No Blocking!)
       │
       ▼ (Asynchronous Event Dispatch)
 taskEvents.emit('task-created', taskData)
       │
       ▼
 Notification Listener (Background Thread / Event Loop)
 ├── Artificial Delay (1000ms simulating email/push delivery)
 └── Formatted Log: Task Title, Timestamp, User Info
```

---

## ⚙️ Core Files Implemented

### 1. `events.js` (Singleton EventEmitter Instance)
Custom `EventEmitter` subclass exported as a singleton across the application.
```javascript
const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
```

### 2. `listeners.js` (Background Event Handlers)
Contains listeners for:
- `'task-created'`: Triggers background notification logging after simulated processing delay.
- `'task-deleted'`: Supplementary listener for task removal events.
- `'error'`: Safe error listener preventing uncaught exception process crashes.

### 3. `server.js` (API Integration)
Emits events **after** the HTTP status code and response body are sent to the client:
```javascript
// Send immediate response to client
res.status(201).json({
  success: true,
  message: 'Task created successfully',
  data: savedTask,
  respondedAt: apiResponseTime
});

// Emit event asynchronously into event pipeline
taskEvents.emit('task-created', {
  task: savedTask,
  user: req.user,
  apiResponseSentAt: apiResponseTime
});
```

---

## 📊 Timestamp Evidence & Verification

Run the demonstration script:
```bash
node demo_events.js
```

### Measured Execution Log:
```text
================================================================
   PRACTICAL 10: EVENT-DRIVEN ASYNC PROCESSING DEMONSTRATION    
================================================================

🔹 1. Simulating POST /tasks Request...
[API] ✅ HTTP 201 Response returned to client at: 2026-10-14T09:02:11.215Z
[Event Received] 'task-created' received at 2026-10-14T09:02:11.215Z
[API] ⚡ Client request finished! The thread is NOT blocked while the notification runs.

================== BACKGROUND NOTIFICATION ==================
Event:         task-created
Task:          "Complete Practical 10 Journal & Code"
User:          d25it137@charusat.edu.in
API Responded: 2026-10-14T09:02:11.215Z
Finished At:   2026-10-14T09:02:12.217Z
Notice:        Executed in background without blocking API client! (Delta: +1002ms)
=============================================================

🔹 2. Simulating DELETE /tasks/:id Request...
[API] ✅ HTTP 200 Response returned to client at: 2026-10-14T09:02:12.716Z
[Event Received] 'task-deleted' received at 2026-10-14T09:02:12.716Z

================== BACKGROUND NOTIFICATION ==================
Event:         task-deleted
Task ID:       6523abc12345678901234567
Finished At:   2026-10-14T09:02:13.517Z (Delta: +801ms)
=============================================================

🔹 3. Simulating Safe Error Event Handling...
[Event Error Caught] Handled inside EventEmitter: Simulated network delivery timeout
[Test] Server continues running normally - error was safely caught by taskEvents.on("error")!
```

---

## 💡 Key Analysis & Viva Questions

### 1. Why does emitting an event not block the API response, even though both run on the same Node.js process?
Because Node.js operates on an event loop with non-blocking I/O. Calling `res.status(201).json(...)` flushes the response headers and payload onto the network socket immediately. When asynchronous operations (`setTimeout`, async network calls, or promises) are used inside the event listener, their callbacks are scheduled onto timer and macro-task queues, freeing the main thread to complete the HTTP cycle instantly.

### 2. What would happen to API response time if notification logic were placed directly inside the POST route?
If synchronous notification logic (such as connecting to an SMTP server, rendering an email template, or sending push alerts with a 1–2 second latency) was executed inline before sending `res.json()`, every user creating a task would suffer a 1000–2000ms delay. Placing it in an asynchronous event listener reduces user-perceived API response time down to ~10–20ms.

### 3. Why is EventEmitter suitable for this scale, but not for high-volume production systems?
- **Process Memory Bound**: `EventEmitter` lives entirely in the heap memory of a single Node.js process. If the server crashes or restarts, all pending events in flight are permanently lost.
- **Single Instance Limitation**: In a horizontally scaled cluster (multiple Node.js server instances behind a load balancer), `EventEmitter` events cannot travel across processes.
- **Production Solution**: Enterprise production systems utilize distributed message brokers (such as RabbitMQ, Apache Kafka, or Redis with BullMQ) that provide persistence, retry queues, dead-letter exchanges, and worker pools.

---

## 🚀 How to Run Locally

### 1. Backend
```bash
cd backend
npm install
node server.js
```
- Server: `http://localhost:5000`
- Run Demo: `npm run demo`
- Run Unit Tests: `npm test`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Client: `http://localhost:5173`
- Features: Live Async Event Stream panel showing real-time background notification dispatches and execution timestamps.
