const config = require("config");

const log = require("../log");
const responses = require("../responses");
const storage = require("../storage");
const helpers = require("../helpers");

async function hasVoted(req, res) {
    // These come from the URL path, which is nice!
    const competition = req.params.competition;
    const category = req.params.category;

    log.info(`Has Voted request for ${competition} and ${category}`);

    // This path uses query parameters
    if (!req.query.user) {
        log.warn("Ignoring invalid request with missing user id");
        responses.badRequest(res, "Missing User Id");
        return;
    }

    // User Id comes from the request in the query parameters
    const userId = req.query.user;
    const entryId = req.query.entryId;

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the categories and competitions are valid.
    if (!helpers.validateVoteTarget(competition, category)) {
        log.info("Blocking request for invalid competition or category");
        responses.badRequest(res, "Invalid competition or category, Goodbye");
        return;
    }

    // Here we check, have they voted in this category before, we use the id retrieved from the Neos API as it can be trusted a little more.
    try {
        // isAtVotingLimit returns a boolean to check if we're at the voting limit for this competition, category and userId
        const hasVoted = await storage.hasVoted(competition, userId, entryId);

        // converts has voted to a string which we use in the return
        const hasVotedResponse = hasVoted ? "Voted" : "Not Voted";
        log.info(
            `Successful vote state check for ${competition}->${category} and ${userId} state: ${hasVotedResponse}`
        );

        // We use OK because OK means FOUND and not that it is OK for them to vote, in this case 404 or NOT FOUND, means VOTE NOT FOUND as in. YOU CAN VOTE!
        if (hasVoted) {
            responses.ok(res, hasVotedResponse);
        } else {
            responses.notFound(res, hasVotedResponse);
        }
        return;
    } catch (e) {
        log.error("Failed to check voting status");
        log.error(e.message);
        responses.serverError(res);
    }
}

module.exports = hasVoted;
