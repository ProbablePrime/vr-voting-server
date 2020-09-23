const config = require('config');

const log = require('../log');
const { fetchNeosUser } = require('../neosapi');
const responses = require('../responses');
const results = require('../results');
const storage = require('../storage');
const helpers = require('../helpers')

const paramsOrder = ['voteTarget', 'username', 'userId', 'machineId', 'sessionId','rawTimestamp'];

async function handleVote(req, res) {
    // Body is the body of the request.
    const body = req.body;

    // Due to Neos' limited data handling this will be some form of CSV. We can't validate this easily but we can try some stuff.
    const bodyArray = body.split(',');

    // Init this here so we can mess with it later
    let incomingVote = {};

    // Basically converts an array to an object
    try {
        incomingVote = helpers.convertArray(paramsOrder, bodyArray);
    } catch (e) {
        log.warn(e.message);
        responses.badRequest(res, 'Invalid Request Body');
        return;
    }

    // Converts and stores our dates. This will fail if rawTimestamp is an invalid date
    try {
        incomingVote.receivedTimestamp = new Date(incomingVote.rawTimestamp);
        incomingVote.arrivedTimeStamp = new Date();
    } catch (e) {
        log.warn('Error processing timestamps from request');
        log.warn(e.message);
        responses.badRequest('Error processing timestamps in vote request, your vote has not been cast.');
        return;
    }

    // Freeze this, it prevents us from modifying it later or from further user input from modifying it.
    Object.freeze(incomingVote);

    // Lots of crap can go wrong before we get here, let's let the log file know it was successful. EVERYTHING IS OK ALARM!!
    log.info('Successfully parsed Neos Incoming vote');

    // These come from the URL path, which is nice!
    const competition = req.params.competition;
    const category = req.params.category;

    log.info(`Voting request for ${competition} and ${category}`);

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the categories and competitions are valid.
    if (!helpers.validateVoteTarget(competition, category)) {
        log.info('Blocking request for invalid competition or category');
        responses.badRequest(res, 'Invalid competition or category, Goodbye');
        return;
    }

    // We'll get the Neos User from the Neos API, this checks that they are a valid user, we also get their registration date
    // The test logic here just allows me to test things. If the competition is my test competition we use dummy users.
    let neosUser;
    if (competition !== 'test') {
        try {
            neosUser = await fetchNeosUser(incomingVote.userId);
        } catch(e) {
            log.warn('Failed to fetch Neos User from neos API');
            log.warn(e.message);
            responses.serverError(res);
            return;
        }
    } else {
        // This only happens if the competition id is test.
        neosUser = {username: incomingVote.username, id:incomingVote.userId, registrationDate: new Date() };
    }

    // If our username from Neos, doesn't match the username returned from the Neos API, it means something has gone wrong.
    // Yeah this means something has gone wrong somewhere BAI.
    if (neosUser.username !== incomingVote.username) {
        log.warn(`Rejecting request as the usernames from Neos don't match the usernames from Neos API`);
        responses.notAuthorized(res,'Invalid Request, Vote not cast');
        return;
    }

    // Here we check, have they voted in this category before, we use the id retrieved from the Neos API as it can be trusted a little more.
    try {
        const hasVoted = await storage.hasVoted(competition, category, neosUser.id);
        if (hasVoted) {
            log.info(`Blocking request for ${neosUser.username} who has already voted in ${competition} and ${category}`);
            responses.forbidden(res, `${neosUser.username} has already voted in the ${competition} competition and ${category} category`);
            return;
        }
    } catch (e) {
        log.error('Failed to check voting status, your vote has not been cast');
        log.error(e);
        responses.serverError(res);
    }

    // Construct the vote, could probably just base this on the incoming vote but I don't want that to have junk so we'll construct that.
    const vote = {};

    // Competition, category, voteTarget
    vote.competition = competition;
    vote.category = category;
    vote.voteTarget = incomingVote.voteTarget;

    // Username, userId, machineId, Registration date
    vote.username = neosUser.username;
    vote.userId = neosUser.id;
    vote.machineId = incomingVote.machineId;
    vote.registrationDate = new Date(neosUser.registrationDate);

    // Received timestamp, arrived timestamp, session id
    vote.receivedTimestamp = incomingVote.receivedTimestamp;
    vote.arrivedTimeStamp = incomingVote.arrivedTimeStamp;
    vote.sessionId = incomingVote.sessionId;

    // This will be the final CSV ordering
    // Competition, category, voteTarget, Username, userId, machineId, Registration date,Received timestamp, arrived timestamp, session id

    // Freeze the Object, before we start messing with it. This doesn't do much but i put it here and i don't remember why.
    Object.freeze(vote);

    // Here begins the lovely try catch area, so we don't want the server to crash so that's why we're try catching everywhere
    try {
        // Store the CSV Result
        log.info(`Recording vote in csv for ${competition}->${category}->${vote.voteTarget} and ${vote.username}`);
        await results.storeResult(vote);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, we don't mark their vote as cast
        log.error(`Failed to save vote to CSV for ${competition}->${category}->${vote.voteTarget} and ${vote.username}`);
        log.error(e);
        responses.serverError(res);
        return;
    }
    try {
        // Here we store their vote, this prevents them from voting for this competition and category ever again
        log.info(`Storing the fact that the user's vote has been recorded for ${competition}->${category}->${vote.voteTarget} and ${vote.username}`);
        await storage.storeVoteState(vote.competition, vote.category, vote.userId);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, this is the worst outcome as we're unsure if their vote has been marked
        // We'll log this to a file and then we can check later, they should be in the CSV at this point anyway...
        log.error(`Failed to store saved voting state, this will need to be checked`);
        log.error(e.message);
        responses.serverError(res);
        return;
    }
    log.info(`Stored successful vote for ${competition}->${category}->${vote.voteTarget} and ${vote.username}`);
    // This marks the "Everything is ok mark" past here everything is fine and we don't need to worry.
    responses.created(res, `Vote cast in ${category} for ${vote.voteTarget},thank you`);
}

module.exports = handleVote;
