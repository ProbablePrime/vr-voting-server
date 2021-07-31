const Datastore = require('nedb-promises')
let datastore = Datastore.create('/path/to/db.db');

const config = require('config');

const dbPath = config.get('dbPath');

// This database just stores the vote state, it exists purely because we don't want to scan the CSVs for a user
// This uses a more efficient method by storing a Key(the user id) to a value(vote state)

// Dictionary system which again provides or creates SQLite Storage providers for writing to our Database
const storageProviders = {};

const log = require('./log');

function getStorageProvider(competition) {
    if (!storageProviders[competition]) {
        storageProviders[competition] = {};
    }
    if (!storageProviders[competition]) {
        storageProviders[competition] = Datastore.create(`${dbPath}${competition}.db`);
    }
    return storageProviders[competition];
}

// Stores the fact that a user id that's given has voted
async function storeVote(competition, vote) {
    const provider = getStorageProvider(competition);
    return provider.insert([vote]);
}

// This is just used in debug scripts, it logs to the file as a warning
async function deleteUser(competition, category, userId) {
    log.warn(`Deleting ${competition}->${category}->${userId}, this shouldn't usually happen.`);
    const provider = getStorageProvider(competition);
    return provider.delete(getVotingKey(userId, category));
}

// Converts, the result of getVotedState into a boolean.
async function hasVoted(competition, userId, entryId) {
    const provider = getStorageProvider(competition);

    const res = await provider.find({userId,entryId}).exec();
    return res.length > 0;
}

module.exports = {
    storeVote,
    hasVoted,
    deleteUser,
}
