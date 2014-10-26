
var validator = require('validator');
var mUser = require('../model/user.js');

exports.run = function(userId, post, cb){
	var oldPassword = validator.trim(post.oldPassword),
		newPassword = validator.trim(post.newPassword),
		rePassword = validator.trim(post.rePassword);

	mUser.getUserById(userId, function(err, user){
		if(err){
			return cb(err);
		}
		if(mUser.encrypt(oldPassword) !== user.password){
			return cb(new Error('旧密码输入错误！'));
		}

		if(newPassword.length == 0){
			return cb(new Error('新密码不能为空！'));

		}else if(newPassword !== rePassword){
			return cb(new Error('两次输入密码不一致！'));
		}

		newPassword = mUser.encrypt(newPassword);
		return cb(null, newPassword);

	})
}