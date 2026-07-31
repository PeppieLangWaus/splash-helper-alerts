const logger = require('../logger');
const config = require('../config');

/**
 * Check if alert should be processed based on filters
 * @param {object} dinkPayload - Dink webhook payload
 * @returns {boolean} True if alert should be forwarded
 */
function shouldProcessAlert(dinkPayload) {
  const { playerName, type } = dinkPayload;

  // Account filtering
  if (config.accounts.filtering.enabled) {
    if (!config.accounts.filtering.playerNames.includes(playerName)) {
      logger.debug(`Skipping alert for account: ${playerName} (not in whitelist)`);
      return false;
    }
  }

  // Event type filtering
  if (config.alerts.eventFilter.length > 0) {
    if (!config.alerts.eventFilter.includes(type)) {
      logger.debug(`Skipping event type: ${type} (not in filter)`);
      return false;
    }
  }

  // Event type exclusion
  if (config.alerts.eventExclude.length > 0) {
    if (config.alerts.eventExclude.includes(type)) {
      logger.debug(`Excluding event type: ${type}`);
      return false;
    }
  }

  return true;
}

/**
 * Extract relevant data from Dink payload
 * @param {object} dinkPayload - Raw Dink webhook payload
 * @returns {object} Processed alert data
 */
function processAlert(dinkPayload) {
  const {
    playerName,
    content,
    type,
    extra = {},
    accountType,
    seasonalWorld,
    dinkAccountHash,
    embeds = []
  } = dinkPayload;

  // Extract message from content or from embed description
  let message = content;
  let embedTitle = '';
  
  if (!message && embeds.length > 0) {
    const firstEmbed = embeds[0];
    message = firstEmbed.description || firstEmbed.title || '';
    embedTitle = firstEmbed.title || '';
    logger.debug(`Extracting message from embed: "${message}"`);
  }

  return {
    playerName,
    eventType: type,
    message: message || 'No message content',
    messageSource: content ? 'content' : (embeds.length > 0 ? 'embed' : 'default'),
    embedTitle,
    accountType,
    seasonalWorld,
    accountHash: dinkAccountHash,
    metadata: extra,
    timestamp: new Date().toISOString(),
    hasEmbeds: embeds.length > 0,
    discordEmbeds: embeds
  };
}

/**
 * Build notification content for Tasker
 * @param {object} processedAlert - Processed alert data
 * @returns {object} Notification with title and text
 */
function buildNotification(processedAlert) {
  const { playerName, eventType, message, metadata } = processedAlert;

  let title = `[${eventType}] ${playerName}`;
  let text = message;

  // Add relevant metadata to notification body if available
  const metadataLines = [];
  
  if (eventType === 'DEATH' && metadata.valueLost) {
    metadataLines.push(`💀 Lost: ${metadata.valueLost}`);
  }
  if (eventType === 'LEVEL' && metadata.levelledSkills) {
    const skills = Object.keys(metadata.levelledSkills).join(', ');
    metadataLines.push(`📈 Skills: ${skills}`);
  }
  if (eventType === 'LOOT' && metadata.items) {
    const itemNames = metadata.items.slice(0, 3).map(i => i.name).join(', ');
    metadataLines.push(`📦 Loot: ${itemNames}${metadata.items.length > 3 ? '...' : ''}`);
  }

  if (metadataLines.length > 0) {
    text += '\n' + metadataLines.join('\n');
  }

  // Truncate for notification
  if (text.length > 500) {
    text = text.substring(0, 497) + '...';
  }

  return { title, text };
}

module.exports = {
  shouldProcessAlert,
  processAlert,
  buildNotification
};
