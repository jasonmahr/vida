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

var Click = require('./backend/models/click');
var Hour = require('./backend/models/hour');
var Special = require('./backend/models/special');
var Rating = require('./backend/models/rating');
var Club = require('./backend/models/club');

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
// API routes ============
// =======================

/* User tries to sign up for the app.
 * Input:
 *      name, password, club:boolean indicating if is club (required);
 *      required for business: latitude, longitude, address, clubname (formal business name),
 *          description, phone, price
 * Output: {success: true/false}
 */
app.post('/api/signup', function(req, res) {
    // find the user
    User.findOne({
        name: req.body.username
    }, function(err, user) {
        if (err) throw err;

        var club = req.body.club === 'true' || req.body.club === true;

        if (user) {
            res.json({success: false, message: "Username already taken"})
        } // TODO expand for more fields
        else if(club && (!req.body.latitude || !req.body.longitude)) {
            res.json({success: false, message: "Need business location"})
        }
        else if(club && (!req.body.description || !req.body.clubname)) {
            res.json({success: false, message: "Need business details"})
        }
        else {
            crypt.hashPassword(req.body.password, function(err, hashed) {
                // create a sample user, start with max rating
                var user;
                if(club) {
                    user = new User({ 
                        name: req.body.username, 
                        password: hashed,
                        admin: false,
                        club: club,
                        clubname: req.body.clubname,
                        rating: 5,
                        total: 1
                    });

                }
                else {
                    user = new User({ 
                        name: req.body.username, 
                        password: hashed,
                        admin: false,
                        club: club,
                        rating: 5,
                        total: 1
                    });
                }

                // save the user
                user.save(function(err) {
                if (err) throw err;
                    console.log('User saved successfully');
                    res.json({ success: true });

                    // if it's a club then we make the firebase entry for the club
                    if(club) {
                        var entry = { // twenty, twfive, thirty, thfive, forty, ffive
                            male: [0,0,0,0,0,0],
                            female: [0,0,0,0,0,0],
                            latitude: Number(req.body.latitude),
                            longitude: Number(req.body.longitude),
                            name: req.body.clubname,
                            description: req.body.description,
                            address: req.body.address,
                            phone: req.body.phone,
                            price: req.body.price,
                            rating: 5, // start with a good rating when signup
                            closed: true,
                            special: null
                        }

                        var update = {}
                        update[req.body.username] = entry

                        clubsRef.update(update)

                        var hours = []

                        for(i in req.body.hours) {
                            h = req.body.hours[i]
                            hour = new Hour({
                                start: h["start"],
                                end: h['end'],
                                days: h['days']
                            });

                            hours.push(h);
                        }

                        club = new Club({
                            name: req.body.clubname,
                            latitude: req.body.latitude,
                            longitude: req.body.longitude,
                            address: req.body.address,
                            phone: req.body.phone,
                            price: req.body.price,
                            email: req.body.email,
                            description: req.body.description,
                            hours: hours,
                            ratings: [],
                            clicks: [],
                            specials: []
                        });

                        club.save(function(err) {if(err) throw err;});
                    }
                });
            });
        }
    });
});


/* Authenticates the user for the app and creates session data.
 * Input:
 *      name, password
 * Output: {success: true/false}
 */
app.post('/api/login', function(req, res) {

    // find the user, TODO add support for email address lookup
    User.findOne({
        name: req.body.username
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
          res.json({ success: false, message: 'Authentication failed. User not found.' });
        }
        else if (user) {

            // check if password matches
            crypt.verifyPassword(req.body.password, user.password, function(err, correct) {

            if (err || !correct) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            }
            else {
                // if user is found and password is right sets a cookie with the user's info
                req.session.username = user.name;
                req.session.club = user.club

                // if it's a club, then load in relevant club data for session
                if (user.club) {
                    Club.findOne({
                        name: user.clubname
                    }, function(err, club) {
                        req.session.info = {
                            latitude: club.latitude,
                            longitude: club.longitude,
                            description: club.description,
                            clubname: club.name,
                            phone: club.phone,
                            hours: club.hours,
                            price: club.price,
                            address: club.address,
                            special: club.specials[club.specials.length-1]
                        }

                        res.json({ success: true});
                    });
                }
                // otherwise it's just a user
                else {
                    req.session.info = {}
                    res.json({ success: true});
                }
            }   
        })
    }

  });
});

/* Destroys session data to allow the user to logout.
 * Input: N/A
 * 
 * Output: {success: true/false}
 */
app.post('/api/login', function(req, res) {
    req.session.destroy(function(err) {
        if(err) {
            res.json({success: false})
        }
        else {
            res.json({success: true})
        }
    })
}

/* Business user updates person counts
 * Input:
 *      gender:String, delta:Number, age: in [0...5]
 * Output: {success: true/false}
 */
app.post('/api/update', function(req, res) {
    if(req.session.username && req.session.club) {
        var gender = req.body.gender;
        var delta = Number(req.body.delta);
        var age = req.body.age;

        // update on firebase
        clubsRef.child(req.session.username).once('value').then(function(snapshot) {
            var entry = snapshot.val()
            entry[gender][age] += delta;
            entry['closed'] = false;

            var update = {};
            update[req.session.username] = entry;

            clubsRef.update(update);
        });

        // save a click
        click = new Click({
            time: Date.now(),
            gender: gender,
            delta: delta,
            age: age
        });

        Club.findOneAndUpdate({name: req.session.info.clubname},
            {$push: {"clicks": click}},
            {safe: true, upsert: true}, function(err, club) {
                if (err) throw err;
                res.json({ success: true});
        })
    }
    else {
        res.json({ success: false, message: "You need to be logged in as a business"});
    }
});

/* The business opens up for the next day. Assumes nobody was there.
 * Input: N/A
 *      
 * Output: {success: true/false}
 */
app.post('/api/open', function(req, res) {
    if(req.session.username && req.session.club) {

        // update on firebase, precondition: all values should be 0 for male/female
        clubsRef.child(req.session.username).once('value').then(function(snapshot) {
            var entry = snapshot.val()
            entry['closed'] = false;

            var update = {};
            update[req.session.username] = entry;

            clubsRef.update(update);
            res.json({ success: true});
        });        
    }
    else {
        res.json({ success: false, message: "You need to be logged in as a business"});
    }
});

/* The business closes up for the night. Makes everyone leave the club.
 * Input: N/A
 *      
 * Output: {success: true/false}
 */
app.post('/api/close', function(req, res) {
    if(req.session.username && req.session.club) {

        // update on firebase
        clubsRef.child(req.session.username).once('value').then(function(snapshot) {
            var entry = snapshot.val();

            // make all of the males leave
            for(i in entry['male']) {
                // save a click
                click = new Click({
                    time: Date.now(),
                    gender: 'male',
                    delta: -1*entry['male'][i],
                    age: i
                });

                Club.findOneAndUpdate({name: req.session.info.clubname},
                    {$push: {"clicks": click}},
                    {safe: true, upsert: true}, function(err, club) {
                        if (err) throw err;
                });
                entry['male'][i] = 0
            }

            // make all of the females leave
            for(i in entry['female']) {
                // save a click
                click = new Click({
                    time: Date.now(),
                    gender: 'female',
                    delta: -1*entry['female'][i],
                    age: i
                });

                Club.findOneAndUpdate({name: req.session.info.clubname},
                    {$push: {"clicks": click}},
                    {safe: true, upsert: true}, function(err, club) {
                        if (err) throw err;
                });
                entry['female'][i] = 0
            }

            entry['closed'] = true;

            var update = {};
            update[req.session.username] = entry;

            clubsRef.update(update);
            res.json({ success: true});
        });        
    }
    else {
        res.json({ success: false, message: "You need to be logged in as a business"});
    }
});

/* Lets a user add a review for a business. It also updates the trustworthiness of a
 *      user's reviews. The effect on the review gets more swayed by a more trustworthy
 *      user.
 * Input: clubname:String, rating:int in [1...5], comment:String
 *      
 * Output: {success: true/false}
 */
app.post('/api/rate', function(req, res) {
    if(req.session.username && !req.session.club) {
        // find the user
        User.findOne({
            name: req.session.username
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
              res.json({ success: false, message: 'Rating failed. User not found.' });
            }
            else {
                // find the club's rating
                User.findOne({
                    name: req.body.clubname
                }, function(err2, club) {
                    if (err) throw err;

                    if (!club) {
                        res.json({ success: false, message: 'Rating failed. Club not found.' });
                    }
                    else {
                        // online algorithm for the ratings, weights based on trustworthiness
                        var trustworthiness = user.rating/user.total
                        var clubRating = club.rating/club.total

                        var newClubRating = club.rating + trustworthiness/5*Number(req.body.rating)
                        var newClubTotal = club.total + trustworthiness/5

                        var newUserRating = user.rating + 5-Math.abs(club.rating-Number(req.body.rating))
                        var newUserTotal = user.total + 1
                        User.findOneAndUpdate({name: req.session.username},
                                              {$set: {rating : newUserRating, total: newUserTotal}},
                                              {new: true}, function(err, doc) {
                                                if (err) throw err;
                                              });
                        User.findOneAndUpdate({name: req.body.clubname},
                                              {$set: {rating : newClubRating, total: newClubTotal}},
                                              {new: true}, function(err, doc) {
                                                if (err) throw err;
                                              });

                        rating = new Rating({
                            time: Date.now(),
                            username: req.session.username,
                            comment: req.body.comment,
                            rating: req.body.rating
                        });

                        Club.findOneAndUpdate({name: club.clubname},
                            {$push: {"ratings": rating}},
                            {safe: true, upsert: true}, function(err, club) {
                                if (err) throw err;
                                res.json({ success: true});
                        })

                        res.json({ success: true, message: 'Thanks for the rating!'});
                    }
                })
            }
        })

    }
    else {
        res.json({ success: false, message: "You need to be logged in as a customer"});
    }
});


/* Gets the rating of a User if that user is a business.
 * Input: embed username in query of http request.
 *      
 * Output: {success: true/false, rating: Number}
 */
app.get('/api/rating/:username', function(req, res) {
    User.findOne({name: req.params.username}, function(err, user) {
        if (err) throw err;

        if(user && user.club) {
            res.json({ success: true, rating: user.rating/user.total});
        }
        else {
            res.json({ success: false, rating: user.rating/user.total});
        }
    })
});

// make the server start and listen
server.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Vida is running on port " + port);
});