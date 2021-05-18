var express = require('express');

var app = express();

app.get('/', function (req, res) {
  res.send('hello jenkins 6x');
});

app.listen(process.env.PORT || 5000);

module.exports = app;

// KICK CI LINE 2021-05-18-20-05-45
