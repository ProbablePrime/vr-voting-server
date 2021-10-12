const Datastore = require("nedb-promises");
let datastore = Datastore.create("/path/to/db.db");

const config = require("config");

const dbPath = config.get("dbPath");

// Dictionary system which again provides or creates SQLite Storage providers for writing to our Database
const storageProviders = {};

const log = require("./log");

function getStorageProvider(competition, type) {
    if (!storageProviders[competition]) {
        storageProviders[competition] = {};
    }
    if (!storageProviders[competition][type]) {
        storageProviders[competition][type] = Datastore.create(
            `${dbPath}${competition}_${type}.db`
        );
    }
    return storageProviders[competition][type];
}

// Stores the fact that a user id that's given has voted
async function storeVote(competition, vote) {
    const provider = getStorageProvider(competition, "votes");
    return await provider.insert(vote);
}

// This is just used in debug scripts, it logs to the file as a warning
async function deleteUser(competition, category, userId) {
    // This is broken right now TODO
    // log.warn(`Deleting ${competition}->${category}->${userId}, this shouldn't usually happen.`);
    // const provider = getStorageProvider(competition);
    // return provider.delete(getVotingKey(userId, category));
}

async function hasEntry(competition, entryId) {
    const provider = getStorageProvider(competition, "entries");
    const res = await provider.count({ entryId }).exec();
    return res > 0;
}

async function storeEntry(competition, entry) {
    const provider = getStorageProvider(competition, "entries");
    return await provider.insert(entry);
}

// Converts, the result of getVotedState into a boolean.
async function hasVoted(competition, userId, entryId) {
    const provider = getStorageProvider(competition, "votes");

    const res = await provider.count({ userId, entryId }).exec();
    return res > 0;
}

async function getEntries(competition) {
    const provider = getStorageProvider(competition, "entries");

    const res = await provider.find({}).exec();
    return res;
}

async function updateEntry(competition, entryId, entryData) {
    const provider = getStorageProvider(competition, "entries");

    const res = await provider.update({entryId}, entryData);
    return res;
}

async function countVotes(competition, entryId) {
    const provider = getStorageProvider(competition, "votes");

    const res = await provider.count({ entryId }).exec();

    return res;
}

//TODO 2022, this is uh just all the votes... we need to distinct by userId....
async function getUsers(competition) {
    const provider = getStorageProvider(competition, "votes");

    const res = await provider.find({}).exec();

    return res;
}

async function countUsers(competition) {
    const provider = getStorageProvider(competition, "votes");

    const res = await provider.find({}).exec();
    const ids = {};
    res.forEach(vote => {
        if (!ids[vote.userId]) {
            ids[vote.userId] = 1;
        }
    });
    return Object.keys(ids).length;
}

module.exports = {
    storeVote,
    hasVoted,
    deleteUser,
    storeEntry,
    hasEntry,
    getEntries,
    countVotes,
    countUsers,
    updateEntry,
    getUsers
};
