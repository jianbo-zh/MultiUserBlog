var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 点赞的构造函数
 * @param {object} message 初始化对象
 */
var Like = function(like){
	this.id = like.id || null;
	this.userId = like.userId;
	this.authorId = like.authorId;
	this.postId = like.postId;
	this.title = like.title;
	this.likeTime = like.likeTime || (new Date()).getTime();
}

/**
 * 获取我点赞了的
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     回调函数
 */
Like.getMyLikes = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('like', function(err, collectionLike){
			if(err){
				db.close();
				return cb(err);
			}
			collectionLike.find({userId:userId}, {skip:offset, limit:limit, sort:{likeTime:-1}}).toArray(function(err, likes){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, likes);
			});
		});
	});
}


/**
 * 获取赞了我的
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     回调函数
 */
Like.getLikesToMe = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('like', function(err, collectionLike){
			if(err){
				db.close();
				return cb(err);
			}
			collectionLike.find({authorId:userId}, {skip:offset, limit:limit, sort:{likeTime:-1}}).toArray(function(err, likes){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, likes);
			});
		});
	});
}

module.exports = Like;
