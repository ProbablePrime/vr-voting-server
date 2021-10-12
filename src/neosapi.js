const fetch = require("node-fetch");

const userPath = "https://www.neosvr-api.com/api/users/";

// Fetch a use record from neos' api, very simple but nice to be contained.
async function fetchNeosUser(userId) {
    return fetch(`${userPath}${userId}`).then((res) => res.json());
}
// https://www.neosvr-api.com/api/users/U-usutabiga/records/R-811e9068-9680-4703-9792-c92423f7e7f6
async function fetchNeosRecord(userId, recordId) {
    return fetch(`${userPath}${userId}/records/${recordId}`).then((res) => res.json());
}

module.exports = { fetchNeosUser, fetchNeosRecord };
