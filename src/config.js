// Configuration management
const config = {
  // Server
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // Dink
  dink: {
    // Webhook secret for validating Dink payloads (optional)
    secret: process.env.DINK_SECRET || null,
  },

  // Join by joaoapps
  join: {
    apiKey: process.env.JOIN_API_KEY || '',
    deviceId: process.env.JOIN_DEVICE_ID || 'group.all',
    apiUrl: 'https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush'
  },

  // Account filtering
  accounts: {
    // If enabled, only forward alerts from these player names
    filtering: {
      enabled: process.env.ACCOUNT_FILTER_ENABLED === 'true' || false,
      playerNames: process.env.ACCOUNT_FILTER_NAMES ? 
        process.env.ACCOUNT_FILTER_NAMES.split(',').map(n => n.trim()) : []
    }
  },

  // Alert processing
  alerts: {
    // Event types to forward (empty = all)
    eventFilter: process.env.EVENT_FILTER ? 
      process.env.EVENT_FILTER.split(',').map(e => e.trim()) : [],
    
    // Event types to exclude
    eventExclude: process.env.EVENT_EXCLUDE ? 
      process.env.EVENT_EXCLUDE.split(',').map(e => e.trim()) : [],

    // Include screenshot in Tasker notification
    includeScreenshot: process.env.INCLUDE_SCREENSHOT === 'true' || false,

    // Include full payload in debug mode
    debug: process.env.DEBUG === 'true' || false
  }
};

module.exports = config;
