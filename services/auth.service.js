// IMPORTS
var bcrypt = require('bcrypt');
var db = require('../lowdb/lowdb.js')
var secret = process.env.JWT_SECRET || 'changeme';
var jwt = require('jsonwebtoken');

var service = {}; // service object

/**
 * Authenticate a user.
 */
service.auth = (req, res) => {
    
    // Find the user with the given email.
    var u = db.get('users').find({ email: req.body.email}).value();

    if (!u) {
        res.status(200).json({message: 'Authentication Failed: No user found.'});
    }

    if (bcrypt.compareSync(req.body.password, u.password)) {
        // The authentication is succesful, return a JWT.
        res.status(200).json(jwt.sign(u, secret));
    } else {
        console.log(u);
        console.log(req.body.password);
        if (req.body.password === u.tmpPass) {
            if ((new Date().getTime()) <= u.tmpPassExp) {
                res.status(200).json(jwt.sign(u, secret));
            }
        }
        // The authentication failed.
        res.status(200).json({message: 'Authentication Failed'});
    }
}

module.exports = service;