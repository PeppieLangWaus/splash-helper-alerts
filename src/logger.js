const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'server.log');

const levels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const getTimestamp = () => new Date().toISOString();

const log = (level, ...args) => {
  const timestamp = getTimestamp();
  const message = args.map(arg => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2);
    }
    return arg;
  }).join(' ');

  const logMessage = `[${timestamp}] [${level}] ${message}`;

  // Console output
  if (level === levels.ERROR) {
    console.error(logMessage);
  } else if (level === levels.WARN) {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }

  // File output
  fs.appendFileSync(logFile, logMessage + '\n');
};

module.exports = {
  error: (...args) => log(levels.ERROR, ...args),
  warn: (...args) => log(levels.WARN, ...args),
  info: (...args) => log(levels.INFO, ...args),
  debug: (...args) => log(levels.DEBUG, ...args)
};
