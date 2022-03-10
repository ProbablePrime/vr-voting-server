import localhost from "local-hostname";
import config from "config"

import {log} from "./log.js";
import * as responses from "./responses.js";

const allowedHosts = config.get("allowedHosts");

export const logStartMiddleware = (req, res, next) => {
    log.info(`New request for ${req.method}, ${req.url}`);
    next();
};

// This basically checks if the IP/Host is local, It isn't secure at all but helps a little bit. Don't use it for anything security like
export const authorizeMiddleware = (req, res, next) => {
    // Checks if this request looks like a proxied request, this isn't good enough
    if (req.headers["x-forwarded-for"]) {
        //bail here
        log.warn(
            "Blocking forwarded request because it is likely a proxied request"
        );
        responses.forbidden(res);
        return;
    }

    // Checks if this is a local address using a module
    const ip = req.socket.remoteAddress;
    if (localhost(ip)) {
        next();
    }

    // Finally this allows us to override the above responses if we want to allow remote requests
    // Also adds some weirder localhost ips that the above stuff doesn't look at
    if (!allowedHosts.includes(ip)) {
        log.warn(`Blocking request from ${ip} it is not on the allow list`);
        responses.forbidden(res);
        // bail here
        return;
    }
    next();
};
