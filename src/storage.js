const Keyv = require('keyv');
const config = require('config');

const dbPath = config.get('dbPath');

// This database just stores the vote state, it exists purely because we don't want to scan the CSVs for a user
// This uses a more efficient method by storing a Key(the user id) to a value(vote state)

// Dictionary system which again provides or creates SQLite Storage providers for writing to our Database
const storageProviders = {};

const log = require('./log');

function getStorageProvider(competition, category) {
    if (!storageProviders[competition]) {
        storageProviders[competition] = {};
    }
    if (!storageProviders[competition][category]) {
        storageProviders[competition][category] = new Keyv(`sqlite://${dbPath}${competition}.db`);
    }
    return storageProviders[competition][category];
}

// Stores the fact that a userid that's given has voted
async function storeVoteState(competition, category, userId, count) {
    if (!count) count = 1;
    const provider = getStorageProvider(competition, category);
    return provider.set(getVotingKey(userId, category), count);
}

async function incrementVoteState(competition, category, userId) {
    let value = await getVotedState(competition, category, userId);
    if (value === undefined || value === null) {
        value = 0;
    }
    await storeVoteState(competition, category, userId, value + 1);
}

function getVotingKey(userId, category) {
    return `${userId}::${category}`;
}

// Gets a user's voting state
async function getVotedState(competition, category, userId) {
    const provider = getStorageProvider(competition, category);
    return provider.get(getVotingKey(userId, category));
}

// This is just used in debug scripts, it logs to the file as a warning
async function deleteUser(competition, category, userId) {
    log.warn(`Deleting ${competition}->${category}->${userId}, this shouldn't usually happen.`);
    const provider = getStorageProvider(competition, category);
    return provider.delete(getVotingKey(userId, category));
}

// Converts, the result of getVotedState into a boolean.
async function hasVoted(competition, category, userId) {
    const value = await getVotedState(competition, category, userId);
    if (value === undefined || value === null) {
        return false;
    }
    return true;
}

async function isAtVotingLimit(competition, category, userId) {
    const value = await getVotedState(competition, category, userId);
    if (value === undefined || value === null) {
        return false;
    }
    return value >= getVotingLimit(competition, category);
}

// This might look dumb but hey, we have the ability to make different limits for different categories now
const limit = config.get('votingLimit') || 5;
function getVotingLimit(competition, category) {
    return limit;
}

module.exports = {
    storeVoteState,
    hasVoted,
    deleteUser,
    isAtVotingLimit,
    incrementVoteState,
}
