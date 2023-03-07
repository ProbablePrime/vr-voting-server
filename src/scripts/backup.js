
import fs from 'fs';

import config from "config";

const competitions = config.get("competitions");

function backup(filename) {
    fs.copyFileSync('./db/' + filename + '.db', './backup/' + filename + new Date().getTime().toString() + '.db');
}

async function main() {
    for (const competition of competitions) {
        backup(competition + '_entries');
        backup(competition + '_votes');
    }
    process.exit();
}

main();
