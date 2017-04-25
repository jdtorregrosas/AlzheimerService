// server.js

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var User = require('./models/user');
var firebase = require("firebase-admin");
var serviceAccount = require("./brein-78ed7-firebase-adminsdk-32ruk-c0cfce67fe.json");
var validateUser = require('./models/user').validateUser;
var validateUserWOCredentials = require('./models/user').validateUserWOCredentials;
var validateAuthUser = require('./models/auth').validateAuthUser;
var validateChangePassword = require('./models/auth').validateChangePassword;

const Joi = require('joi');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brein-78ed7.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("alzheimer_db");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

// router.use(function(req, res, next) {
//     //console.log('Something is happening.');
//     next();
// });

// Users: get all
router.route('/users')
.get(function(req, res) {
    var usersRef = ref.child("users");
    usersRef.once("value", function(snapshot) {
      res.json(snapshot.val());
    }, function (errorObject) {
      res.json({error: errorObject});
    });
})
.post(function(req, res) { // Users: create new user
  validateUser(req.body).then((user) => {
    var userRef = ref.child("users/"+user.username);
    userRef.once("value", function(obj) {
      console.log(obj.val());
      if(obj.val() == null){
        var users = ref.child("users");
        user.password = new Buffer(user.password).toString('base64');
        users.child(user.username).set(user);
        res.json(user);
      } else {
        res.status(409).json({error: 'User already exists'});
      }
    });
  }).catch((err) => {
    res.status(400).json({error: err});
  });
});
// Users: get one user
router.route('/users/:username')
.get(function(req, res) {
  var username = req.params.username;
  var usersRef = ref.child("users/"+username);
  usersRef.once("value", function(obj) {
    if(obj.val() == null){
      res.status(404).json({error: 'User not found'});
    } else {
      res.json(obj.val());
    }
  }, function (err) {
    res.status(404).json(err);
  });
}).put(function(req, res) { // Users: edit user
  var username = req.params.username;
  validateUserWOCredentials(req.body).then((user) => {
    var userRef = ref.child("users/"+username);
    userRef.once("value", function(obj) {
      if(obj.val() == null){
        res.status(404).json({error: 'User not found'});
      } else {
        var users = ref.child("users");
        user.username = obj.val().username;
        user.password = obj.val().password;
        users.child(username).set(user);
        res.json(user);
      }
    });
  }).catch((err) => {
    res.status(400).json(err);
  });
});
// Authentication
router.route('/auth')
.post(function(req, res) {
  validateAuthUser(req.body).then((user) => {
    var username = user.username;
    var password = user.password;
    var usersRef = ref.child("users/"+username);
    usersRef.once("value", function(snapshot) {
      var passwordEncoded = new Buffer(password).toString('base64');
      if(snapshot.val() == null){
        res.status(404).json({error: 'User not found'});
      } else {
        if(snapshot.val().password == passwordEncoded){
          res.json(snapshot.val());
        } else {
          res.status(401).json({error: "Unauthorized"});
        }
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      res.status(400).json({error: errorObject});
    });
  }).catch((err) => {
    res.status(400).json({error: err});
  });
});
// Change password
router.route('/changePassword/:username')
.post(function(req, res) {
  var username = req.params.username;
  validateChangePassword(req.body).then((pass) => {
    var oldPassword = pass.oldPassword;
    var newPassword = pass.newPassword;
    var usersRef = ref.child("users/"+username);
    usersRef.once("value", function(snapshot) {
      var oldPasswordEncoded = new Buffer(oldPassword).toString('base64');
      if(snapshot.val().password == oldPasswordEncoded){
        var users = ref.child("users");
        var user = snapshot.val();
        user.password = new Buffer(newPassword).toString('base64');
        users.child(username).set(user);
        res.json({status: 'ok'});
      } else {
        res.status(401).json({error: "Unauthorized"});
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  }).catch((err) => {
    res.status(400).json({error: err});
  });
});

router.get('/', function(req, res) {
  res.sendfile("./docu/output.html");
});

app.use('/api', router);

app.all('*', function(req, res) {
  res.redirect("/api");
});

app.use(express.static('docu'));

app.listen(port, (err) => {
  if(!err){
    console.log('Magic happens on port ' + port);
  }
});
