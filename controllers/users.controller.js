var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var usersService = require('../services/users.service.js');

// ROUTES
router.get('', expressJWT({ secret: secret }), getAll);

module.exports = router;

function getAll(req, res) { usersService.getAll(req, res) };