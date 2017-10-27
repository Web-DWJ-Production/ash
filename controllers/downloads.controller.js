var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var path = require('path');

// ROUTES
router.get('/LTD_policy', getLTDPolicy);
router.get('/STD_policy', getSTDPolicy);
router.get('/EAP', getEAP);



function getSTDPolicy(req, res) { 
    var file = __dirname + '/fs/STRATEGIC_ANALYTIX _STD_Policy.pdf';
    res.download(file);
};

function getLTDPolicy(req, res) { 
    var file = __dirname + '/fs/STRATEGIC_ANALYTIX _LTD_Policy.pdf';
    res.download(file);
};

function getEAP(req, res) { 
    var file = __dirname + '/fs/EAP_Business_Class_Employee_Handout.pdf';
    res.download(file);
};


module.exports = router;