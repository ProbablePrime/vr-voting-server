const fetch = require('node-fetch');

const userPath = 'https://www.neosvr-api.com/api/users/';

// Fetch a use record from neos' api, very simple but nice to be contained.
async function fetchNeosUser(userId) {
    return fetch(`${userPath}${userId}`).then(res => res.json());
}

module.exports = {fetchNeosUser};
