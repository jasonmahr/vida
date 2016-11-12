var express = require('express');
var http = require('http');
var admin = require("firebase-admin");

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(http);


admin.initializeApp({
  credential: admin.credential.cert("backend/admin_key.json"),
  databaseURL: "https://vida-e7be2.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();

var rootRef = db.ref();
var clubs = rootRef.child('clubs');

// socket messages
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

// make the server start and listen
server.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Vida is running on port " + port);
});