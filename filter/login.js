
var validator = require('validator');
var mUser = require('../model/user.js');

exports.run = function(post, cb){
	var post;
	post.email = validator.trim(post.email);
	
	if(!post.email){
		return cb(new Error('Email不能为空！'));
	}
	if(!validator.isEmail(post.email)){
		return cb(new Error('Email地址错误！'));
	}
	mUser.getByEmail(post.email, function(err, user){
		if(err){
			return cb(err);
		}
		if(!user){
			return cb(new Error('该帐号不存在！'));
		}
		if(user.password !== mUser.encrypt(post.password)){
			return cb(new Error('密码错误！'));
		}
		return cb(null, true);	
	});
}