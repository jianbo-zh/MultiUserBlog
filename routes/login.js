var express = require('express');
var router = express.Router();
var commonFn = require('../lib/common.js');
var mUser = require('../model/user.js');
var fLogin = require('../filter/login.js');


router.get('/', function(req, res) {
	var data = {};
	data.title = '用户登录';
	data.preCss = commonFn.css(['reset.css', 'homepage.css']);
	data.preJs = commonFn.js(['jquery.js', 'jquery.form.js']);
	data.sufJs = commonFn.js('login.js');
	res.render('login', data);
});

router.post('/', function(req, res){
	var u = {};
	u.email = req.body.account;
	u.password = req.body.password;
	fLogin.run(u, function(err, result){
		if(err){
			return res.send({status:'fail', message:err.message});
		}
		mUser.getByEmail(u.email, function(err, user){
			if(err){
				return res.send({status:'fail', message:err.message});
			}
			req.session.user = user;
			req.session.isLogin = true;
			var refUrl = req.flash('refUrl').toString();
			var url = refUrl || commonFn.url('/center');
			return res.send({status:'success', url:url});
		});
	});
});

module.exports = router;
