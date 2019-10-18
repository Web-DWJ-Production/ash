var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var path = require('path');

// ROUTES
router.get('/LTD_policy', getLTDPolicy);
router.get('/STD_policy', getSTDPolicy);
router.get('/EAP', getEAP);
router.get('/ED_Reimburse', getEDReimburse);
router.get('/Prof_dev', getProfDev);
router.get('/getEMPHandbook', getEMPHandbook);
router.get('/getFBA', getFBA);


function getEDReimburse(req, res) { 
    var file = __dirname + '/fs/Educational_Reimbursement_Expense_Agreement_&_Request_2018.docx';
    res.download(file);
};

function getProfDev(req, res) { 
    var file = __dirname + '/fs/Professional_Development_ReimbursementExpense_Agreement&Request_2018.docx';
    res.download(file);
};

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

function getEMPHandbook(req, res) { 
    var file = __dirname + '/fs/Strategic_Analytix_Employee_Handbook_102019.pdf';
    res.download(file);
};
function getFBA(req, res) { 
    var file = __dirname + '/fs/Flexible_Communication_Health_Fitness_Reimbursement_Policy_102019.pdf';
    res.download(file);
};

module.exports = router;