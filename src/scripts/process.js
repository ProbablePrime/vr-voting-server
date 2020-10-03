const fs = require('fs');
const config = require('config');
const csv = require('csv-parser');
const results = require('../results');

const competitions = config.get('competitions');
const categories = config.get('categories');

const headers = ['comp', 'category', 'vote', 'username', 'userId', 'machineId', 'registrationDate', 'rawTimestamp', 'rawTimestamp2', 'sessionId'];

// This is a complete mess, I don't suggest following this properly, or using it to form any opinion on how to process results, Excel was just giving me a headache so i made this instead :)

competitions.forEach(comp => processComp(comp));

// Just gets the CSV into a usable form again
function processComp(comp) {
    const results = [];
    fs.createReadStream(`results/${comp}.csv`)
    .pipe(csv({headers:headers}))
    .on('data', (data) => results.push(data))
    .on('end', () => collateResults(results));
}

function collateResults(results) {

    const resultsTable = {};

    // Give each category an empty object in the results table
    categories.forEach(category => resultsTable[category] = {});

    // Loop over our results
    results.forEach(result => {
        // this is the target object we put the count into
        const target = resultsTable[result.category];

        //Do we already have an object property for this vote target?
        if(target[result.vote]) {
            // If we do add 1 to its total
            target[result.vote] += 1;
        } else {
            // Otherwise create it and set it to 1
            target[result.vote] = 1;
        }
    });
    // Log everything yay
    console.log(resultsTable);
}

