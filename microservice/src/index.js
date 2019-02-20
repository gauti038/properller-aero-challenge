const express = require('express')
const authMiddleware = require('./middleware').authMiddleware;

const app = express()

app.use(authMiddleware);

app.use((req, res) => {
    if (req.headers.requestsource == 'external'){
      res.send('Hello World!. Your authtoken is '+req.headers.authtoken);
    }else{
      res.send('Hello World');
    }
})
app.listen(3000, () => console.log('Express app listening on 3000'))
