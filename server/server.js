import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`[server] BizPilot API listening on port ${env.port} (${env.nodeEnv})`);
    console.log(`[server] Health check: http://localhost:${env.port}/health`);
  });

  const shutdown = (signal) => {
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('[server] Unhandled promise rejection:', err);
  });
};

start();
