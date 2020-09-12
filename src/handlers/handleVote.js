const config = require('config');

const results = require('../results');
const storage = require('../storage');

const responses = require('../responses');

const competitions = config.get('competitions');
const categories = config.get('categories');

const { fetchNeosUser } = require('../neosapi');

function validateVoteTarget(competition, category) {
    console.log(competition);
    console.log(competition.length, competitions.length);
    console.log(competitions.includes(competition), categories.includes(category));
    console.log(competitions);
    return competitions.includes(competition) && categories.includes(category);
}

// TODO: Move to file
async function handleVote(req, res) {
    // These come from the URL path, which is nice!
    const competition = req.params.competition;
    const category = req.params.category;

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the categories and competitions are valid.
    if (!validateVoteTarget(competition, category)) {
        console.log(competition, category);
        responses.badRequest(res, 'Invalid competition or category, Goodbye');
        return;
    }
    // Middle wares have fixed up all the CSVs and stuff by converting them into JSON, we can access them here
    const incomingVote = req.incomingVote;

    // We'll get the Neos User from the Neos API, this checks that they are a valid user, we also get their registration date
    try {
        const neosUser = await fetchNeosUser(incomingVote.userId);
    } catch(e) {
        responses.serverError(res);
        return;
    }

    // Yeah this means something has gone wrong somewhere BAI.
    if (neosUser.username !== incomingVote.username) {
        responses.notAuthorized(res,'Invalid Request');
        return;
    }

    // Here we check, have they voted in this category before, we use the id retrieved from the Neos API as it can be trusted a little more.
    try {
        const hasVoted = await storage.hasVoted(competition, category, neosUser.id);
        if (hasVoted) {
            responses.forbidden(res, `User has already voted in the ${competition} competition and ${category} category`);
            return;
        }
    } catch (e) {
        responses.serverError(res);
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

    // Freeze the Object, before we start messing with it. This doesn't do much but i put it here and i don't remember why.
    Object.freeze(vote);

    // Here begins the lovely try catch area, so we don't want the server to crash so that's why we're try catching everywhere
    try {
        // Store the CSV Result
        await results.storeResult(vote);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, we don't mark their vote as cast
        console.log(e);
        responses.serverError(res);
        return;
    }
    try {
        // Here we store their vote, this prevents them from voting for this competition and category ever again
        await storage.storeVoteState(vote.competition, vote.category, vote.userId);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, this is the worst outcome as we're unsure if their vote has been marked
        // We'll log this to a file and then we can check later, they should be in the CSV at this point anyway...
        console.log(e);
        responses.serverError(res);
        return;
    }

    // This marks the "Everything is ok mark" past here everything is fine and we don't need to worry.
    responses.ok('Vote Cast,thank you');
}

module.exports = handleVote;
