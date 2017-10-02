var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var path = require('path');

// ROUTES
router.get('/', getIndex);
router.get('/internal', expressJWT({secret: secret}), getInternal);

module.exports = router;

function getIndex(req, res) { res.sendFile('index.html', { root: path.join(__dirname, '../dist') }) };
function getInternal(req, res) {};