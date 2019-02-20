const fetch = require('node-fetch');

const AUTH_COOKIE_NAME = 'sessionid';
const NOT_AUTHORIZED = 401;
const AUTH_VERIFIER = 'http://monolith:8000/api/current_user/';

const authMiddleware = async (ctx, next) => {
    // const authCookie = ctx.cookies.get(AUTH_COOKIE_NAME);

    const requestsource = ctx.request.headers.requestsource;
    console.log("======= TOKEN VALIDATION CALLED ========")
    if (requestsource != "external"){
        console.log("skipping token validation, since request is from internal source");
        next();
        return;
    }
    console.log("validating token with monolith auth");
    const authtoken = ctx.header.authtoken;

    if (!authtoken) {
        ctx.throw(NOT_AUTHORIZED, 'No auth cookie attached');
    }

    try {
        await fetch(
            AUTH_VERIFIER,
            { headers: { cookie: `${AUTH_COOKIE_NAME}=${authtoken}` } }
        );
    } catch (error) {
        ctx.throw(NOT_AUTHORIZED, `Unable to verify cookie: ${error}`);
    }

    await next();
}

module.exports = {
    authMiddleware
}