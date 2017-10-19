var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var path = require('path');

// ROUTES
router.get('/', getIndex);
router.get('/underconstruction', getUC);
router.get('/contactus', getContactUs);
router.get('/benefits', getBenefits);
router.get('/services', getServices);
router.get('/employees', expressJWT({ secret: secret }), getEmployees);

module.exports = router;

function getIndex(req, res) { res.sendFile('index.html', { root: path.join(__dirname, '../dist') }) };
function getContactUs(req, res) { res.sendFile('contactus.html', { root: path.join(__dirname, '../dist') }) };
function getBenefits(req, res) { res.sendFile('benefits.html', { root: path.join(__dirname, '../dist') }) };
function getServices(req, res) { res.sendFile('services.html', { root: path.join(__dirname, '../dist') }) };
function getUC(req, res) { res.sendFile('underconstruction.html', { root: path.join(__dirname, '../dist') }) };
function getEmployees(req, res) {
    console.log('Access granted to employees.');
    res.sendFile('employees.html', {
        root: path.join(__dirname, '../dist')
    })
};