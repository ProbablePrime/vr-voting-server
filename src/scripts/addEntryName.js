import {fetchNeosRecord, splitEntryId} from '../neosapi.js';
import * as storage from "../storage";

async function main() {
    const res = [];
    const entries = await storage.getEntries('mmc2021');
    let totalVotes = 0;
    for (let entry of entries) {
        const parts = splitEntryId(entry.entryId);
        const record = await fetchNeosRecord(parts.userId, parts.recordId);
        entry.name = record.name;
        entry.tags = record.tags
        await storage.updateEntry('mmc2021', entry.entryId, entry);
    }
    process.exit();
}

main();
