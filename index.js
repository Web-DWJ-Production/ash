// IMPORTS
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var mongoose = require('mongoose');
require('dotenv').config();

// EXPRESS CONFIG

var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {        
        if (req.get('Host').indexOf('localhost') < 0) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
    }
    return next();
};

// DB CONFIG
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DatabaseConnectionString, { useNewUrlParser: true, useUnifiedTopology: true, dbName: process.env.DBNAME });

var app = express();
app.use(cors()); // enable cors
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'dist/assets')));

// SERVER CONFIG
var port = process.env.PORT || 8081;

// EXPRESS ROUTES
//app.use(forceSsl);
app.use('/api/auth', require('./controllers/auth.controller.js'));
app.use('/api/users', require('./controllers/users.controller.js'));
app.use('/downloads', require('./controllers/downloads.controller.js'));
app.use('/api/mail', require('./controllers/mail.controller.js'))

app.use('/', require('./controllers/views.controller.js'));
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.sendFile('login.html', { root: path.join(__dirname, '/dist') })
    }
});


// START THE SERVER
app.listen(port, () => { console.log('ash listening at %s', port) });