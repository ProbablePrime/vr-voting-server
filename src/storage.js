const Keyv = require('keyv');
const config = require('config');

const dbPath = config.get('dbPath');

const storageProviders = {};

function getStorageProvider(competition, category) {
    if (!storageProviders[competition]) {
        storageProviders[competition] = {};
    }
    if (!storageProviders[competition][category]) {
        storageProviders[competition][category] = new Keyv(`sqlite://${dbPath}${competition}`, { namespace: category});
    }
    return storageProviders[competition][category];
}

async function storeVoteState(competition, category, userId) {
    const provider = getStorageProvider(competition, category);
    return provider.set(userId, true);
}

async function getVotedState(competition, category, userId) {
    const provider = getStorageProvider(competition, category);
    return provider.get(userId);
}

async function hasVoted(competition, category, userId) {
    const value = await getVotedState(competition, category, userId);
    if (value === undefined || value === null) {
        return false;
    }
    return value;
}

module.exports = {
    storeVoteState,
    hasVoted,
}
