const taskEvents = require('./events');

/**
 * In-memory notification log to verify background event processing
 */
const notificationLogs = [];

/**
 * 1. Listener for 'task-created' event
 * Handles background task notifications asynchronously without blocking the client response.
 */
taskEvents.on('task-created', (payload) => {
  const receiveTimestamp = new Date().toISOString();
  console.log(`[Event Received] 'task-created' received at ${receiveTimestamp}`);
  
  // Artificial delay (e.g., simulating slow email/webhook/push notification delivery)
  setTimeout(() => {
    const finishTimestamp = new Date().toISOString();
    const notification = {
      id: notificationLogs.length + 1,
      event: 'task-created',
      taskId: payload.task?._id || payload.task?.id || 'unknown',
      taskTitle: payload.task?.title || 'Untitled',
      user: payload.user?.email || payload.user?.id || 'system',
      apiSentAt: payload.apiResponseSentAt,
      processedAt: finishTimestamp
    };

    notificationLogs.push(notification);

    console.log(`\n================== BACKGROUND NOTIFICATION ==================`);
    console.log(`Event:       task-created`);
    console.log(`Task:        "${notification.taskTitle}" (ID: ${notification.taskId})`);
    console.log(`User:        ${notification.user}`);
    console.log(`API Responded: ${notification.apiSentAt || 'N/A'}`);
    console.log(`Finished At:   ${notification.processedAt}`);
    console.log(`Notice:      Executed in background without blocking API client!`);
    console.log(`=============================================================\n`);
  }, 1000); // 1-second simulated async delay
});

/**
 * 2. Supplementary Problem: Listener for 'task-deleted' event
 */
taskEvents.on('task-deleted', (payload) => {
  const receiveTimestamp = new Date().toISOString();
  console.log(`[Event Received] 'task-deleted' received at ${receiveTimestamp}`);

  setTimeout(() => {
    const finishTimestamp = new Date().toISOString();
    const notification = {
      id: notificationLogs.length + 1,
      event: 'task-deleted',
      taskId: payload.taskId,
      taskTitle: payload.taskTitle || 'N/A',
      user: payload.user?.email || payload.user?.id || 'system',
      apiSentAt: payload.apiResponseSentAt,
      processedAt: finishTimestamp
    };

    notificationLogs.push(notification);

    console.log(`\n================== BACKGROUND NOTIFICATION ==================`);
    console.log(`Event:       task-deleted`);
    console.log(`Task ID:     ${notification.taskId} ("${notification.taskTitle}")`);
    console.log(`User:        ${notification.user}`);
    console.log(`API Responded: ${notification.apiSentAt || 'N/A'}`);
    console.log(`Finished At:   ${notification.processedAt}`);
    console.log(`=============================================================\n`);
  }, 800);
});

/**
 * 3. Supplementary Problem: Safe Error Listener
 * Prevents unhandled 'error' events from crashing the Node.js process.
 */
taskEvents.on('error', (err) => {
  console.error(`[Event Error Caught] Handled inside EventEmitter: ${err.message}`);
});

module.exports = {
  notificationLogs
};
