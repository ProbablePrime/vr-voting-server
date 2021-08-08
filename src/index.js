const polka = require("polka");
const config = require("config");
const bodyParser = require("body-parser");

const log = require("./log");
const handleVote = require("./handlers/handleVote");
const hasVoted = require("./handlers/hasVoted");
const state = require("./handlers/state");

const responses = require("./responses");

const {
    logStartMiddleware,
    authorizeMiddleware,
    parseBodyMiddleware,
} = require("./middlewares");

const port = config.get("port");

log.info("Starting voting server on port ", port);

// Starts the webserver, with a configuration based on the following configuration lines.
// each line is commented here for you:
// 1. Enables the body parser middleware, it parses the body of the request as Text
// 2. Authorize Middleware, double checks the request is authorized to access this webserver
// 3. Handles a vote request, uses a POST for posting the vote to the server
// 4. Handles a HAS VOTED request, checks if a user has voted. Uses GET
// 5. State, this powers the green orb in the world, if it fails to respond the server is down
// 6. Last line opens it on the port from the config file
polka()
    .use(bodyParser.text())
    .use(logStartMiddleware)
    .use(authorizeMiddleware)
    .post("vote/:competition/:category/:subcategory?", handleVote)
    .get("voted/:competition", hasVoted)
    .get("state", state)
    .listen(port);

log.info("Server started");
