var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var https = require('https');

var app = express();

app.use(bodyParser.json());

app.post('/', function(req, res) {
    console.log("Request!", req.body);
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
});

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

