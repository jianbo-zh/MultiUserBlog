
var validator = require('validator');
var userModel = require('../model/user.js');

exports.run = function(userId, message, cb){
	var m = {}, receiver, receiverId;
	m.senderId = userId;
	m.subject = validator.trim(message.subject);
	m.content = validator.trim(message.content);
	m.sendTime = (new Date()).getTime();
	m.subjectId = message.subjectId || null;

	receiver = validator.trim(message.receiver);
	if(receiver.length == 0){
		return cb(new Error('消息接收者不能为空！'));
	}

	if(m.subject.length == 0){
		return cb(new Error('信息主题不能为空！'));
	}

	if(m.content.length == 0){
		return cb(new Error('信息内容不能为空！'));
	}

	$match = receiver.match(/^@(\d+)$/);
	if($match){
		receiverId = parseInt($match[1]);
		userModel.getUserById(receiverId, function(err, user){
			if(err){
				return cb(err);
			}
			if(! user){
				return cb(new Error('该用户不存在！'));
			}
			m.receiverId = receiverId;
			return cb(null, m);
		});
	}else if(validator.isEmail(receiver)){
		userModel.getByEmail(receiver, function(err, user){
			if(err){
				return cb(err);
			}
			if(! user){
				return cb(new Error('该用户不存在！'));
			}
			m.receiverId = user.id;
			return cb(null, m);
		});
	}else{
		return cb(new Error('用户格式不正确，必须是"@用户ID或用户邮箱'));
	}
}