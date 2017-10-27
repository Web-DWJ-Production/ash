
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'helpdesk.dwjproduction@gmail.com',
        pass: 'nnciiigjgpvsofww'
    }
});

module.exports = transporter;
