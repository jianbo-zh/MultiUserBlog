
var validator = require('validator');
var mUser = require('../model/user.js');

exports.run = function(userId, post, cb){
	var u = {};
	u.nickname = validator.trim(post.nickname);
	u.qq = validator.trim(post.qq);
	u.weibo = validator.trim(post.weibo);

	if(!u.nickname){
		return cb(new Error('昵称不能为空！'));

	}else if( u.qq && !/^\d{5,10}$/.test(u.qq)){
		return cb(new Error('请填写正确的QQ！'));
	}
	return cb(null, u);
}