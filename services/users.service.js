// IMPORTS
var bcrypt = require('bcrypt');
var db = require('../lowdb/lowdb.js')
var secret = process.env.JWT_SECRET || 'changeme';
var jwt = require('jsonwebtoken');

var service = {}; // service object

/**
 * Authenticate a user.
 */
service.getAll = (req, res) => {

    // Find the user with the given email.
    var all = db.get('users').value();

    if (!all) {
        res.status(200).json({message: 'Users (getAll) failed.'});
    }
    
    // The authentication is succesful, return a JWT.
    res.status(200).json(all);
}

module.exports = service;