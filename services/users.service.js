// IMPORTS
var bcrypt = require('bcrypt');
var secret = process.env.JWT_SECRET || 'changeme';
var jwt = require('jsonwebtoken');
var transporter = require('../mailers/info.mailer.js')
const nodemailer = require('nodemailer');
var mdb = require('../db/users');

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
    // 12 Hours
    var tmpPassExp = new Date().getTime() + (12 * 60 * 60 * 1000);
    var retData = { "error": null, "results":false };
    
    /*db.get('users')
        .find({ email: req.body.email })
        .assign({ tmpPass: tmpPass})
        .assign({ tmpPassExp: tmpPassExp})
        .write();*/        

    mdb.updateOne({'email':req.body.email}, {'tmpPass': tmpPass,'tmpPassExp': tmpPassExp}, function(err, ret){

        var mailOptions = {
            from: 'helpdesk.dwjproduction@gmail.com', // sender address
            to: req.body.email, // list of receivers
            subject: 'Strategic Analytix Temporary Password', // Subject line
            text: 'Your temporary password is ' + tmpPass + ' it is valid for the next 12 hrs. Make sure to change reset your password by going to account settings after logging in. Login using the temporary passoword, Click the settings button, Use the Reset Password Button, & Change Your password to something that you will remember', // plaintext body
            html: '<p>Your temporary password is </p><h1>' + tmpPass + '</h1><p> it is valid for the next 12hrs. Make sure to reset your password by going to account settings after logging in.</p> <ol><li>Login using the temporary passoword</li><li>Click the settings button</li><li>Use the <b>Reset Password Button</b></li><li>Change Your password to something that you will remember</li></ol>'// html body
        };        
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                retData.error = error;                
            }
            else {
                retData.results = true;
            }

            res.status(200).json(retData);
        });
    });        
}

/**
 * Authenticate a user.
 */
service.getAll = (req, res) => {

    // Find the user with the given email.
    //var all = db.get('users').value();
    var all;
    mdb.find({}, function(err, ret){
        all = ret;
        if (!all) {
            console.log("Users (getAll) failed.");
            res.status(200).json({ message: 'Users (getAll) failed.' });
        }
    
        // The authentication is succesful, return a JWT.
        res.status(200).json(all);
    });
}

service.postUser = (req, res) => {

    if (!req.body.email || !req.body.password) {
        console.log("Users (postUser) failed.");
        res.status(200).json({ message: 'Users (postUser) failed.' });
    }

    /*db.get('users')
        .push({ email: req.body.email.toLowerCase(), password: bcrypt.hashSync(req.body.password, 10), admin: req.body.admin })
        .write();*/    
    var createdUser = mdb({ email: req.body.email.toLowerCase(), password: bcrypt.hashSync(req.body.password, 10), admin: req.body.admin });

    createdUser.save(createdUser, function(err, ret){
             //db.get('users').find({ email: req.body.email }).value();
             mdb.findOne({email: req.body.email.toLowerCase()}, function(err, ret2){
                 console.log("Created New User: [user:"+ ret2.email+"]")                ;
                var newUser= ret2;
                res.status(200).json(newUser);
             });          
        });    
}

service.deleteUser = (req, res) => {
    var email = req.params.email;

    if (!email) {
        console.log("User delete failed: Empty Email Address");
        res.status(200).json({ message: 'Users (deleteUser) failed.' });
    }

    /*db.get('users')
        .remove({ email: email })
        .write();
    */
    mdb.deleteOne({ email: email }, function(err, ret){
        console.log("Email Deleted:[email:"+email+"]");
        res.status(200).json(true);
    });    
}

service.updateUser = (req, res) => {
    var email = req.params.email;

    if (typeof req.body.admin === 'boolean') {
        /*db.get('users')
            .find({ email: req.body.email })
            .assign({ admin: req.body.admin })
            .write();*/
        mdb.updateOne({'email':req.body.email}, { admin: req.body.admin },function(err, ret){});
    }

    if (typeof req.body.password == 'string') {
        /*db.get('users')
            .find({ email: req.body.email })
            .assign({ password: bcrypt.hashSync(req.body.password, 10) })
            .write();*/
        mdb.updateOne({'email':req.body.email}, { password: bcrypt.hashSync(req.body.password, 10) },function(err, ret){ });
    } 
    res.status(200).json(true);   
}

module.exports = service;