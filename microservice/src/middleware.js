const redis = require('redis');
const NOT_AUTHORIZED = 401;

const client = redis.createClient({
    port      : 6379,               
    host      : 'redis',
});

const authMiddleware = (req, res, next) => {
    const authtoken = req.headers.authtoken;
    console.log("validating token with redis ", authtoken);

    if (!authtoken) {
        res.status(NOT_AUTHORIZED);
        res.send('No auth cookie attached');
        return;
    }

    console.log("calling redis...")
    client.get("sessionid", function(err, reply) {
        if(err){
            res.status(NOT_AUTHORIZED);
            res.send("Unable to verify token");
            return;
        }
        var sessionid = reply.split("###")[1];
        if(sessionid == authtoken){
            console.log("token valid")
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