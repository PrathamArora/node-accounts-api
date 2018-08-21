const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,
    minlength : 1,
    trim : true
  } ,
  emailID : {
    type : String,
    required : true,
    minlength : 1,
    trim : true,
    unique : true,
    validate : {
      validator : (value) => {
        return validator.isEmail(value);
      },
      message : '{VALUE} used is not a valid email ID'
    }
  } ,
  password : {
    type : String,
    required : true,
    minlength : 6,
    trim: true
  },
  phoneNumber : {
    type : String,
    minlength : 10
  },
  GSTNumber : {
    type : String
  },
  clients : [{
    clientName : {
      type : String,
      required : true
    },
    clientPhoneNumber : {
      type : String,
      minlength : 10
    },
    clientGSTNumber : {
      type : String
    },
  }],
  transactions : [{
    _clientID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    amount : {
      type : Number,
      required : true,
      trim : true
    },
    nature : {
      type : String,
      required : true
    },
    date : {
      type : String
    } ,
    photoURL : {
      type : String
    }
  }],
  tokens : [{
    access : {
      type : String,
      required : true
    },
    token : {
      type : String,
      required : true
    }
  }]
});

var User = mongoose.model('User' , UseSchema);

module.exports = {
  User : User
};
