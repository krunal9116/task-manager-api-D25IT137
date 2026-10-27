const EventEmitter = require('events');

/**
 * TaskEvents - Custom EventEmitter for Task Management System
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 */
class TaskEvents extends EventEmitter {}

// Export a singleton instance
module.exports = new TaskEvents();
