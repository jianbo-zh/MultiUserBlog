var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 消息的构造函数
 * @param {object} message 初始化对象
 */
var Message = function(message){
	this.id = message.id || null;
	this.senderId = message.senderId;
	this.receiverId = message.receiverId;
	this.sendTime = message.sendTime;
	this.subjectId = message.subjectId || null;
	this.subject = message.subject;
	this.content = message.content;
}

/**
 * 获取指定的消息
 * @param  {int}   userId    用户编号
 * @param  {int}   messageId 消息编号
 * @param  {Function} cb        [description]
 */
Message.getMessageById = function(userId, messageId, cb){
	var w = {userId:userId, id:messageId};
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('message', function(err, collectionMessage){
			if(err){
				db.close();
				return cb(err);
			}
			collectionMessage.findOne( w ,function(err, message){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, message);
			});
		});
	});
}

/**
 * 获取私信
 * @param  {int}   userId 用户编号
 * @param  {int}   type   消息类型
 * @param  {Function} cb     回调函数
 */
Message.getMessageOfUser = function(userId, type, cb){
	var w = {userId:userId}
	if(type == 1){			// 发送
		w.type = 1;
	}else if(type == 0){	// 接收
		w.type = 0;
	}

	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('message', function(err, collectionMessage){
			if(err){
				db.close();
				return cb(err);
			}
			collectionMessage.find(w).toArray(function(err, messages){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, messages);
			});
		});
	});

}


Message.prototype.add = function(cb){
	var mSend = {};
	mSend.userId = this.senderId;
	mSend.type = 1;		// type-1发送，type-0接收
	mSend.relId = this.receiverId;
	mSend.time = this.sendTime;
	mSend.subjectId = this.subjectId;
	mSend.subject = this.subject;
	mSend.content = this.content;

	var mReceive = {};
	mReceive.userId = this.receiverId;
	mReceive.type = 0;
	mReceive.relId = this.senderId;
	mReceive.time = this.sendTime;
	mReceive.subjectId = this.subjectId;
	mReceive.subject = this.subject;
	mReceive.content = this.content;

	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		// sender
		commonFn.getNextId(db, 'message', function(err, messageId){
			if(err){
				db.close();
				return cb(err);
			}
			mSend.id = messageId;
			mSend.subjectId = mSend.subjectId ? mSend.subjectId : messageId;
			db.collection('message', function(err, collectionMessage){
				if(err){
					db.close();
					return cb(err);
				}
				collectionMessage.insert(mSend, function(err, result){
					if(err){
						db.close();
						return cb(err);
					}
					// receiver
					commonFn.getNextId(db, 'message', function(err, messageId){
						if(err){
							db.close();
							return cb(err);
						}
						mReceive.id = messageId;
						mReceive.subjectId = mSend.subjectId;	// 始终是同发送消息是一样的
						db.collection('message', function(err, collectionMessage){
							if(err){
								db.close();
								return cb(err);
							}
							collectionMessage.insert(mReceive, function(err, result){
								db.close();
								if(err){
									return cb(err);
								}
								return cb(null, result);
							});
						});
					});
				});
			});
		});
	});
}

/**
 * 根据条件检查是否存在消息
 * @param  {[type]}   where [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
Message.checkMessageIfExists = function(where, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('message', function(err, collectionMessage){
			if(err){
				db.close();
				return cb(err);
			}
			collectionMessage.findOne(where, function(err, message){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, message);
			});
		});
	});
}

module.exports = Message;
