const config = require('config');

function convertArray(paramsKey, body) {
    console.log(body.length, paramsKey.length);
    if (body.length !== paramsKey.length) {
        throw new Error('Invalid Request Body');
    }
    const ret = {};
    paramsKey.forEach((value,index) => {
        ret[value] = body[index];
    });
    return ret;
}

const competitions = config.get('competitions');
const categories = config.get('categories');

function validateVoteTarget(competition, category) {
    return competitions.includes(competition) && categories.includes(category);
}


module.exports = { convertArray, validateVoteTarget };
