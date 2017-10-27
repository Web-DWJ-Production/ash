var express = require('express');
var router = express.Router();
var secret = process.env.JWT_SECRET || 'changeme';
var expressJWT = require('express-jwt');
var usersService = require('../services/users.service.js');

// ROUTES
router.get('', expressJWT({ secret: secret }), getAll);
router.post('', expressJWT({ secret: secret }), postUser);
router.post('/pwdreset', pwdReset);
router.route('/:email')
    .delete(expressJWT({ secret: secret }), deleteUser)
    .put(expressJWT({ secret: secret }), updateUser);

module.exports = router;

function getAll(req, res) { usersService.getAll(req, res) };
function postUser(req, res) { usersService.postUser(req, res) };
function deleteUser(req, res) { usersService.deleteUser(req, res) };
function updateUser(req, res) { usersService.updateUser(req, res) };
function pwdReset(req, res) { usersService.pwdReset(req, res) };