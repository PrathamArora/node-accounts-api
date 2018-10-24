require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');


const {mongoose} = require('./db/mongoose.js');
const {ObjectID} = require('mongodb');
var {User} = require('./models/user.js');
var {Godown} = require('./models/godowns.js');
var {BuySell} = require('./models/buysellinventory.js');
var {authenticate} = require('./middleware/authenticate.js');

const port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());

app.post('/users' , (req , res) => {
   var body = _.pick(req.body , ['email' , 'password' , 'name', 'clients', 'transactions', 'shopAddress', 'godowns','dealsIn','plywoodTypes']);
   var user = new User({
    emailID : body.email,
    password : body.password,
    name : body.name,
    clients : body.clients,
    transactions : body.transactions,
    shopAddress : body.shopAddress
  });

  user.save().then((savedUser) => {
    res.send(savedUser);
  }).catch((e) => {
    console.log(e);
    res.status(400).send({'error': 'EmailID already exists'});
  });
});

app.get('/inventoryBuySell/me', authenticate , (req , res) => {
  BuySell.find({
    _userID : req.user._id
  }).then((allBuySellRecords) => {
    if( ! allBuySellRecords){
      res.status(404).send({'error' : 'No Records found'});
    }
    res.status(200).send(allBuySellRecords);
  }).catch((e) => {
    res.status(400).send({'error' : 'Invalid request'});
  });
});

app.get('/allGodowns/me', authenticate , (req , res) => {
  Godown.find({
    _userID : req.user._id
  }).then((allGodowns) => {
    if( ! allGodowns){
      res.status(404).send({'error' : 'No Records found'});
    }
    res.status(200).send(allGodowns);
  }).catch((e) => {
    res.status(400).send({'error' : 'Invalid request'});
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
  var body = _.pick(req.body , ['emailID' , 'password' , 'name', 'clients', 'transactions' , 'phoneNumber' , 'GSTNumber', 'shopAddress' , 'godowns', 'dealsIn' , 'plywoodTypes']);

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

    var godown = new Godown({
      _userID : user._id,
      _godownID : user.godowns[0]._id
    });

    godown.save().then(() => {
      var buysell = new BuySell({
        _userID : user._id
      });

      buysell.save().then(() => {
        return user.generateAuthToken();
      }).then((token) => {
        res.header('x-auth', token).send(user);
      }).catch((e) => {
        console.log(e);
        res.status(400).send({'error' : 'Email ID already exists'});
      });
    });

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

app.delete('/users/me/token' , authenticate , (req , res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send({'message' : 'Logged out successfully'});
  }).catch((e) => {
    res.status(400).send({'error' : 'Unable to process log out request'});
  });
});

app.post('/addClient' , authenticate , (req , res) => {
  var body = _.pick(req.body , ['clientName' , 'clientPhoneNumber' , 'clientGSTNumber' , 'remarks']);

  req.user.clients = req.user.clients.concat([{
    'clientName' : body.clientName,
    'clientPhoneNumber' : body.clientPhoneNumber,
    'clientGSTNumber' : body.clientGSTNumber ,
    'remarks' : body.remarks
  }]);

  req.user.save().then(() => {
    res.send(req.user);
  }).catch((e) => {
    res.status(400).send({'error' : 'Unable to add client'});
  });
});

app.post('/addGodown' , authenticate , (req, res) => {
  var body = _.pick(req.body , ['godownAddress' , 'godownName', 'godownRent']);

  req.user.godowns = req.user.godowns.concat([{
    'godownAddress' : body.godownAddress,
    'godownName' : body.godownName,
    'godownRent' : body.godownRent
  }]);

  req.user.save().then(() => {
    var godown = new Godown({
      '_userID' : req.user._id ,
      '_godownID' : req.user.godowns[req.user.godowns.length - 1]._id
    });

    godown.save().then(() => {
      res.send(req.user);
    }).catch((e) => {
      console.log(e);
      res.status(400).send({'error' : 'Godown already exists'});
    });

  }).catch((e) => {
    console.log(e);
    res.status(400).send({'error' : 'Unable to add Godown'});
  });
});

app.post('/addPlywoodType' , authenticate , (req , res) => {
  var body = _.pick(req.body , ['brandName', 'category' , 'subCategory' , 'height' , 'width' , 'thickness' , 'safetyStock']);

  req.user.plywoodTypes = req.user.plywoodTypes.concat([{
    'brandName' : body.brandName,
    'category' : body.category,
    'subCategory' : body.subCategory,
    'height' : body.height,
    'width' : body.width,
    'thickness' : body.thickness,
    'safetyStock' : body.safetyStock
  }]);

  req.user.save().then(() => {
    res.send(req.user);
  }).catch((e) => {
    console.log(e);
    res.status(400).send({'error' : 'Unable to add Plywood'});
  });
});


app.post('/sellPlywood' , authenticate , (req , res) => {
  var body = _.pick(req.body , ['date' , '_godownID' , '_plywoodID' , '_clientID' , '_transactionID' , 'pieces' , 'costperSquareFoot' , 'deliveryAddress']);

  BuySell.findOne({
    _userID : req.user._id
  }).then((buysell) => {
    if(! buysell){
      res.status(404).send({'error' : 'No Record found'});
    }

    buysell.plyWoodSell = buysell.plyWoodSell.concat([{
      'date' :  body.date,
      '_godownID' : body._godownID,
      '_plywoodID' : body._plywoodID,
      '_clientID' : body._clientID,
      '_transactionID' : body._transactionID ,
      'pieces' : body.pieces,
      'costperSquareFoot' : body.costperSquareFoot,
      'deliveryAddress' : body.deliveryAddress
    }]);

    buysell.save().then(() => {
      Godown.findOneAndUpdate({
        _userID : req.user._id,
        _godownID : body._godownID,
        'allPlywood._plywoodID' : body._plywoodID
      } , {
        $inc : {
            "allPlywood.$.pieces" : (-1)*body.pieces
        }
      } , {
            returnOriginal : false
      }).then((result) => {
        res.send({'message' : 'Plywood updated'})
      }).catch((e) => {
        console.log(e);
        res.status(404).send({'error' : 'Unable to update Plywood'});
      });
    }).catch((e) => {
      console.log(e);
      res.status(404).send({'error' : 'Unable to update Plywood'});
    });
  }).catch((e) => {
    console.log(e);
    res.status(404).send({'error' : 'Unable to update Plywood'});
  });
});


app.post('/buyPlywood' , authenticate , (req , res) => {
  var body = _.pick(req.body , ['date' , '_godownID' , '_plywoodID' , '_clientID' , '_transactionID' , 'pieces' , 'costperSquareFoot']);

  BuySell.findOne({
    _userID : req.user._id
  }).then((buysell) => {
    if(! buysell){
      res.status(404).send({'error' : 'No Record found'});
    }

    buysell.plyWoodBuy = buysell.plyWoodBuy.concat([{
      'date' :  body.date,
      '_godownID' : body._godownID,
      '_plywoodID' : body._plywoodID,
      '_clientID' : body._clientID,
      '_transactionID' : body._transactionID ,
      'pieces' : body.pieces,
      'costperSquareFoot' : body.costperSquareFoot
    }]);

    buysell.save().then(() => {
      // Update/add in Godown model

      Godown.findOne({
        _userID : req.user._id,
        _godownID : body._godownID
      }).then((godown) => {
        if(! godown){
          res.status(404).send({'error' : 'No Godown found'});
        }

        var found = false;
        for(i  = 0 ; i < godown.allPlywood.length ; i++){
          var plywood = godown.allPlywood[i];

          if(plywood['_plywoodID'] == body._plywoodID){
            found = true;
            break;
          }
        }

        if(found) {
          Godown.findOneAndUpdate({
            _userID : req.user._id,
            _godownID : body._godownID,
            'allPlywood._plywoodID' : body._plywoodID
          } , {
            $inc : {
              "allPlywood.$.pieces" : body.pieces
            }
          }, {
            returnOriginal : false
          }).then((result) => {
            res.send({'message' : 'Plywood updated'})
          }).catch((e) => {
            console.log(e);
            res.status(404).send({'error' : 'Unable to update plywoods'});
          });
        }else{
          godown.allPlywood = godown.allPlywood.concat([{
            '_plywoodID' : body._plywoodID,
            'pieces' : body.pieces
          }]);

          godown.save().then(() => {
            res.send({'message' : 'Plywood added'})
          }).catch((e) =>{
            console.log(e);
            res.status(404).send({'error' : 'Unable to add plywoods'});
          });
        }

      }).catch((e) => {
        console.log(e);
        res.status(404).send({'error' : 'No Godown found'});
      });

    }).catch((e) => {
      console.log(e);
      res.status(404).send({'error' : 'No Record found'});
    });
  });
});

app.post('/addTransaction' , authenticate , (req , res) => {
  var body = _.pick(req.body , ['_clientID' , 'amount' , 'nature' , 'date' , 'photoURL' , 'remarks']);

  req.user.transactions = req.user.transactions.concat([{
    '_clientID' : body._clientID,
    'amount' : body.amount,
    'nature' : body.nature,
    'date' : body.date,
    'photoURL' : body.photoURL ,
    'remarks' : body.remarks
  }]);

  req.user.save().then(() => {
    res.send(req.user);
  }).catch((e) => {
    res.status(400).send({'error' : 'Unable to add Transaction'});
  });
});

app.listen(port , () =>{
  console.log(`Started on port ${port}`);
});


module.exports = {
  app : app
};
