var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var https = require('https');
var net = require('net');

var app = express();

app.use(bodyParser.json());

app.post('/', function(req, res) {
  var intent = req.body.request.intent.name;
  if (intent == 'Mute') {
    yamaha("@MAIN:MUTE=On", res);
  } else if (intent == 'UnMute') {
    yamaha("@MAIN:MUTE=Off", res);
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

