var http = require('http');
var express = require('express');
var fs = require('fs');
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
var walk = require('walk');

var app = express();

app.use(express.static('.'));
app.use('/main.js', express.static('./main.js'));
app.use('/master.json', express.static('./master.json'));


var master = JSON.parse(fs.readFileSync('master.json', 'utf8'));
for (var index in master.scenes) {
  var scene = master.scenes[index];
  app.use('/' + scene, express.static('./' + scene));
}

var assets = [];

// Walker options
var walker  = walk.walk('./assets', { followLinks: false });

walker.on('file', function(root, stat, next) {
  var extPath = root.substring(1);
  app.use(extPath + scene, express.static(root + '/' + stat.name));
  next();
});

walker.on('end', function() {
    console.log(assets);
});

app.use(bodyParser.json());

// Express route for any other unrecognised incoming requests
app.get('*', function(req, res) {
  res.status(404).send('Unrecognised API call');
});

// Express route to handle errors
app.use(function(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send('Oops, Something went wrong!');
  } else {
    next(err);
  }
});

var server = app.listen(3000);

function exitHandler() {
  server.close();
  process.exit();
}

process.on('exit', exitHandler.bind());

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind());

process.on('uncaughtException',  (err) => {
  winston.error('Caught exception', err);
});