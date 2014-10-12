var express = require('express');
var router = express.Router();
var commonFn = require('../lib/common.js');


router.get('/', function(req, res) {
	req.session.destroy();
	res.redirect(commonFn.url('/login'));
});

module.exports = router;
