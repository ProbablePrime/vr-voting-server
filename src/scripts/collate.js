const { outputCSV, clearCSV } = require("../csv");
const storage = require("../storage");



async function main() {
    const res = [];
    const entries = await storage.getEntries('mmc2021');

    for (let entry of entries) {
        const totals = await storage.countVotes('mmc2021', entry.entryId);
        res.push({entryId: entry.entryId, votes: totals});
    }
    clearCSV('mmc2021results');
    clearCSV('mmc2021entries');

    outputCSV('mmc2021results', res);
    outputCSV('mmc2021entries', entries);

    process.exit();
}

main();
