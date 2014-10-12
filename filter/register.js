
var validator = require('validator');
var mUser = require('../model/user.js');

exports.run = function(post, cb){
	var email = validator.trim(post.email),
		nickname = validator.trim(post.nickname),
		weibo = validator.trim(post.weibo),
		qq = validator.trim(post.qq),
		password = post.password,
		repassword = post.repassword;
	if(password !== repassword){
		return cb(new Error('两次输入密码不正确！'));
	}
	if(!email){
		return cb(new Error('Email不能为空！'));
	}
	if(!validator.isEmail(email)){
		return cb(new Error('Email地址错误！'));
	}
	mUser.getByEmail(email, function(err, user){
		if(err){
			return cb(err);
		}
		if(user){
			return cb(new Error('该Email已经存在，请重新填写！'));
		}
		return cb(null, true);	
	});
}