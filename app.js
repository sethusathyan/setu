const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const SCEHMEID = process.env.SCEHMEID ;
const SECRET = process.env.SECRET;
app.use(bodyParser.json());

//json

const checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, SECRET , (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        //to check the scheme id
        if (decoded.aud == SCEHMEID) {
            next();
        } else  {
            res.status(404).json({
                success: false,
                message: 'Wrong Scheme id'
            });
        }
      }

    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

const billsRoute = require('./routes/bills');
app.use(cors());
app.use('/bills', checkToken, billsRoute);


//Routes
app.get('/', (req, res) => {
    res.send('We are on home');

})

//Connect to DB
mongoose.connect(process.env.DB_CONNECTION,
 { useNewUrlParser: true },
 () => console.log('DB Connected')
);


//for listening
var port = process.env.PORT || 8080;
app.listen(port, function() {console.log('Our app is running on http://localhost:' + port);}); 