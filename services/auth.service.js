// IMPORTS
var bcrypt = require('bcrypt');
//var db = require('../lowdb/lowdb.js')
var secret = process.env.JWT_SECRET || 'changeme';
var jwt = require('jsonwebtoken');
var mdb = require('../db/users');

var service = {}; // service object

/**
 * Authenticate a user.
 */
service.auth = (req, res) => {
    
    // Find the user with the given email.
    //var u = db.get('users').find({ email: req.body.email.toLowerCase()}).value();
    var u;    
    
    mdb.findOne({email: req.body.email.toLowerCase()}, function(err, ret){
        u = ret;                      
        if (!u || u == null) {
            console.log("Authentication Failed: No user found: [user:"+req.body.email.toLowerCase()+"]");
            res.status(200).json({message: 'Authentication Failed: No user found.'});
        }
        else {        
            var signUser = {email: u.email, password: u.password, admin: u.admin, tmpPassExp: u.tmpPassExp, tmpPass: u.tmpPass};
            if (bcrypt.compareSync(req.body.password, u.password)) {            
                // The authentication is succesful, return a JWT.
                //res.status(200).json(jwt.sign(u, secret));
                res.status(200).json(jwt.sign(signUser, secret));
            } else {    
                
                if (req.body.password === u.tmpPass) {                   
                    if ((new Date().getTime()) <= parseInt(u.tmpPassExp)) {                        
                        res.status(200).json(jwt.sign(signUser, secret));
                    }
                }
                else {
                    // The authentication failed.
                    console.log("Authentication Failed: Password does not match: [user:"+req.body.email.toLowerCase()+"]")
                    res.status(200).json({message: 'Authentication Failed'});
                }
            }
        }
    });
    
}

module.exports = service;