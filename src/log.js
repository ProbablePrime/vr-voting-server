// Creates a rolling log per hour for what's going on in the server. Read Simple-node-logger's docs for more info
const SimpleLogger = require("simple-node-logger");

const opts = {
    logDirectory: "./logs", // NOTE: folder must exist and be writable...
    fileNamePattern: "log-<DATE>.log",
    dateFormat: "YYYY.MM.DD",
};

const logManager = new SimpleLogger();
logManager.createConsoleAppender();
logManager.createRollingFileAppender(opts);

const log = logManager.createLogger();

module.exports = log;
