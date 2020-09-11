const polka = require('polka');
const config = require('config');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const fs = require('fs');
const { parse } = require('json2csv');


const port = 3000;

const CR = '\r'
const LF = '\n'
const CRLF = CR + LF;

const screenshotsPath = config.get('screenshotsPath');
const resultsPath = config.get('resultsPath');

const streams = {};

const {authorizeMiddleware, parseBodyMiddleware} = require('./middlewares.js');

const userPath = 'https://www.neosvr-api.com/api/users/';

function createOrRetrieveStream(competition) {
    if (streams[competition] !== null) {
        streams[competition] = fs.createWriteStream(`${resultsPath}${competition}.csv`, {flags: 'a'});
    }
    return streams[competition];
}

// TODO: Move to file
async function handleVote(req, res) {
    // Middle wares have fixed up all the CSVs and stuff by converting them into JSON
    const incomingVote = req.incomingVote;

    // We'll get the Neos User from the Neos API, this checks that they are a valid user, we also get their registration date
    const neosUser = await fetchNeosUser(incomingVote.userId);

    // Yeah this means something has gone wrong.
    if (neosUser.username !== incomingVote.username) {
        res.statusCode = 401;
        res.end('Blocked malicious request');
    }

    // Construct the vote, could probably just base this on the incoming vote but I don't want that to have junk so we'll construct that.
    const vote = {};
    vote.competition = req.params.competition;
    vote.username = neosUser.username;
    vote.userId = neosUser.id;
    vote.machineId = incomingVote.machineId;
    vote.sessionId = incomingVote.sessionId;
    vote.receivedTimestamp = incomingVote.receivedTimestamp;
    vote.arrivedTimeStamp = incomingVote.arrivedTimeStamp;
    vote.voteTarget = incomingVote.voteTarget;
    vote.category = req.params.category;

    // This lets the webserver handle multiple votes and competitions at once
    const stream = createOrRetrieveStream(vote.competition);

    // I hate this thing
    const csv = parse(vote, {header:false}) + CRLF;

    // We should catch errors
    stream.write(csv);

    // Shrugs ?
    res.statusCode = 200;
    res.end('Vote Cast,thank you');
}

async function fetchNeosUser(userId) {
    return fetch(`${userPath}${userId}`).then(res => res.json());
}

function no(res) {
    res.statusCode = 401;
    res.end('Not Authorized');
}


console.log('starting server');
polka()
.use(bodyParser.text())
.use(authorizeMiddleware)
.use(parseBodyMiddleware)
.post('vote/:competition/:category', handleVote)
.listen(port)
