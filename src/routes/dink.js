const express = require('express');
const router = express.Router();
const logger = require('../logger');
const config = require('../config');
const { shouldProcessAlert, processAlert, buildNotification } = require('../processors/alertProcessor');
const { sendNotification } = require('../integrations/join');

/**
 * POST /webhook/dink
 * Receives Dink webhook notifications and forwards them to Tasker via Join
 */
router.post('/', async (req, res) => {
  try {
    const requestId = req.id;
    const payload = req.body;

    logger.debug(`[${requestId}] Received Dink webhook:`, payload);

    // Validate payload has required fields
    if (!payload.playerName || !payload.type) {
      logger.warn(`[${requestId}] Invalid payload: missing required fields`);
      return res.status(400).json({ error: 'Missing required fields: playerName, type' });
    }

    // Check if alert should be processed
    if (!shouldProcessAlert(payload)) {
      logger.info(`[${requestId}] Alert filtered out: ${payload.playerName} - ${payload.type}`);
      return res.status(200).json({ skipped: true, reason: 'Alert filtered' });
    }

    // Process alert
    let processedAlert;
    let title, text;
    
    try {
      processedAlert = processAlert(payload);
      logger.debug(`[${requestId}] Processed alert:`, {
        playerName: processedAlert.playerName,
        eventType: processedAlert.eventType,
        message: processedAlert.message
      });
    } catch (processError) {
      logger.error(`[${requestId}] Error processing alert:`, {
        message: processError.message,
        stack: processError.stack
      });
      return res.status(400).json({
        success: false,
        error: 'Failed to process alert',
        message: processError.message
      });
    }

    try {
      const notification = buildNotification(processedAlert);
      title = notification.title;
      text = notification.text;
      logger.debug(`[${requestId}] Built notification:`, { title, textLength: text?.length });
    } catch (buildError) {
      logger.error(`[${requestId}] Error building notification:`, {
        message: buildError.message,
        stack: buildError.stack
      });
      return res.status(400).json({
        success: false,
        error: 'Failed to build notification',
        message: buildError.message
      });
    }

    logger.info(`[${requestId}] Processing alert: ${title}`);

    // Send to Join/Tasker
    try {
      const joinResponse = await sendNotification(title, text, {
        deviceId: config.join.deviceId,
        priority: 2
      });

      logger.info(`[${requestId}] ✓ Alert forwarded to Tasker successfully`);
      
      return res.status(200).json({
        success: true,
        message: 'Alert forwarded to Tasker',
        alert: {
          playerName: processedAlert.playerName,
          eventType: processedAlert.eventType,
          title,
          text
        }
      });
    } catch (joinError) {
      logger.error(`[${requestId}] ✗ Failed to forward to Tasker:`, {
        message: joinError.message,
        status: joinError.response?.status,
        data: joinError.response?.data
      });
      
      return res.status(502).json({
        success: false,
        error: 'Failed to forward to Tasker',
        message: joinError.message || 'Unknown error',
        details: joinError.response?.data
      });
    }

  } catch (error) {
    const errorInfo = {
      message: error?.message || String(error) || 'Unknown error',
      type: error?.constructor?.name || 'Unknown',
      stack: error?.stack,
      fullError: error ? JSON.stringify(error) : 'null'
    };
    logger.error(`[${req.id}] Unexpected error processing webhook:`, errorInfo);
    return res.status(500).json({
      error: 'Internal server error',
      message: errorInfo.message,
      details: process.env.NODE_ENV === 'development' ? errorInfo : undefined
    });
  }
});

/**
 * GET /webhook/dink
 * Health check for webhook endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ready',
    message: 'Dink webhook endpoint is ready to receive alerts'
  });
});

module.exports = router;
