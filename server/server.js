//require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');


const {mongoose} = require('./db/mongoose.js');
const {ObjectID} = require('mongodb');
var {User} = require('./models/user.js');
//var {authenticate} = require('./middleware/authenticate.js');

const port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());

app.post('/users' , (req , res) => {
  var body = _.pick(req.body , ['email' , 'password' , 'name', 'clients', 'transactions']);
  var user = new User({
    emailID : body.email,
    password : body.password,
    name : body.name,
    clients : body.clients,
    transactions : body.transactions
  });

  user.save().then((savedUser) => {
    res.send(savedUser);
  }).catch((e) => {
    res.status(400).send({'message': 'Unable to add user'});
  });
});








app.listen(port , () =>{
  console.log(`Started on port ${port}`);
});


module.exports = {
  app : app
};
