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

  var type = req.body.request.type;
  if (type == "LaunchRequest") {
    denon("SISAT/CBL", res);
    return;
  }

  var intent = req.body.request.intent.name;
  if (intent == 'Mute') {
    //yamaha("@MAIN:MUTE=On", res);
    denon("MUON", res);
  } else if (intent == 'UnMute') {
    //yamaha("@MAIN:MUTE=Off", res);
    denon("MUOFF", res);
  } else if (intent == 'SetVolume') {
    var level = req.body.request.intent.slots.Level.value;
    if (level < 10) {
      level = "0" + level;
    } else if (level > 40) {
      level = 40; // safety precaution!
    }
    denon("MV" + level, res);
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
  } else if (intent == 'OpenAllBlinds') {
    blinds("$inm00", res);
  } else if (intent == 'OpenBedroom') {
    blinds("$inm01", res);
  } else if (intent == 'OpenBathroom') {
    blinds("$inm02", res);
  } else if (intent == 'SetBath') {
    blinds("$inm03", res);
  } else if (intent == 'BlackOut') {
    blinds("$inm04", res);
  } else if (intent == 'BlackOutBedroom') {
    blinds("$inm05", res);
  } else if (intent == 'BlackOutBathroom') {
    blinds("$inm06", res);
  } else if (intent == 'Close') {
    blinds("$inm10", res);
    setTimeout(function() {
      blinds("$inm07", null);
    }, 5000);
  } else if (intent == 'CloseBedroom') {
    blinds("$inm08", res);
  } else if (intent == 'CloseBathroom') {
    blinds("$inm09", res);
  }
});

var blinds = function(cmd, resOrCallback) {
  var client = net.connect({host: "hd-blinds.house", port: 522}, function() {
    client.end(cmd + '\r\n', function() {
      client.destroy();
      if (resOrCallback != null && resOrCallback.json) {
        sayOk(resOrCallback);
      } else if (resOrCallback != null) {
        resOrCallback();
      }
    });
  });
}

var yamaha = function(cmd, res) {
  var client = net.connect({host: "av.house", port: 50000}, function() { //'connect' listener
    client.end(cmd + '\r\n', function() {
        client.destroy();
        sayOk(res);
    });
  });
}

var denon = function(cmd, res) {
  console.log("denon(", cmd, ")");
  var client = net.connect({host: "av.house", port: 23}, function() { //'connect' listener
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
    key: fs.readFileSync('/root/ssl/server.key'),
    cert: fs.readFileSync('/root/ssl/server.crt'),
    ca: fs.readFileSync('/root/ssl/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
}, app)
.listen(2096, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Pi Bridge listening at http://%s:%s', host, port);
});
