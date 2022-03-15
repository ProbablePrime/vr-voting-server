import { outputCSV, clearCSV } from "../csv.js";
import * as storage from "../storage.js";

//TODO: Pull from config
const COMP = "mmc2022"

async function main() {
    const res = [];
    const entries = await storage.getEntries(COMP);

    // VOTES
    let totalVotes = 0;
    for (let entry of entries) {
        const totals = await storage.countVotes(COMP, entry.entryId);
        totalVotes += totals;
        const userId = entry.entryId.split(':')[0];
        res.push({userId:userId,name:entry.name, entryId: entry.entryId,category:entry.category,subcategory:entry.subcategory, votes: totals});
    }
    //clearCSV('mmc2022results');
    //clearCSV('mmc2022entries');

    outputCSV(COMP + 'results', res);
    outputCSV(COMP + 'entries', entries);

    console.log(`Total Votes: ${totalVotes}`);
    const usersCount = await storage.countUsers(COMP);
    console.log(`Total Users: ${usersCount}`);
    console.log(`Ratio: ${totalVotes/usersCount}`);

    // Users
    const users = await storage.getUsers(COMP);
    outputCSV(COMP + 'users', users);


    process.exit();
}

main();
