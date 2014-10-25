var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 消息的构造函数
 * @param {object} collect 初始化对象
 */
var Collect = function(collect){
	this.id = collect.id || null;
	this.userId = collect.userId;
	this.authorId = collect.authorId;
	this.postId = collect.postId;
	this.title = collect.title;
	this.time = collect.time;
}

/**
 * 查询用户的收藏
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  返回记录数
 * @param  {Function} cb     [description]
 */
Collect.getsOfUser = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('collect', function(err, collectionCollect){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCollect.find({userId:userId}, {skip:offset, limit:limit, sort:{'time':-1}}).toArray(function(err, collects){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, collects);
			});
		});
	});
}

/**
 * 删除收藏博客
 * @param  {int}   userId    用户编号
 * @param  {int}   collectId 收藏编号
 * @param  {Function} cb       回调函数 
 */
Collect.delete = function(userId, collectId, cb){
	var c = {userId:userId, id:collectId};
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('collect', function(err, collectionCollect){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCollect.remove(c, function(err, result){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, result);
			});
		});
	});
}

module.exports = Collect;
