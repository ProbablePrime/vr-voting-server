const config = require('config');
const { once } = require('events');
const fs = require('fs');
const { parse } = require('json2csv');

const resultsPath = config.get('resultsPath');

const CR = '\r'
const LF = '\n'
const CRLF = CR + LF;

const streams = {};

// We use a dictionary of streams based on each competition. If we haven't seen this competition before we create a new stream for it
function createOrRetrieveStream(competition) {
    // First time we've seen this competition
    if (streams[competition] !== null) {
        // Flags: a means append mode, we're doing appending.
        streams[competition] = fs.createWriteStream(`${resultsPath}${competition}.csv`, {flags: 'a'});
    }
    return streams[competition];
}

async function storeResult(vote) {
    // This lets the webserver handle multiple votes and competitions at once
    const stream = createOrRetrieveStream(vote.competition);

    // I hate this thing, basically flattens the JSON to csv, i could do it manually but this will handle corrupt strings and all sorts. Nested commas are fun etc, this module will handle that.
    const csv = parse(vote, {header:false}) + LF;

    // We should catch errors
    if (!stream.write(csv)) {
        await once(stream, 'drain');
    }
}
module.exports = {storeResult};
