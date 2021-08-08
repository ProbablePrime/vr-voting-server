const log = require("../log");
const responses = require("../responses");

const config = require("config");

function state(req, res) {
    if (req.query.sessionId) {
        logStatus(`Got State request for Session Id: ${req.query.sessionId}`);
    } else {
        responses.badRequest(res, "Missing Session ID in query string");
        return;
    }
    logStatus("Sending OK Response for State request");
    responses.ok(res, "1");
}

// Logging statuses is very noisy, this fixes that. We can turn it off in the config if we want
const shouldLogStatus = config.get("logStatus");

function logStatus(msg) {
    if (!shouldLogStatus) return;
    log.info(msg);
}

module.exports = state;
