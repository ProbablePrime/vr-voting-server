import {log} from "../log.js";
import * as responses from "../responses.js";
import * as storage from "../storage.js";
import * as helpers from "../helpers.js";

export async function hasVoted(req, res) {
    // These come from the URL path, which is nice!
    const competition = req.params.competition;

    log.info(`Has Voted request for ${competition}`);

    // This path uses query parameters
    if (!req.query.user) {
        log.warn("Ignoring invalid request with missing user id");
        responses.badRequest(res, "Missing User Id");
        return;
    }

    // User Id comes from the request in the query parameters
    const userId = req.query.user;
    const entryId = req.query.entryId;

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the competition is valid.
    if (!helpers.validateCompetition(competition)) {
        log.info("Blocking request for invalid competition");
        responses.badRequest(res, "Invalid competition.");
        return;
    }

    // Here we check, have they voted in this entry before.
    try {
        const hasVoted = await storage.hasVoted(competition, userId, entryId);

        // converts has voted to a string which we use in the return
        const hasVotedResponse = hasVoted ? "Voted" : "Not Voted";
        log.info(
            `Successful vote state check for ${competition}->${entryId} and ${userId} state: ${hasVotedResponse}`
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
