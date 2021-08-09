const config = require('config');
const { once } = require('events');
const fs = require('fs');
const { parse } = require('json2csv');

const resultsPath = config.get('resultsPath');

// Don't even ask, Windows uses CRLF, Unix uses LF. We use LF because i made this project and i get to decide.
const CR = '\r'
const LF = '\n'
const CRLF = CR + LF;

function outputCSV(filename, array) {
    const csv = parse(array, {header: true});
    fs.writeFileSync(`${resultsPath}${filename}.csv`, csv);
}

module.exports = {outputCSV};
