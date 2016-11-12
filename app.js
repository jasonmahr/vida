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
    // find the user
    User.findOne({
        name: req.body.username
    }, function(err, user) {
        if (err) throw err;

        var club = Boolean(req.body.club)

        if (user) {
            res.json({success: false, message: "Username already taken"})
        }
        else if(club && (!req.body.latitude || !req.body.longitude)) {
            res.json({success: false, message: "Need business location"})
        }
        else if(club && (!req.body.description || !req.body.clubname)) {
            res.json({success: false, message: "Need business details"})
        }
        else {
            crypt.hashPassword(req.body.password, function(err, hashed) {
                // create a sample user
                var user = new User({ 
                    name: req.body.username, 
                    password: hashed,
                    admin: false,
                    club: club,
                    latitude: Number(req.body.latitude),
                    longitude: Number(req.body.longitude),
                    description: req.body.description,
                    clubname: req.body.clubname
                });

                // save the user
                user.save(function(err) {
                if (err) throw err;
                    console.log('User saved successfully');
                    res.json({ success: true });

                    // if it's a club then we make the firebase entry for the club
                    if(club) {
                        var entry = {
                            male: 0,
                            female: 0,
                            twenty: 0,
                            thirty: 0,
                            forty: 0,
                            fifty: 0,
                            latitude: Number(req.body.latitude),
                            longitude: Number(req.body.longitude),
                            name: req.body.clubname,
                            description: req.body.description,
                            closed: true
                        }

                        var update = {}
                        update[req.body.username] = entry

                        clubsRef.update(update)
                    }
                });
            });
        }
    });
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
        }
        else {
            // if user is found and password is right sets a cookie with the user's info
            req.session.username = user.name;
            req.session.club = user.club

            req.session.info = {
                latitude: user.latitude,
                longitude: user.longitude,
                description: user.description,
                clubname: user.clubname
            }

            res.json({ success: true});
        }   
      })
    }

  });
});


// route for businesses to update firebase
app.post('/api/update', function(req, res) {
    if(req.session.username && req.session.club) {
        var gender = req.body.gender;
        var delta = Number(req.body.delta);
        var age = req.body.age;

        clubsRef.child(req.session.username).once('value').then(function(snapshot) {
            var entry = snapshot.val()
            entry[gender] += delta;
            entry[age] += delta;
            entry['closed'] = false;

            var update = {};
            update[req.session.username] = entry;

            clubsRef.update(update);
            res.json({ success: true});

        })
    }
    else {
        res.json({ success: false, message: "You need to be logged in as a business"});
    }
});

// route for businesses to open the club for the night
app.post('/api/open', function(req, res) {
    if(req.session.username && req.session.club) {
        var entry = {
            male: 0,
            female: 0,
            twenty: 0,
            thirty: 0,
            forty: 0,
            fifty: 0,
            closed: false
        }

        // persist business info
        for(key in req.session.info) {
            entry[key] = req.session.info[key]
        }

        var update = {}
        update[req.session.username] = entry

        clubsRef.update(update);
        res.json({ success: true});
    }
    else {
        res.json({ success: false, message: "You need to be logged in as a business"});
    }
});

// route for businesses to close the club for the night
app.post('/api/close', function(req, res) {
    if(req.session.username && req.session.club) {
        var entry = {
            male: 0,
            female: 0,
            twenty: 0,
            thirty: 0,
            forty: 0,
            fifty: 0,
            closed: true
        }

        // persist business info
        for(key in req.session.info) {
            entry[key] = req.session.info[key]
        }

        var update = {}
        update[req.session.username] = entry

        clubsRef.update(update);
        res.json({ success: true});
    }
    else {
        res.json({ success: false, message: "You need to be logged in as a business"});
    }
});

// make the server start and listen
server.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Vida is running on port " + port);
});