// IMPORTS
var bcrypt = require('bcrypt');
var db = require('../lowdb/lowdb.js')
var secret = process.env.JWT_SECRET || 'changeme';
var jwt = require('jsonwebtoken');
var transporter = require('../mailers/info.mailer.js')
const nodemailer = require('nodemailer');

var service = {}; // service object

function generatePwd() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

service.pwdReset = (req, res) => {
    var tmpPass = generatePwd();
    var tmpPassExp = new Date().getTime() + 3600000;

    
    db.get('users')
        .find({ email: req.body.email })
        .assign({ tmpPass: tmpPass})
        .assign({ tmpPassExp: tmpPassExp})
        .write();        

        var mailOptions = {
            from: 'helpdesk.dwjproduction@gmail.com', // sender address
            to: req.body.email, // list of receivers
            subject: 'Strategic Analytix Temporary Password', // Subject line
            text: 'your temporary password is ' + tmpPass + ' it is valid for 1hr. Make sure to change reset your password by going to account settings after loging in.', // plaintext body
            html: '<p>your temporary password is </p><h1>' + tmpPass + '</h1><p> it is valid for 1hr. Make sure to reset your password by going to account settings after loging in.</p>'// html body
        };        
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(200).json(false);
            }
        });

    res.status(200).json(true);
}

/**
 * Authenticate a user.
 */
service.getAll = (req, res) => {

    // Find the user with the given email.
    var all = db.get('users').value();

    if (!all) {
        console.log("Users (getAll) failed.");
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
        .push({ email: req.body.email.toLowerCase(), password: bcrypt.hashSync(req.body.password, 10), admin: req.body.admin })
        .write();

    var newUser = db.get('users').find({ email: req.body.email }).value();

    res.status(200).json(newUser);
}

service.deleteUser = (req, res) => {
    var email = req.params.email;

    if (!email) {
        console.log("User delete failed: Empty Email Address");
        res.status(200).json({ message: 'Users (deleteUser) failed.' });
    }

    db.get('users')
        .remove({ email: email })
        .write();

    console.log("Email Deleted:[email:"+email+"]");
    res.status(200).json(true);
}

service.updateUser = (req, res) => {
    var email = req.params.email;

    if (typeof req.body.admin === 'boolean') {
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