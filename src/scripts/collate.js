import { outputCSV, clearCSV } from "../csv.js";
import * as storage from "../storage.js";

async function main() {
    const res = [];
    const entries = await storage.getEntries('mmc2021');

    // VOTES
    let totalVotes = 0;
    for (let entry of entries) {
        const totals = await storage.countVotes('mmc2021', entry.entryId);
        totalVotes += totals;
        const userId = entry.entryId.split(':')[0];
        res.push({userId:userId,name:entry.name, entryId: entry.entryId,category:entry.category,subcategory:entry.subcategory, votes: totals});
    }
    clearCSV('mmc2021results');
    clearCSV('mmc2021entries');

    outputCSV('mmc2021results', res);
    outputCSV('mmc2021entries', entries);

    console.log(`Total Votes: ${totalVotes}`);
    const usersCount = await storage.countUsers('mmc2021');
    console.log(`Total Users: ${usersCount}`);
    console.log(`Ratio: ${totalVotes/usersCount}`);

    // Users
    const users = await storage.getUsers('mmc2021');
    outputCSV('mmc2021users', users);


    process.exit();
}

main();
