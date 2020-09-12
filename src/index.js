const polka = require('polka');
const config = require('config');
const bodyParser = require('body-parser');

const handleVote = require('./handlers/handleVote');

const {authorizeMiddleware, parseBodyMiddleware} = require('./middlewares');

const port = config.get('port');


console.log('starting server');

// Starts the webserver, has the authorize and parse body middlewares which handle neos stuff.
polka()
    .use(bodyParser.text())
    .use(authorizeMiddleware)
    .use(parseBodyMiddleware)
    .post('vote/:competition/:category', handleVote)
    .listen(port);
