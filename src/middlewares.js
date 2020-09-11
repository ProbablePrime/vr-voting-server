const localhost = require('local-hostname');
const config = require('config');

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
const parseBodyMiddleware = (req, res, next) => {
    if (typeof req.body !== 'string') {
        res.statusCode = 400;
        res.end('Invalid Request Body');
    }
    const body = req.body;

    // Due to Neos' limited data handling this will be some form of CSV. We can't validate this easily but we can try some stuff.
    const bodyArray = body.split(',');
    const vote = convertArray(paramsOrder, bodyArray);

    vote.receivedTimestamp = new Date(vote.rawTimestamp);
    vote.arrivedTimeStamp = new Date();

    req.incomingVote = vote;

    next();
}

// TODO: Move to file
const authorizeMiddleware = (req, res, next) => {
    if (req.headers['x-forwarded-for']) {
        no(res);
    }

    const ip = req.socket.remoteAddress;
    if (localhost(ip)) {
        next();
    }
    if (!allowedHosts.includes(ip)) {
        console.log(`Blocking request from ${ip}`);
        no(res);
    }
    next();
}

module.exports = { authorizeMiddleware, parseBodyMiddleware};
