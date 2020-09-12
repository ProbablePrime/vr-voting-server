const fetch = require('node-fetch');

const userPath = 'https://www.neosvr-api.com/api/users/';
// Async await is king!, here we use the Neos API to fetch their api record
async function fetchNeosUser(userId) {
    return fetch(`${userPath}${userId}`).then(res => res.json());
}

module.exports = {fetchNeosUser};
