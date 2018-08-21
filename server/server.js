//require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');


const {mongoose} = require('./db/mongoose.js');
const {ObjectID} = require('mongodb');
var {Student} = require('./models/student.js');
var {Attendance} = require('./models/attendance.js');
//var {authenticate} = require('./middleware/authenticate.js');

var app = express();
app.use(bodyParser.json());




















const port = 3000;
app.listen(port , () =>{
  console.log(`Started on port ${port}`);
});


module.exports = {
  app : app
};
