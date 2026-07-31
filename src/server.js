require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const dinkRoutes = require('./routes/dink');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  logger.info(`[${req.id}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/webhook/dink', dinkRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`[${req.id}] Error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Webhook server running on port ${PORT}`);
  logger.info(`📍 Dink webhook: http://localhost:${PORT}/webhook/dink`);
});

module.exports = app;
