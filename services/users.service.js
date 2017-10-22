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
        res.status(200).json({ message: 'Users (getAll) failed.' });
    }

    // The authentication is succesful, return a JWT.
    res.status(200).json(all);
}

service.postUser = (req, res) => {

    if (!req.body.email || !req.body.password) {
        res.status(200).json({ message: 'Users (postUser) failed.' });
    }

    db.get('users')
        .push({ email: req.body.email, password: bcrypt.hashSync(req.body.password, 10), admin: req.body.admin })
        .write();

    var newUser = db.get('users').find({ email: req.body.email }).value();

    res.status(200).json(newUser);
}

service.deleteUser = (req, res) => {
    var email = req.params.email;

    if (!email) {
        res.status(200).json({ message: 'Users (deleteUser) failed.' });
    }

    db.get('users')
        .remove({ email: email })
        .write();

    res.status(200).json(true);
}

service.updateUser = (req, res) => {
    var email = req.params.email;

    if (typeof req.body.admin ===  'boolean') {
        db.get('users')
            .find({ email: req.body.email })
            .assign({ admin: req.body.admin })
            .write();
    }

    if (typeof req.body.password == 'string') {
        db.get('users')
            .find({ email: req.body.email })
            .assign({ password: bcrypt.hashSync(req.body.password, 10) })
            .write();
    }

    res.status(200).json(true);
}

module.exports = service;