const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var GodownSchema = new mongoose.Schema({
  _userID : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  },
  _godownID : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  },
  allPlywood : [{
    _plywoodID : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    pieces : {
      type : Number,
      required : true,
      trim : true
    }
  }]
});

GodownSchema.methods.toJSON = function() {
  var godown = this;
  var godownObject = godown.toObject();

  return _.pick(godownObject , ['_userID' , '_godownID' , 'allPlywood']);
};


var Godown = mongoose.model('Godown' , GodownSchema);

module.exports = {
  Godown : Godown
};

















// Godown.findOne({
//   _userID : req.user._id,
//   _godownID : body._godownID
// }).then((godown) => {
//   if(! godown){
//
//   }
//
//   var allPlywood = godown.allPlywood;
//
//   for(int i = 0 ; i < allPlywood.length ; i++){
//     var ply = allPlywood[i];
//     if(ply['_plywoodID'] == body._plywoodID){
//       var newpieces = ply['pieces'] + body.pieces;
//
//       var newPlyRecord = {
//         '_plywoodID' : body._plywoodID,
//         'pieces' : newpieces
//       }
//
//       allPlywood.splice(i , 1 , newPlyRecord);
//
//
//
//     }
//
//
//   }
//
// })











// Godown.findOneAndUpdate({
//   _userID : req.user._id,
//   _godownID : body._godownID,
//   'allPlywood._plywoodID' : body._plywoodID
// } , {
//   $set : {
//      'allPlywood.$._plywoodID' : body._plywoodID
//   },
//   $inc : {
//     'allPlywood.$.pieces' : body.pieces
//   }
// } , {
//   upsert : true
// }).then((godown) => {
//   console.log(godown);
// }).catch((e) => {
//   console.log(e);
//   res.status(400).send({'error' : 'Updation Error'});
// });
