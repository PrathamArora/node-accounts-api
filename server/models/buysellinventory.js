const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var BuySellSchema = new mongoose.Schema({
  _userID : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    unique : true
  },
  plyWoodBuy : [{
    date : {
      type : String,
      trim : true,
      required : true
    } ,
    _godownID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    _plywoodID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    _clientID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    } ,
    _transactionID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    } ,
    pieces : {
      type : Number,
      required : true,
      trim : true
    },
    costperSquareFoot : {
      type : Number,
      required : true,
      trim : true
    }
  }],
  plyWoodSell : [{
    date : {
      type : String,
      trim : true,
      required : true
    } ,
    _godownID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    _plywoodID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    _clientID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    } ,
    _transactionID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    } ,
    pieces : {
      type : Number,
      required : true,
      trim : true
    },
    costperSquareFoot : {
      type : Number,
      required : true,
      trim : true
    },
    deliveryAddress : {
      type : String,
      required : true,
      trim : true
    }
  }]
});


BuySellSchema.methods.toJSON = function() {
  var buysell = this;
  var buysellObject = buysell.toObject();

  return _.pick(buysellObject , ['_userID' , 'plyWoodBuy' , 'plyWoodSell']);
};


var BuySell = mongoose.model('BuySell' , BuySellSchema);

module.exports = {
  BuySell : BuySell
};
