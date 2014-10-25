var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 消息的构造函数
 * @param {object} follow 初始化对象
 */
var Follow = function(follow){
	this.id = follow.id || null;
	this.userId = follow.userId;
	this.followingId = follow.followingId;
	this.followTime = follow.followTime || (new Date()).getTime();
}

/**
 * 获取关注我的人
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     [description]
 */
Follow.getFollowers = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('follow', function(err, collectionFollow){
			if(err){
				db.close();
				return cb(err);
			}
			collectionFollow.find({followingId:userId}, {skip:offset, limit:limit, sort:{followTime:-1}}).toArray(function(err, followers){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, followers);
			});
		});
	});
}

/**
 * 获取我关注的人
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     [description]
 */
Follow.getFollowings = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('follow', function(err, collectionFollow){
			if(err){
				db.close();
				return cb(err);
			}
			collectionFollow.find({userId:userId}, {skip:offset, limit:limit, sort:{followTime:-1}}).toArray(function(err, followings){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, followings);
			});
		});
	});
}

Follow.cancelFollowing = function(userId, followingId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('follow', function(err, collectionFollow){
			if(err){
				db.close();
				return cb(err);
			}
			collectionFollow.remove({userId:userId, followingId:followingId}, function(err, result){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, result);
			});
		});
	});
}


/**
 * 检查是否已经关注用户
 * @param  {int}   userId      用户编号
 * @param  {int}   followingId 被关注者编号
 * @param  {Function} cb          [description]
 */
Follow.hasFollowed = function(userId, followingId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('follow', function(err, collectionFollow){
			if(err){
				db.close();
				return cb(err);
			}
			collectionFollow.findOne({userId:userId, followingId:followingId}, function(err, following){
				db.close();
				if(err){
					return cb(err);
				}
				if(following){
					return cb(null, true);
				}
				return cb(null, false);
			});
		});
	});
}

/**
 * 关注用户
 * @param  {Function} cb [description]
 */
Follow.prototype.followingUser = function(cb){
	var f = {
		userId : this.userId,
		followingId : this.followingId,
		followTime : this.followTime
	};
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		commonFn.getNextId(db, 'follow', function(err, followId){
			if(err){
				return cb(err);
			}
			f.id = followId;
			db.collection('follow', function(err, collectionFollow){
				if(err){
					db.close();
					return cb(err);
				}
				collectionFollow.insert( f , function(err, result){
					db.close();
					if(err){
						return cb(err);
					}
					return cb(null, followId);
				});
			});
		});
	});
}


module.exports = Follow;
