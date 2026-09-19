const { Server } = require('socket.io');

let ioInstance = null;

/**
 * Initializes the Socket.IO server on top of the provided Node.js HTTP server.
 * @param {import('http').Server} httpServer - The active HTTP server instance.
 * @returns {import('socket.io').Server} The initialized Socket.IO server instance.
 */
function initSocket(httpServer) {
  if (!ioInstance) {
    ioInstance = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    ioInstance.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });
  }
  return ioInstance;
}

/**
 * Retrieves the active Socket.IO server instance.
 * @returns {import('socket.io').Server|null} The singleton Socket.IO instance.
 */
function getIO() {
  return ioInstance;
}

/**
 * Emits an extraction:progress event to all connected clients during skill inference.
 * @param {Object} data - Payload with employeeId, logIndex, totalLogs, entry, detected_skill, confidence, evidence_quote, and category.
 * @returns {boolean} True if the event was successfully dispatched.
 */
function emitExtractionProgress(data) {
  if (!ioInstance) {
    return false;
  }
  ioInstance.emit('extraction:progress', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  return true;
}

module.exports = {
  initSocket,
  getIO,
  emitExtractionProgress,
};
