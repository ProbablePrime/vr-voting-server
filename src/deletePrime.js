const config = require("config");

const bluefill = require("bluefill");

const storage = require("./storage");

/**
 * This is just a test script that removes me from the storage system. It only removes me and even when it does it still leaves stuff  in the logs.
 * I committed this to the repo because I need it for testing.
 */

const categories = config.get("categories");
// This sets me as voting in each category
//Promise.map(categories, (item) => storage.storeVoteState('mmc', item, 'U-ProbablePrime')).then((res) => console.log(res));

// This sets me as not voting in each category
Promise.map(categories, (item) =>
    storage.deleteUser("mmc", item, "U-ProbablePrime")
).then((res) => console.log(res));
