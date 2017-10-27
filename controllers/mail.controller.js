var transporter = require('../mailers/info.mailer.js')
const nodemailer = require('nodemailer');
var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var path = require('path');

// ROUTES
router.post('', sendMail);


module.exports = router;

function sendMail(req, res) {

    if (!req.body.to) {
        res.status(200).json({ message: 'Mail (sendMail) failed.' });
    }

    var mailOptions = {
        from: 'helpdesk.dwjproduction@gmail.com', // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        text: req.body.text, // plaintext body
        html: req.body.html// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(200).json(false);
        }
    });

    res.status(200).json(true);
    
};
