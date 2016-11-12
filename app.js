var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var crypt = require('./backend/crypt');

// =======================
// configuration =========
// =======================

// setup express server
var app = express();
var server = http.createServer(app);

// mongoose setup
var mongoose = require('mongoose')
var config = require('./backend/config'); // get our config file
var User = require('./backend/models/user'); // get our mongoose model

mongoose.connect(config.database); // connect to database

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// firebase stuff
var admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert("backend/admin_key.json"),
    databaseURL: "https://vida-e7be2.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var rootRef = db.ref();
var clubsRef = rootRef.child('clubs');

// setup sessions
var session = require('express-session');

app.set('trust proxy', 1) // trust first proxy 

app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true
}))

// =======================
// routes ================
// =======================

// user tries to signup to the service
app.post('/api/signup', function(req, res) {
    // TODO check if username already exists

    crypt.hashPassword(req.body.password, function(err, hashed) {
        // create a sample user
        var user = new User({ 
            name: req.body.username, 
            password: hashed,
            admin: false,
            club: req.body.club
        });

        // save the user
        user.save(function(err) {
        if (err) throw err;
            console.log('User saved successfully');
            res.json({ success: true });
        });
    })
});


// authenticate the user
app.post('/api/login', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      crypt.verifyPassword(req.body.password, user.password, function(err, correct) {

        if (err || !correct) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // sets a cookie with the user's info
          req.session.username = user;
          req.session.club = user.club

          res.json({ success: true});
          
        }   
      })
    }

  });
});


// TODO route for updating firebase

// make the server start and listen
server.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Vida is running on port " + port);
});