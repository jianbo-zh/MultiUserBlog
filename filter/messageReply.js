
var validator = require('validator');
var MessageModel = require('../model/message.js');

exports.run = function(userId, message, cb){
	var m = {}, messageId, receiverId, senderId, subjectId;
	messageId = validator.toInt(message.messageId);

	m.senderId = senderId = userId;
	m.receiverId = receiverId = validator.toInt(message.receiverId);
	m.subjectId = subjectId = validator.toInt(message.subjectId);
	m.subject = validator.trim(message.subject);
	m.content = validator.trim(message.content);
	m.sendTime = (new Date()).getTime();

	if(m.subjectid == 0){
		return cb(new Error('信息主题编号不能存在！'));
	}

	if(m.subject.length == 0){
		return cb(new Error('信息主题不能为空！'));
	}

	if(m.content.length == 0){
		return cb(new Error('信息内容不能为空！'));
	}

	// 检查确实是我收到的消息
	MessageModel.checkMessageIfExists({id:messageId, userId:receiverId, relId:senderId, type:0, subjectId:subjectId}, function(err, exists){
		if(err){
			return cb(err);
		}
		if(! exists){
			return cb(new Error('原消息不存在，不能回复！'));
		}
		return cb(null, m);
	});
	
}