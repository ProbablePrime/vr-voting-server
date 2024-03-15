import {fetchAPIRecord, splitEntryId} from '../api.js';
import * as storage from "../storage";

const competition = "mmc2024";
async function main() {
    const entries = await storage.getEntries(competition);
    for (let entry of entries) {
        const parts = splitEntryId(entry.entryId);
        const record = await fetchAPIRecord(parts.userId, parts.recordId);
        entry.name = record.name;
        entry.tags = record.tags
        await storage.updateEntry(competition, entry.entryId, entry);
    }
    process.exit();
}

main();
