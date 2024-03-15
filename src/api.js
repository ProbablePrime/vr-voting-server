import fetch from "node-fetch";

const userPath = "https://api.resonite.com/users/";

// Fetch a user record from api, very simple but nice to be contained.
export async function fetchAPIUser(userId) {
    return fetch(`${userPath}${userId}`).then((res) => res.json());
}

// https://api..com/api/users/U-usutabiga/records/R-811e9068-9680-4703-9792-c92423f7e7f6
export async function fetchAPIRecord(userId, recordId) {
    return fetch(`${userPath}${userId}/records/${recordId}`).then((res) => res.json());
}

export function splitEntryId(entryId) {
    if (!entryId.includes(":")) {
        throw new Error("This is not a valid entryID: "+ entryId);
    }
    const parts = entryId.split(':');
    return {
        userId: parts[0],
        recordId: parts[1]
    }
}
