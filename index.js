var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var https = require('https');
var net = require('net');
var exec = require('child_process').exec;

var app = express();

app.use(bodyParser.json());

app.post('/', function(req, res) {
  console.log(req.body);
  
  var intent = req.body.request.intent.name;
  if (intent == 'Mute') {
    //yamaha("@MAIN:MUTE=On", res);
    denon("MUON", res);
  } else if (intent == 'UnMute') {
    //yamaha("@MAIN:MUTE=Off", res);
    denon("MUOFF", res);
  } else if (intent == 'WatchTV') {
    //yamaha("@MAIN:SCENE=Scene 2", res);
    denon("SISAT/CBL", res);
  } else if (intent == 'WatchAppleTV') {
    //yamaha("@MAIN:SCENE=Scene 1", res);
    denon("SIMPLAY", res);
  } else if (intent == 'TurnOff') {
    cec("standby 0", function() {
      //yamaha("@MAIN:PWR=Standby", res);
      denon("PWSTANDBY", res);
    });
  }
});

var yamaha = function(cmd, res) {
  var client = net.connect({host: "av.house", port: 50000}, function() { //'connect' listener
    client.end(cmd + '\r\n', function() {
        client.destroy();
        sayOk(res);
    });        
  });
}

var denon = function(cmd, res) {
  var client = net.connect({host: "10.0.1.230", port: 23}, function() { //'connect' listener
    client.end(cmd + '\r\n', function() {
        client.destroy();
        sayOk(res);
    });        
  });
}

var cec = function(cmd, callback) {
  console.log("Running: " + cmd);
  exec('echo "' + cmd + '" | cec-client -s', function(err, stdout, stderr) {
    console.log("DONEs");
    console.log(err);
    console.log(stdout);
    console.log(stderr);
    
    callback();
  });
}


var sayOk = function(res) {
  res.json({
    "version": "1.0",
    "response": {
      "outputSpeech": {
        "type": "PlainText",
        "text": "OK"
      },
      "card": null,
      "reprompt": null,
      "shouldEndSession": true
    },
    "sessionAttributes": {}
  });
}

var server = https.createServer({
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
    ca: fs.readFileSync('./ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
}, app)
.listen(2096, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Pi Bridge listening at http://%s:%s', host, port);
});

