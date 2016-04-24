var express = require('express');
var app = express();
var path = require('path');

var indexRoutes = require('./routes/index')
var harRoutes = require('./routes/har')

// Routes
app.use('/', indexRoutes);
app.use('/har', harRoutes);
app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function () {
	console.log("Server started on port", server.address().port);
});