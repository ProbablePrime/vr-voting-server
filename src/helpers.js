const config = require('config');

// Given a body array(usually sourced from CSV), and an object key for that array convert the array into an object.
// For example giving it ['potato', 4] as a body array and ['vegetable','amount'] as a params key you get an object
// {"vegetable":"potato", "amount": 4}, JSON is easier to work with.
function convertArray(paramsKey, body) {
    // Weird lengths can mess with the array so we block them here.
    if (body.length !== paramsKey.length) {
        throw new Error(`Invalid Request Body, Expected: ${paramsKey.length} params but got ${body.length} params.`);
    }
    // Just a simple for loop at this point that maps index to index, key[i] = body[i]
    const ret = {};
    paramsKey.forEach((value,index) => {
        ret[value] = body[index];
    });
    return ret;
}


const competitions = config.get('competitions');
const categories = config.get('categories');
const mainCategories = Object.keys(categories);

// Is this a valid competition and category, uses the configuration files
function validateVoteTarget(competition, incomingCategories) {
    return competitions.includes(competition) && validateCategories(incomingCategories);
}

function validateCategories(incomingCategories) {
    if (!mainCategories.includes(incomingCategories.category)) return false;

    const subcategories = categories[incomingCategories.category];
    if(!subcategories.includes(incomingCategories.subcategory)) return false;

    return true;
}

// Just a helper function to ensure we're getting these in a standard format that won't break anywhere else.
function extractCategories(req) {
    const ret = {};
    if(req.category) {
        ret.category = req.category;
    }
    if(req.subcategory) {
        ret.subcategory = req.subcategory;
    }
    return ret;
}

// Simple includes check for if this vote target is blocked from voting in the config.
const blocked = config.get('blocked');
function isBlocked(voteTarget) {
    return blocked.includes(voteTarget);
}

module.exports = { convertArray, validateVoteTarget, isBlocked, extractCategories };
