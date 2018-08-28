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
    minlength : 8,
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
      minlength : 8,
      trim : true,
      default : null
    },
    clientGSTNumber : {
      type : String,
      trim : true,
      default : null
    },
    remarks : {
      type : String,
      default : null
    }
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

    return _.pick(userObject , ['_id' , 'emailID' , 'phoneNumber' , 'GSTNumber' , 'name' , 'transactions' , 'clients', 'tokens']);
};


UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id : user._id.toHexString() , access:access} , process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{
    access: access ,
    token : token
  }]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try{
    decoded = jwt.verify(token , process.env.JWT_SECRET);
  }catch(e){
    return new Promise((resolve , reject) => {
      reject({'message' : 'Needs authentication' , 'status' : 401});
    });
  }

  return User.findOne({
    '_id' : decoded._id,
    'tokens.token' : token ,
    'tokens.access' : 'auth'
  });
};


UserSchema.statics.findByCredentials = function(emailID , password){
    var User = this;
    return User.findOne({emailID : emailID}).then((user) => {
      if(!user){
        return Promise.reject({'error' : 'Invalid Email ID and/or password'});
      }

      return new Promise((resolve , reject) => {
        bcrypt.compare(password , user.password , (err , res) => {
          if(!res){
            reject({'error' : 'Invalid Email ID and/or password'});
          }
          resolve(user);
        });
      });
    });
};


UserSchema.methods.removeToken = function(token) {
  var user = this;

  return user.update({
    $pull :{
        tokens: {
          token : token
        }
    }
  });
};


UserSchema.pre('save' , function(next) {
  var user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10 , (err , salt)=> {
      bcrypt.hash(user.password , salt , (err , hash) => {
        user.password = hash;
        next();
      });
    });
  } else{
    next();
  }
});


var User = mongoose.model('User' , UserSchema);

module.exports = {
  User : User
};
