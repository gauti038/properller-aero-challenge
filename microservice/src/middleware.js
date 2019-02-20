const request = require('request');

const NOT_AUTHORIZED = 401;
const AUTH_VERIFIER = 'http://monolith:8000/api/current_user/';

const authMiddleware = (req, res, next) => {
    const requestsource = req.headers.requestsource;
    if (requestsource != "external"){
        console.log("skipping token validation, since request is from internal source");
        return next();
    }
    const authtoken = req.headers.authtoken;
    console.log("validating token with monolith auth ", authtoken);

    if (!authtoken) {
        res.status(NOT_AUTHORIZED);
        res.send('No auth cookie attached');
        return;
    }

    var options = {
        uri: AUTH_VERIFIER,
        headers: { cookie: "csrftoken=VWegI; sessionid="+authtoken }
    }
    request(options, function(err, resp){
        if(err){
            res.status(NOT_AUTHORIZED);
            res.send("Unable to verify token");
            return;
        }
        if(resp.body != ''){
            next();
        }else{
            res.status(NOT_AUTHORIZED);
            res.send("Invalid authtoken");
            return;
        }
    });
  }

module.exports = {
    authMiddleware
}