var express = require("express");
var logfmt = require("logfmt");
var app = express();
var redis = require("redis").createClient();

if (process.env.REDISTOGO_URL) {
  console.log("FOUND REDISTOGO:", process.env.REDISTOGO_URL);
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  console.log("didnt' find REDISTOGOURL");
  var redis = require("redis").createClient();
}

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  redis.get('counter', function(err, result) {
    res.send('Counter was hit ' + result + ' times');
  });
});

app.get('/count', function(req, res) {
  redis.incr('counter', function(err, result) {
    res.send('Counter incremented to' + result);
  })
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
