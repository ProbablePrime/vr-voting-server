const localhost = require('local-hostname');
const config = require('config');

const log = require('./log');
const responses = require('./responses');

const allowedHosts = config.get('allowedHosts');


const logStartMiddleware = (req, res, next) => {
    log.info(`New request for ${req.method}, ${req.url}`);
    next();
};

// Converts the body to JSON, This is sad but Neos doesn't support JSON so there we go
// TODO - AFTER MMC, we need different schemas per endpoints so we should handle that here, the idea is that the main code doesn't
// need to know that Neos can't do JSON.
const parseBodyMiddleware = (req, res, next) => {
    if (typeof req.body !== 'string') {
        responses.badRequest(res, 'Invalid Request Body');
        return;
    }

    next();
};

const authorizeMiddleware = (req, res, next) => {
    // This isn't really that secure, we need more checks for if this is a proxied request
    if (req.headers['x-forwarded-for']) {
        //bail here
        log.warn('Blocking forwarded request because it is likely a proxied request');
        responses.forbidden(res);
        return;
    }
    // This can't really be trusted until our proxy checks are done
    const ip = req.socket.remoteAddress;
    if (localhost(ip)) {
        next();
    }
    // These are stored in the config file
    if (!allowedHosts.includes(ip)) {
        log.warn(`Blocking request from ${ip} it is not on the allow list`);
        responses.forbidden(res);
        // bail here
        return;
    }
    next();
};

module.exports = { logStartMiddleware, authorizeMiddleware, parseBodyMiddleware};
