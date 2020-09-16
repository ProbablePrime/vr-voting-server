const config = require('config');


const log = require('../log');
const { fetchNeosUser } = require('../neosapi');
const responses = require('../responses');
const storage = require('../storage');
const helpers = require('../helpers');

async function hasVoted(req, res) {
    // These come from the URL path, which is nice!
    const competition = req.params.competition;
    const category = req.params.category;

    log.info(`Has Voted request for ${competition} and ${category}`);

    if (!req.query.user) {
        log.warn('Ignoring invalid request with missing user id');
        responses.badRequest(res, 'Missing User Id');
        return;
    }

    // User Id comes from the request in the query parameters
    const userId = req.query.user;

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the categories and competitions are valid.
    if (!helpers.validateVoteTarget(competition, category)) {
        log.info('Blocking request for invalid competition or category');
        responses.badRequest(res, 'Invalid competition or category, Goodbye');
        return;
    }

    // Here we check, have they voted in this category before, we use the id retrieved from the Neos API as it can be trusted a little more.
    try {
        const hasVoted = await storage.hasVoted(competition, category, userId);
        const hasVotedResponse = hasVoted ? 'Voted' : 'Not Voted';
        log.info(`Successful vote state check for ${competition}->${category} and ${userId} state: ${hasVotedResponse}`);
        responses.ok(res, hasVotedResponse)
        return;
    } catch (e) {
        log.error('Failed to check voting status');
        log.error(e);
        responses.serverError(res);
    }
}

module.exports = hasVoted;
