var express = require('express');
var router = express.Router();
var authService = require('../services/auth.service.js');

// ROUTES
router.post('', auth);

module.exports = router;

function auth(req, res) { authService.auth(req, res) };