// Create web server
var express = require('express');
var app = express();
app.use(express.static('public'));
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var path = require('path');
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// List of comments
var comments = [
  { name: 'Mark', comment: 'Nice work!'},
  { name: 'Tom', comment: 'Great job!'},
  { name: 'John', comment: 'Good job!'}
];

// Read comments from file
fs.readFile('comments.txt', function(err, data) {
  if (err) {
    console.log(err);
  } else {
    comments = JSON.parse(data);
  }
});

// Handle get request
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Handle post request
app.post('/comment', urlencodedParser, function(req, res) {
  var name = req.body.name;
  var comment = req.body.comment;
  var newComment = { name: name, comment: comment };
  comments.push(newComment);
  io.sockets.emit('update', newComment);
  fs.writeFile('comments.txt', JSON.stringify(comments), function(err) {
    if (err) {
      console.log(err);
    }
  });
  res.end();
});

// Send comments to client
io.sockets.on('connection', function(socket) {
  socket.emit('load', comments);
});

// Listen to port
server.listen(port, function() {
  console.log('Server running on port ' + port);
});