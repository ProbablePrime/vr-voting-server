const log = require('../log');
const responses = require('../responses');

const config = require('config');



function state(req, res) {
    if (req.query.sessionId) {
        log(`Got State request for Session Id: ${req.query.sessionId}`);
    } else {
        responses.badRequest(res, 'Missing Session ID in query string');
        return;
    }
    log('Sending OK Response for State request');
    responses.ok(res, '1');
}

// Logging statuses is very noisy, this fixes that. We can turn it off in the config if we want
const logStatus = config.get('logStatus');
function log(msg) {
    if (!logStatus) return;
    log.info(msg);
}

module.exports = state;
