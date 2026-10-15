/**
 * Practical 10 - Demonstration Script
 * Asynchronous Processing with Event-Driven Architecture (Node.js EventEmitter)
 *
 * Demonstrates:
 * 1. Immediate API response before background listener finishes.
 * 2. Timestamp ordering comparison (API responded BEFORE listener completed).
 * 3. 'task-created' event processing with artificial delay.
 * 4. 'task-deleted' event processing.
 * 5. Safe error listener handling without process crash.
 */

const taskEvents = require('./events');
const { notificationLogs } = require('./listeners');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDemo() {
  console.log('================================================================');
  console.log('   PRACTICAL 10: EVENT-DRIVEN ASYNC PROCESSING DEMONSTRATION    ');
  console.log('================================================================\n');

  console.log('🔹 1. Simulating POST /tasks Request...');
  const simulatedTask = {
    id: '6523abc12345678901234567',
    title: 'Complete Practical 10 Journal & Code',
    description: 'Implement EventEmitter and compare timestamps',
    priority: 'high'
  };
  const simulatedUser = { email: 'd25it137@charusat.edu.in' };

  // 1. API Response sent immediately
  const apiResponseTime = new Date().toISOString();
  console.log(`[API] ✅ HTTP 201 Response returned to client at: ${apiResponseTime}`);

  // 2. Event emitted into EventEmitter pipeline
  taskEvents.emit('task-created', {
    task: simulatedTask,
    user: simulatedUser,
    apiResponseSentAt: apiResponseTime
  });

  console.log('[API] ⚡ Client request finished! The thread is NOT blocked while the notification runs.\n');

  // Wait 1.5 seconds so listener executes
  await sleep(1500);

  console.log('🔹 2. Simulating DELETE /tasks/:id Request...');
  const deleteResponseTime = new Date().toISOString();
  console.log(`[API] ✅ HTTP 200 Response returned to client at: ${deleteResponseTime}`);

  taskEvents.emit('task-deleted', {
    taskId: simulatedTask.id,
    taskTitle: simulatedTask.title,
    user: simulatedUser,
    apiResponseSentAt: deleteResponseTime
  });

  await sleep(1200);

  console.log('🔹 3. Simulating Safe Error Event Handling...');
  console.log('[Test] Emitting an error event into EventEmitter pipeline:');
  taskEvents.emit('error', new Error('Simulated network delivery timeout in background notification'));
  console.log('[Test] Server continues running normally - error was safely caught by taskEvents.on("error")!\n');

  console.log('🔹 4. In-Memory Background Notification Log Table:');
  console.table(notificationLogs);

  console.log('\n================================================================');
  console.log('               DEMONSTRATION SUCCESSFULLY FINISHED              ');
  console.log('================================================================');
}

runDemo();
