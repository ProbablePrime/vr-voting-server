import {log} from "../log.js";
import { fetchNeosUser, splitEntryId, fetchNeosRecord } from "../neosapi.js";
import * as responses from "../responses.js";
import * as storage from "../storage.js";
import * as helpers from "../helpers.js";

const paramsOrder = [
    "entryId",
    "username",
    "userId",
    "machineId",
    "sessionId",
    "rawTimestamp",
];

export async function handleVote(req, res) {
    // Body is the body of the request, in the case of a vote it contains the vote string from the voting system
    const body = req.body;

    // Due to Neos' limited data handling (COLLECTIONS PLEASE!!) this will be some form of CSV from the voting system.
    // We can't validate this easily but we can try some stuff to double check it looks OK.
    // Only the host can talk to this server by default so its generically OK to assume the data isn't bad.
    // Don't use basically any of this with a non local web server OR do any sort of Identification/Authorization/Authentication or Payment stuff with this
    const bodyArray = body.split(",");

    // Init this here so we can mess with it later, this lets the try catches work a little better
    let incomingVote = {};

    // Basically converts an array to an object
    try {
        incomingVote = helpers.convertArray(paramsOrder, bodyArray);
    } catch (e) {
        log.warn(e.message);
        responses.badRequest(res, "Invalid Request Body");
        return;
    }

    // Converts and stores our timestamps. This will fail if rawTimestamp is an invalid date but the error is caught
    try {
        // This is the timestamp from Neos, when the request was constructed and sent.
        incomingVote.receivedTimestamp = new Date(incomingVote.rawTimestamp);
        // This is the timestamp from the webserver, when it approximately receives the request.
        incomingVote.arrivedTimeStamp = new Date();
        // Comparing both of these in the results file let's us see that the clocks are roughly in sync and that we're not backed up
        // If these are out of date by a large mile then something fishy is going on, we should discount the result.
    } catch (e) {
        log.warn("Error processing timestamps from request");
        log.warn(e.message);
        responses.badRequest(
            "Error processing timestamps in vote request, your vote has not been cast."
        );
        return;
    }

    // Freeze this, it prevents us from modifying it later or from further user input from modifying it.
    Object.freeze(incomingVote);

    // Lots of crap can go wrong before we get here, let's let the log file know it was successful. EVERYTHING IS OK ALARM!!
    log.info("Successfully parsed Neos Incoming vote");

    // These come from the URL path, which is nice!
    const competition = req.params.competition;
    const categories = helpers.extractCategories(req);

    log.info(
        `Voting request for ${competition} and ${categories.category}:${categories.subcategory}`
    );

    // These come from the URL so i'm scared that they might be wrong or malicious, here we check if the categories and competitions are valid.
    // These are stored in the configuration file
    if (!helpers.validateVoteTarget(competition, categories)) {
        log.info("Blocking request for invalid competition or category");
        responses.badRequest(
            res,
            "Invalid competition or category settings. Your vote has not been cast"
        );
        return;
    }

    // Is this entry blocked from voting?
    if (helpers.isBlocked(incomingVote.entryId)) {
        log.warn(
            `Blocking vote request with blocked vote target: ${incomingVote.entryId}`
        );
        responses.forbidden(res, "You cannot vote for this entry.");
    }

    // We'll get the Neos User from the Neos API, this checks that they are a valid user, we also get their registration date
    // The test logic here just allows me to test things. If the competition is my test competition we use dummy users.
    let neosUser;
    if (competition !== "test") {
        try {
            neosUser = await fetchNeosUser(incomingVote.userId);
        } catch (e) {
            log.warn("Failed to fetch Neos User from neos API");
            log.warn(e.message);
            responses.serverError(res);
            return;
        }
    } else {
        // This only happens if the competition id is test.
        neosUser = {
            username: incomingVote.username,
            id: incomingVote.userId,
            registrationDate: new Date(),
        };
    }

    // If our username from Neos, doesn't match the username returned from the Neos API, it means something has gone wrong.
    // Yeah this means something has gone wrong somewhere BAI.
    if (neosUser.username !== incomingVote.username) {
        log.warn(
            `Rejecting request as the usernames from Neos don't match the usernames from Neos API`
        );
        responses.notAuthorized(res, "Invalid Request, Vote not cast");
        return;
    }

    // Here we check, have they voted for this entry before, we use the id retrieved from the Neos API as it can be trusted a little more.
    /// HAS VOTED FOR?
    try {
        // Returns a boolean, seeing if the user has voted.
        const hasVoted = await storage.hasVoted(
            competition,
            neosUser.id,
            incomingVote.entryId
        );
        if (hasVoted) {
            // Block the request because they have voted before.
            log.info(
                `Blocking request for ${neosUser.username} and ${incomingVote.entryId}. They have voted before for this entry before.`
            );
            responses.forbidden(
                res,
                `${neosUser.username} has voted for this entry before`
            );
            return;
        }
    } catch (e) {
        log.error("Failed to check voting status, your vote has not been cast");
        log.error(e);
        responses.serverError(res);
        return;
    }

    // For 2021 and beyond we wanted to add entry data to the sheet this takes care of this.
    try {
        // Have we already stored this entry?
        const entryRecorded = await storage.hasEntry(
            competition,
            incomingVote.entryId
        );
        if (!entryRecorded) {
            // No? Ok, let's find it!
            const parts = splitEntryId(incomingVote.entryId);
            const record = await fetchNeosRecord(parts.userId, parts.recordId);

            // Once we have it store it.
            // TODO 2023, filter RTF tags
            const res = await storage.storeEntry(competition, {
                entryId: incomingVote.entryId,
                category: categories.category || "",
                subcategory: categories.subcategory || "",
                name: record.name,
                tags: record.tags,
                blocked: false,
            });
        }
    } catch (e) {
        log.error("Failed to check entry status, your vote has not been cast");
        log.error(e);
        responses.serverError(res);
        return;
    }

    // Construct the vote, could probably just base this on the incoming vote but I don't want that to have junk so we'll construct that.
    const vote = {};

    vote.competition = competition;
    vote.category = categories.category;
    vote.subcategory = categories.subcategory;
    vote.entryId = incomingVote.entryId;

    // Username, userId, machineId, Registration date
    vote.username = neosUser.username;
    vote.userId = neosUser.id;
    vote.machineId = incomingVote.machineId;
    vote.registrationDate = new Date(neosUser.registrationDate);

    // Received timestamp, arrived timestamp, session id
    vote.receivedTimestamp = incomingVote.receivedTimestamp;
    vote.arrivedTimeStamp = incomingVote.arrivedTimeStamp;
    vote.sessionId = incomingVote.sessionId;

    // Freeze the Object, before we start messing with it. This doesn't do much but i put it here and i don't remember why.
    Object.freeze(vote);

    // Here begins the lovely try catch area, so we don't want the server to crash so that's why we're try catching everywhere
    try {
        log.info(
            `Recording vote for ${competition}->${vote.category}:${vote.subcategory}->${vote.entryId} and ${vote.username}`
        );
        await storage.storeVote(competition, vote);
    } catch (e) {
        // This means we screwed up somehow we log the error and then we bail out, we don't mark their vote as cast
        log.error(
            `Failed to save vote for ${competition}->${vote.category}:${vote.subcategory}->${vote.entryId} and ${vote.username}`
        );
        log.error(e);
        responses.serverError(res);
        return;
    }

    log.info(
        `Stored successful vote for ${competition}->${vote.category}:${vote.subcategory}->${vote.entryId} and ${vote.username}`
    );
    // This marks the "Everything is ok mark" past here everything is fine and we don't need to worry.
    responses.created(
        res,
        `Vote cast in ${vote.category}:${vote.subcategory} for ${vote.entryId},thank you`
    );
}
