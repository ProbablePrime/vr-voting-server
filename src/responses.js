// Just a shortcut function
function serverError(res, msg = 'Try again later, your vote has NOT been cast') {
    respond(res, msg, 500);
}

function notAuthorized(res, msg = 'Not Authorized') {
    respond(res, msg, 401);
}

function badRequest(res, msg = 'Bad Request') {
    respond(res, msg, 400);
}

function notFound(res, msg = 'Not Found') {
    respond(res, msg, 404);
}

function forbidden(res, msg ='Forbidden') {
    respond(res, msg, 403);
}

function created(res, msg='Voted, Thank you') {
    respond(res, msg, 201);
}

function ok(res, msg = 'Ok') {
    respond(res, msg, 200);
}

function respond(res, msg, code) {
    res.statusCode = code;
    res.end(msg);
}

module.exports = {
    serverError,
    notAuthorized,
    badRequest,
    forbidden,
    ok,
    notFound,
    created,
};
