const express = require('express')
const Auth = require('./middleware');

const app = express();


app.get('/microservice', Auth.authMiddleware, function(req, res) {
    res.send('Hello World!. Your authtoken is '+req.headers.authtoken);
});

// app.post('/setToken', function(req, res){
  
// });

app.listen(3000, () => console.log('Express app listening on 3000'))
