const polka = require('polka');
const config = require('config');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const {authorizeMiddleware, parseBodyMiddleware} = require('./middlewares');
const results = require('./results');
const storage = require('./storage');

const competitions = config.get('competitions');
const categories = config.get('categories');
function validateVoteTarget(competition, category) {
    return competitions.contains(competition) && categories.contains(category);
}

const port = 3000;

const screenshotsPath = config.get('screenshotsPath');

// TODO: Move to file
async function handleVote(req, res) {
    // These come from the URL path, which is nice!
    const competition = req.params.competition;
    const category = req.params.category;

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the categories and competitions are valid.
    if (!validateVoteTarget(competitions, category)) {
        res.statusCode = 400;
        res.end('Invalid competition or category, Goodbye');
    }
    // Middle wares have fixed up all the CSVs and stuff by converting them into JSON, we can access them here
    const incomingVote = req.incomingVote;

    // We'll get the Neos User from the Neos API, this checks that they are a valid user, we also get their registration date
    const neosUser = await fetchNeosUser(incomingVote.userId);

    // Yeah this means something has gone wrong somewhere BAI.
    if (neosUser.username !== incomingVote.username) {
        res.statusCode = 401;
        res.end('Blocked malicious request');
    }

    // Here we check, have they voted in this category before, we use the id retrieved from the Neos API as it can be trusted a little more.
    const hasVoted = await storage.hasVoted(competition, category, neosUser.id);
    if (hasVoted) {
        res.statusCode = 403;
        res.end(`User has already voted in the ${competition} competition and ${category} category`);
        return;
    }

    // Construct the vote, could probably just base this on the incoming vote but I don't want that to have junk so we'll construct that.
    const vote = {};
    vote.competition = competition;
    vote.username = neosUser.username;
    vote.userId = neosUser.id;
    vote.machineId = incomingVote.machineId;
    vote.sessionId = incomingVote.sessionId;
    vote.receivedTimestamp = incomingVote.receivedTimestamp;
    vote.arrivedTimeStamp = incomingVote.arrivedTimeStamp;
    vote.voteTarget = incomingVote.voteTarget;
    vote.category = category;

    // Freeze the Object, before we start messing with it. This doesn't do much but i put it here and i dont remember why.
    Object.freeze(vote);

    // Here begins the lovely try catch area, so we don't want the server to crash so that's why we're try catching everywhere
    try {
        // Store the CSV Result
        await results.storeResult(vote);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, we don't mark their vote as cast
        console.log(e);
        weScrewedUp(res);
        return;
    }
    try {
        // Here we store their vote, this prevents them from voting for this competition and category ever again
        await storage.storeVoteState(vote.competition, vote.category, vote.userId);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, this is the worst outcome as we're unsure if their vote has been marked
        // We'll log this to a file and then we can check later, they should be in the CSV at this point anyway...
        console.log(e);
        weScrewedUp(res);
        return;
    }

    // This marks the "Everything is ok mark" past here everything is fine and we dont need to worry.
    res.statusCode = 200;
    res.end('Vote Cast,thank you');
}

// Just a shortcut function
function weScrewedUp(res) {
    res.statusCode = 500;
    res.end('Try again later, your vote has NOT been cast');
}

const userPath = 'https://www.neosvr-api.com/api/users/';
// Async await is king!, here we use the Neos API to fetch their api record
async function fetchNeosUser(userId) {
    return fetch(`${userPath}${userId}`).then(res => res.json());
}

console.log('starting server');

// Starts the webserver, has the authorize and parse body middlewares which handle neos stuff.
polka()
    .use(bodyParser.text())
    .use(authorizeMiddleware)
    .use(parseBodyMiddleware)
    .post('vote/:competition/:category', handleVote)
    .listen(port);
