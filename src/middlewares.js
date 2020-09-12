const localhost = require('local-hostname');
const config = require('config');

const responses = require('./responses');

const allowedHosts = config.get('allowedHosts');

const paramsOrder = ['userId', 'machineId', 'username', 'rawTimestamp', 'sessionId', 'voteTarget'];

function convertArray(paramsKey, body) {
    if (body.length !== paramsKey.length) {
        throw new Error('Invalid Request Body');
    }
    const ret = {};
    paramsOrder.forEach((value,index) => {
        ret[value] = body[index];
    });
    return ret;
}


// Converts the body to JSON, This is sad but Neos doesn't support JSON so there we go
// TODO - AFTER MMC, we need different schemas per endpoints so we should handle that here, the idea is that the main code doesn't
// need to know that Neos can't do JSON.
const parseBodyMiddleware = (req, res, next) => {
    if (typeof req.body !== 'string') {
        responses.badRequest(res, 'Invalid Request Body');
        return;
    }
    const body = req.body;

    // Due to Neos' limited data handling this will be some form of CSV. We can't validate this easily but we can try some stuff.
    const bodyArray = body.split(',');
    // Converts an array to an object
    const vote = convertArray(paramsOrder, bodyArray);

    // Converts and stores our dates. This will fail if rawTimestamp is an invalid date, TODO CATCH THIS
    vote.receivedTimestamp = new Date(vote.rawTimestamp);
    vote.arrivedTimeStamp = new Date();

    // Freeze this, Don't remember why
    Object.freeze(vote)

    // Store the vote in the request so that other parts can pick it up
    req.incomingVote = vote;

    next();
}

const authorizeMiddleware = (req, res, next) => {
    // This isn't really that secure, we need more checks for if this is a proxied request
    if (req.headers['x-forwarded-for']) {
        //bail here
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
        console.log(`Blocking request from ${ip}`);
        responses.forbidden(res);
        // bail here
        return;
    }
    next();
}

module.exports = { authorizeMiddleware, parseBodyMiddleware};
