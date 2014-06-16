var express = require("express");
var logfmt = require("logfmt");
var app = express();

if (process.env.REDISTOGO_URL) {
  console.log("FOUND REDISTOGO:", process.env.REDISTOGO_URL);
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  console.log('rtg.port',rtg.port, rtg.hostname);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  console.log("GOT REDIS", rtg.auth.split(":")[1]);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  console.log("didnt' find REDISTOGOURL");
  var redis = require("redis").createClient();
}

app.use(logfmt.requestLogger());

app.get('/:name', function(req, res) {
  redis.get('counter-'+req.params.name, function(err, result) {
    if (result == null) result = 0;
    res.send('<h1>Counting</h1><p>Counter '+ req.params.name + ' was hit ' + result + ' times.  <a href="/+/' + req.params.name +">hit me</a>);
  });
});

app.post('/:name', function(req, res) {
  redis.incr('counter-'+req.params.name, function(err, result) {
    res.send('Counter ' + req.params.name + ' was incremented to' + result);
  })
});

// for demo purposes
app.get('/+/:name', function(req, res) {
  redis.incr('counter-'+req.params.name, function(err, result) {
    res.send('Counter ' + req.params.name + ' was incremented to' + result + ', want to <a href="/' + req.params.name + ">check?</a>");
  })
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
