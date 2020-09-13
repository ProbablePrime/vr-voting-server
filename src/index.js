const polka = require('polka');
const config = require('config');
const bodyParser = require('body-parser');

const log = require('./log');
const handleVote = require('./handlers/handleVote');

const {logStartMiddleware, authorizeMiddleware, parseBodyMiddleware} = require('./middlewares');

const port = config.get('port');

log.info('Starting voting server on port ', port);

// Starts the webserver, has the authorize and parse body middlewares which handle neos stuff.
polka()
    .use(bodyParser.text())
    .use(logStartMiddleware)
    .use(authorizeMiddleware)
    .use(parseBodyMiddleware)
    .post('vote/:competition/:category', handleVote)
    .listen(port);

log.info('Server started');
