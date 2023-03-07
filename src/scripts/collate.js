import { outputCSV, clearCSV } from "../csv.js";
import * as storage from "../storage.js";

import config from "config";

const competitions = config.get("competitions");

async function collate(competition) {
    const res = [];
    const entries = await storage.getEntries(competition);

    // VOTES
    let totalVotes = 0;
    for (let entry of entries) {
        const totals = await storage.countVotes(competition, entry.entryId);
        totalVotes += totals;
        const userId = entry.entryId.split(':')[0];
        res.push({userId:userId,name:entry.name, entryId: entry.entryId,category:entry.category,subcategory:entry.subcategory, votes: totals});
    }
    //clearCSV('mmc2022results');
    //clearCSV('mmc2022entries');

    outputCSV(competition + 'results', res);
    outputCSV(competition + 'entries', entries);

    console.log(`Total Votes: ${totalVotes}`);
    const usersCount = await storage.countUsers(competition);
    console.log(`Total Users: ${usersCount}`);
    console.log(`Ratio: ${totalVotes/usersCount}`);

    // Users
    const users = await storage.getUsers(competition);
    outputCSV(competition + 'users', users);
}

async function main() {

    for(const competition of competitions) {
        await collate(competition);
    }

    process.exit();
}

main();
