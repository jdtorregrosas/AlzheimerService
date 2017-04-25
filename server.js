// server.js

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var User = require('./models/user');
var firebase = require("firebase-admin");
var serviceAccount = require("./brein-78ed7-firebase-adminsdk-32ruk-c0cfce67fe.json");
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

router.use(function(req, res, next) {
    //console.log('Something is happening.');
    next();
});
router.route('/users')
.get(function(req, res) {
    var usersRef = ref.child("users");
    usersRef.on("value", function(snapshot) {
      console.log(snapshot.val());
      res.json(snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
})
.post(function(req, res) {
  var validation = Joi.validate(req.body, User);
  console.log(req.body);
  if(validation.error){
      res.status(400).send(validation.error);
  }else{
    var username = req.body.username;
    var name = req.body.name;
    var lastname = req.body.lastname;
    var password = new Buffer(req.body.password).toString('base64');
    var usersRef = ref.child("users");
    usersRef.child(username).set({
      name: name,
      lastname: lastname,
      password: password
    });
    res.json({result: "success"});
  }
})
router.route('/users/:username')
.get(function(req, res) {
  var username = req.params.username;
  var usersRef = ref.child("users/"+username);
  usersRef.on("value", function(snapshot) {
    console.log(snapshot.val());
    res.json(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

router.route('/auth')
.post(function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var usersRef = ref.child("users/"+username);
  usersRef.on("value", function(snapshot) {
    var passwordEncoded = new Buffer(password).toString('base64');
    if(snapshot.val().password == passwordEncoded){
      res.json({auth: "true"});
    } else {
      res.status(401).json({auth: "false"});
    }
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
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
