// Just a series of shortcut functions which return various error codes. Lets me pick them up in logix more easily.
export function serverError(
    res,
    msg = "Try again later, your vote has NOT been cast"
) {
    respond(res, msg, 500);
}

export function notAuthorized(res, msg = "Not Authorized") {
    respond(res, msg, 401);
}

export function badRequest(res, msg = "Bad Request") {
    respond(res, msg, 400);
}

export function notFound(res, msg = "Not Found") {
    respond(res, msg, 404);
}

export function forbidden(res, msg = "Forbidden") {
    respond(res, msg, 403);
}

export function created(res, msg = "Voted, Thank you") {
    respond(res, msg, 201);
}

export function ok(res, msg = "Ok") {
    respond(res, msg, 200);
}

export function respond(res, msg, code) {
    res.statusCode = code;
    res.end(msg);
}
