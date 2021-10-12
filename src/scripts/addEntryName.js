const {fetchNeosRecord} = require('../neosapi');
const storage = require("../storage");

async function main() {
    const res = [];
    const entries = await storage.getEntries('mmc2021');
    let totalVotes = 0;
    for (let entry of entries) {
        const parts = entry.entryId.split(':');
        const record = await fetchNeosRecord(parts[0], parts[1]);
        entry.name = record.name;
        entry.tags = record.tags
        await storage.updateEntry('mmc2021', entry.entryId, entry);
    }
    process.exit();
}

main();
