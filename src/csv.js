import config from 'config';
import fs from 'fs';
import { parse } from 'json2csv';

const resultsPath = config.get('resultsPath');

// Don't even ask, Windows uses CRLF, Unix uses LF. We use LF because i made this project and i get to decide.
const CR = '\r'
const LF = '\n'
const CRLF = CR + LF;

export function outputCSV(filename, array) {
    const csv = parse(array, {header: true});
    fs.writeFileSync(`${resultsPath}${filename}.csv`, csv);
}

export function clearCSV(filename) {
    fs.unlinkSync(`${resultsPath}${filename}.csv`);
}
