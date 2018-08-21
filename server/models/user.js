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
    minlength : 10,
    trim : true,
    default : null
  },
  GSTNumber : {
    type : String,
    trim : true,
    default : null
  },
  clients : [{
    clientName : {
      type : String,
      required : true,
      trim : true
    },
    clientPhoneNumber : {
      type : String,
      minlength : 10,
      trim : true,
      default : null
    },
    clientGSTNumber : {
      type : String,
      trim : true,
      default : null
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
      required : true,
      trim : true
    },
    date : {
      type : String,
      trim : true,
      default : null
    } ,
    photoURL : {
      type : String,
      default : null
    } ,
    remarks : {
      type : String,
      default : null
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

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject , ['_id' , 'emailID' , 'phoneNumber' , 'GSTNumber' , 'name']);
};


UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id : user._id.toHexString() , access:access} , 'abc123').toString();

  user.tokens = user.tokens.concat([{
    access: access ,
    token : token
  }]);

  return user.save().then(() => {
    return token;
  });
};



var User = mongoose.model('User' , UserSchema);

module.exports = {
  User : User
};
