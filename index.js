// IMPORTS
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var expressJwt = require('express-jwt');
var path = require('path');

// EXPRESS CONFIG
var app = express();
app.use(cors()); // enable cors
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist/assets')));

// JWT CONFIG
var secret = process.env.JWT_SECRET || 'changeme';

// SERVER CONFIG
var port = process.env.PORT || 8080;

// EXPRESS ROUTES
app.use('/api/auth', require('./controllers/auth.controller.js'));
app.use('/', require('./controllers/views.controller.js'));

// START THE SERVER
app.listen(port, () => { console.log('ash listening at %s', port) });