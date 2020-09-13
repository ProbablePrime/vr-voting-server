// this may seem simple but allows us to create and customize the logger later. right now it just logs shit.

const log = require('simple-node-logger').createSimpleLogger('project.log');

module.exports = log;
