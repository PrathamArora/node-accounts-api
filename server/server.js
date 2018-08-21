//require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');


const {mongoose} = require('./db/mongoose.js');
const {ObjectID} = require('mongodb');
var {User} = require('./models/user.js');
var {authenticate} = require('./middleware/authenticate.js');

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
    console.log(e);
    res.status(400).send({'error': 'EmailID already exists'});
  });
});

app.get('/users' , (req , res)=>{
  User.find().then((users) => {
    if(! users){
      res.status(404).send({'error' : 'No users found'});
    }
    res.status(200).send(users);
  }).catch((e) => {
    res.status(400).send({'error' : 'Invalid request'});
  });
});

app.post('/userSignIn' , (req , res) => {
  var body = _.pick(req.body , ['emailID' , 'password' , 'name', 'clients', 'transactions' , 'phoneNumber' , 'GSTNumber']);

  // var user = new User({
  //   emailID : body.emailID,
  //   password : body.password,
  //   name : body.name,
  //   clients : body.clients,
  //   transactions : body.transactions,
  //   phoneNumber : body.phoneNumber,
  //   GSTNumber : body.GSTNumber
  // });

  var user = new User(body);

  user.save().then(() => {
    if(! user){
      res.status(404).send({'error' : 'Unable to Sign In'});
    }

    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) =>{
    console.log(e);
    res.status(400).send({'error' : 'Email ID already exists'});
  });
});

app.get('/users/me' , authenticate ,(req , res) => {
  res.send(req.user);
});

app.post('/users/login' , (req , res) => {
  var body = _.pick(req.body , ['emailID' , 'password']);

  User.findByCredentials(body.emailID , body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth' , token).send(user);
    });
  }).catch((e) => {
    res.status(400).send({'error' : 'Invalid Email ID and/or password'});
  });
});


app.listen(port , () =>{
  console.log(`Started on port ${port}`);
});


module.exports = {
  app : app
};
