var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 点赞的构造函数
 * @param {object} message 初始化对象
 */
var Share = function(share){
	this.id = share.id || null;
	this.userId = share.userId;
	this.receiverId = share.receiverId;
	this.authorId = share.authorId;
	this.postId = share.postId;
	this.title = share.title;
	this.shareTime = share.shareTime || (new Date()).getTime();
	this.userRemoved = 0;	// 用户删除标识
	this.receiverRemoved = 0;	// 接收者删除标识
}

/**
 * 获取我分享的记录
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     回调函数
 */
Share.getMyShares = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('share', function(err, collectionShare){
			if(err){
				db.close();
				return cb(err);
			}
			collectionShare.find({userId:userId, userRemoved:0}, {skip:offset, limit:limit, sort:{shareTime:-1}}).toArray(function(err, shares){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, shares);
			});
		});
	});
}


/**
 * 获取分享给我的记录
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     回调函数
 */
Share.getSharesToMe = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('share', function(err, collectionShare){
			if(err){
				db.close();
				return cb(err);
			}
			collectionShare.find({receiverId:userId, receiverRemoved:0}, {skip:offset, limit:limit, sort:{shareTime:-1}}).toArray(function(err, shares){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, shares);
			});
		});
	});
}

Share.delete = function(userId, shareId, shareType, cb){
	var cnd = {id:shareId};
	if(shareType == 'myShare'){
		Share.deleteMyShare(userId, shareId, cb);
	}else if(shareType == 'shareToMe'){
		Share.deleteShareToMe(userId, shareId, cb);
	}else{
		return false;
	}
}

Share.deleteMyShare = function(userId, shareId, cb){
	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('share', function(err, collectionShare){
			if(err){
				db.close();
				return cb(err);
			}
			collectionShare.update({userId:userId, id:shareId}, {$set:{userRemoved:1}}, function(err, result){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, result);
			});
		});
	});
}

Share.deleteShareToMe = function(receiverId, shareId, cb){
	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('share', function(err, collectionShare){
			if(err){
				db.close();
				return cb(err);
			}
			collectionShare.update({receiverId:receiverId, id:shareId}, {$set:{receiverRemoved:1}}, function(err, result){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, result);
			});
		});
	});
}

module.exports = Share;
