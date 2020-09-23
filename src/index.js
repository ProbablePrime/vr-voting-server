const polka = require('polka');
const config = require('config');
const bodyParser = require('body-parser');

const log = require('./log');
const handleVote = require('./handlers/handleVote');
const hasVoted = require('./handlers/hasVoted');

const responses = require('./responses');

const {logStartMiddleware, authorizeMiddleware, parseBodyMiddleware} = require('./middlewares');

const port = config.get('port');

log.info('Starting voting server on port ', port);

// Starts the webserver, with a configuration
polka()
    .use(bodyParser.text())
    .use(logStartMiddleware)
    .use(authorizeMiddleware)
    .post('vote/:competition/:category', handleVote)
    .get('vote/:competition/:category', hasVoted)
    .get('state', (req, res) => {
        responses.ok(res, '1');
        res.end();
    })
    .listen(port);

log.info('Server started');
