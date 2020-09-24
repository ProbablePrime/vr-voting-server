const log = require('../log');
const responses = require('../responses');

function state(req, res) {
    if (req.query.sessionId) {
        log.info(`Got State request for Session Id: ${req.query.sessionId}`);
    }
    log.info('Sending OK Response for State request');
    responses.ok(res, '1');
}

module.exports = state;
