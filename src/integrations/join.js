const axios = require('axios');
const logger = require('../logger');
const config = require('../config');

/**
 * Send notification to Join by joaoapps
 * @param {string} title - Notification title
 * @param {string} text - Notification body text
 * @param {object} options - Additional options
 * @returns {Promise<object>} Response from Join API
 */
async function sendNotification(title, text, options = {}) {
  if (!config.join.apiKey) {
    logger.error('Join API key not configured');
    throw new Error('JOIN_API_KEY environment variable not set');
  }

  const payload = {
    apikey: config.join.apiKey,
    deviceId: options.deviceId || config.join.deviceId,
    title: title,
    text: text,
    smallicon: options.smallicon || 'ic_launcher',
    priority: options.priority || 2,
    ...options
  };

  try {
    logger.debug(`Sending Join notification:`, { title, deviceId: payload.deviceId });
    
    // Build query parameters for Join API
    const params = new URLSearchParams({
      apikey: payload.apikey,
      deviceId: payload.deviceId,
      title: payload.title,
      text: payload.text
    });
    
    const url = `${config.join.apiUrl}?${params.toString()}`;
    
    const response = await axios.get(url, {
      timeout: 10000
    });

    logger.info(`✓ Join notification sent successfully to ${payload.deviceId}`);
    return response.data;
  } catch (error) {
    logger.error(`✗ Failed to send Join notification:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      fullError: error.toString()
    });
    throw error;
  }
}

/**
 * Format Dink payload for Tasker notification
 * @param {object} dinkPayload - Raw Dink webhook payload
 * @param {object} options - Additional options (url, icon, etc.)
 * @returns {object} Formatted notification data
 */
function formatNotification(dinkPayload, options = {}) {
  const {
    playerName,
    content,
    type,
    extra = {}
  } = dinkPayload;

  // Use content as the main message
  let title = `RuneLite Alert - ${type || 'Event'}`;
  let text = content || 'Notification from RuneLite';

  // Add player name to title if available
  if (playerName) {
    title = `${playerName} - ${type || 'Alert'}`;
  }

  // Truncate text for Tasker (phones have limited notification space)
  if (text.length > 500) {
    text = text.substring(0, 497) + '...';
  }

  return {
    title,
    text,
    url: options?.url || null,
    icon: options?.icon || null
  };
}

module.exports = {
  sendNotification,
  formatNotification
};
