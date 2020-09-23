const config = require('config');
const { once } = require('events');
const fs = require('fs');
const { parse } = require('json2csv');

const resultsPath = config.get('resultsPath');

// Don't even ask, Windows uses CRLF, Unix uses LF. We use LF because i made this project and i get to decide.
const CR = '\r'
const LF = '\n'
const CRLF = CR + LF;

// Dictionary for results streams
const streams = {};

// We use a dictionary of streams based on each competition. If we haven't seen this competition before we create a new stream for it
function createOrRetrieveStream(competition) {
    // First time we've seen this competition
    if (streams[competition] !== null) {
        // Flags: a means append mode, we're doing appending only as we may have multiple requests writing to this file
        streams[competition] = fs.createWriteStream(`${resultsPath}${competition}.csv`, {flags: 'a'});
    }
    return streams[competition];
}

async function storeResult(vote) {
    // This lets the webserver handle multiple votes and competitions at once, by fetching the streams
    const stream = createOrRetrieveStream(vote.competition);

    // I hate this thing, basically flattens the JSON to csv, i could do it manually but this will handle corrupt strings and all sorts. Nested commas are fun etc, this module will handle that.
    const csv = parse(vote, {header:false}) + LF;

    // This waits for the stream to drain, as in flush results to a file before returning.
    // We should catch errors
    if (!stream.write(csv)) {
        await once(stream, 'drain');
    }
}
module.exports = {storeResult};
