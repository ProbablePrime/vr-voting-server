
import fs from 'fs';
//TODO: Pull from config
const COMP = 'mmc2022';

function backup(filename) {
    fs.copyFileSync('./db/' + filename + '.db', './backup/' + filename + new Date().getTime().toString() + '.db');
}

async function main() {
    backup(COMP + '_entries');
    backup(COMP + '_votes');

    process.exit();
}

main();
