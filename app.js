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
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send("<link rel='stylesheet' type='text/css' href='main.css' /><h1>Countzilla</h1><p>This website counts.  We're counting <a href='/foo'>foos</a> for example.</p>");
});

  app.get('/:name', function(req, res) {
  redis.get('counter-'+req.params.name, function(err, result) {
    if (result == null) result = 0;
    res.send("<link rel='stylesheet' type='text/css' href='main.css' /><h1>Counting: " + result + ' ' + req.params.name +'s' + '</h1><p>Counter '+ req.params.name + ' was hit <span class="counter">' + result + '</span> times. <a href="">Reloading this page</a> won\'t change that.  <a href="/add/' + req.params.name +'">hit me to increment</a>');
  });
});

app.post('/:name', function(req, res) {
  redis.incr('counter-'+req.params.name, function(err, result) {
    res.json({'counter': req.params.name, 'value': result});
  });
});

// for demo purposes
app.get('/add/:name', function(req, res) {
  redis.incr('counter-'+req.params.name, function(err, result) {
    res.send("<link rel='stylesheet' type='text/css' href='/main.css' /><h1>Counter " + req.params.name + ' was incremented to <span class="counter">' + result + '</span></h1><p><a href="">Reloading this page</a> would increase the count.</p><p>Want to <a href="/' + req.params.name + '">check the total?</a>');
  })
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
