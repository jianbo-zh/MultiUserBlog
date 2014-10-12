var express = require('express');
var router = express.Router();
var commonFn = require('../lib/common.js');
var User = require('../model/user.js');
var fRegister = require('../filter/register.js');

// 获取注册表单
router.get('/', function(req, res) {
	var data = {};
	data.title = '用户注册';
	data.preCss = commonFn.css(['reset.css', 'homepage.css']);
	data.preJs = commonFn.js(['jquery.js', 'jquery.form.js']);
	data.sufJs = commonFn.js('register.js');
	res.render('register', data);
});

// 注册内容
router.post('/', function(req, res){
	var u = {};
	u.email = req.body.email;
	u.password = req.body.password;
	u.repassword = req.body.repassword;
	u.nickname = req.body.nickname;
	u.weibo = req.body.weibo;
	u.qq = req.body.qq;
	// 注册验证
	fRegister.run(u, function(err, result){
		if(err){
			return res.send({status:'fail', message:err.message});
		}
		// 如果验证通过
		var user = new User(u);
		user.add(function(err, result){
			if(err){
				return res.send({status:'fail', message:err.message});
			}
			return res.send({status:'success'});
		});
	});
});

module.exports = router;
