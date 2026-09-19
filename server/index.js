const http = require('http');
const express = require('express');
const next = require('next');
const { initSocket } = require('./socket');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * Boots the Express server, attaches Socket.IO realtime server, and mounts the Next.js application handler.
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    await app.prepare();
    const server = express();
    const httpServer = http.createServer(server);

    // Attach Socket.IO to HTTP server
    initSocket(httpServer);


    // Health check endpoint
    server.get('/api/health', (req, res) => {
      res.json({
        status: 'online',
        service: 'TalentLens Core Platform',
        team: '4D Developers',
        node: process.version,
        timestamp: new Date().toISOString(),
      });
    });

    // Delegate all web requests to Next.js App Router
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    httpServer.listen(port, () => {
      console.log(`\n======================================================`);
      console.log(`  TALENTLENS PLATFORM (Team: 4D Developers)`);
      console.log(`  > Next.js App Router: http://localhost:${port}`);
      console.log(`  > Socket.IO Realtime: ws://localhost:${port}`);
      console.log(`  > Health Check:       http://localhost:${port}/api/health`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal error starting TalentLens server:', err);
    process.exit(1);
  }
}

startServer();
