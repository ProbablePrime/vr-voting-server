const config = require('config');

const bluefill = require('bluefill');

const storage = require('./storage');

const categories = config.get('categories');
//Promise.map(categories, (item) => storage.storeVoteState('mmc', item, 'U-ProbablePrime')).then((res) => console.log(res));
Promise.map(categories, (item) => storage.deleteUser('mmc', item, 'U-ProbablePrime')).then((res) => console.log(res));

