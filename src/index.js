import polka from "polka";
import config from "config";
import bodyParser from "body-parser";

import {log} from "./log.js";
import {handleVote} from "./handlers/handleVote.js";
import {hasVoted} from "./handlers/hasVoted.js";
import {state} from "./handlers/state.js";

import {
    logStartMiddleware,
    authorizeMiddleware
} from "./middlewares.js";

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
    //.use(authorizeMiddleware) Remove as we're moving to docker
    .post("vote/:competition/:category/:subcategory?", handleVote)
    .get("voted/:competition", hasVoted)
    .get("state", state)
    .listen(port);

log.info("Server started");
