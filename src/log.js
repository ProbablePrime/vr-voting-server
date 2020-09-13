// this may seem simple but allows us to create and customize the logger later.
const SimpleLogger = require('simple-node-logger');

const opts = {
    logDirectory:'./logs', // NOTE: folder must exist and be writable...
    fileNamePattern:'log-<DATE>.log',
    dateFormat:'YYYY.MM.DD'
};

const logManager = new SimpleLogger();
logManager.createConsoleAppender();
logManager.createRollingFileAppender(opts);

const log = logManager.createLogger();

module.exports = log;
