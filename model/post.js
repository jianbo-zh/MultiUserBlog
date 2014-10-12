var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');

/**
 * 文章对象的构造函数
 * @param {int} userId 用户ID
 * @param {object} post   文章的初始化参数
 */
var Post = function(userId, post){
	this.userId = userId;
	this.id = post.id || null,
	this.title = post.title;
	this.summary = post.summary || '';
	this.postTime = post.postTime || (new Date()).getTime();
	this.content = post.content;
	this.isPublic = post.isPublic || 0;
	this.isOriginal = post.isOriginal || 0;
}

/**
 * 新建一个文章
 * @param {Function} cb 回调函数
 */
Post.prototype.add = function(cb){
	var post = {
		userId : this.userId,
		title : this.title,
		summary : this.summary,
		postTime : this.postTime,
		content : this.content,
		isPublic : this.isPublic,
		isOriginal : this.isOriginal
	};
	db.getWrite(function(err, db){
		if(err){
			db.close();
			return cb(err);
		}
		commonFn.getNextId(db, 'post', function(err, postId){
			if(err){
				db.close();
				return cb(err);
			}
			
			post.id = postId;	// 设置文章ID

			db.collection('post', function(err, postCollection){
				if(err){
					db.close();
					return cb(err);
				}
				postCollection.insert(post, function(err, result){
					db.close();
					if(err){
						return cb(err);
					}
					return cb(null, postId);
				})
			});
		});
		
	});
}

/**
 * 设置文章对应的标签关联 表post_rel_tag
 * @param {int}   postId 文章ID
 * @param {array}   tagIds 标签ID数组
 * @param {Function} cb     回调函数
 */
Post.setTags = function(postId, tagIds, cb){
	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post_rel_tag', function(err, collectionPRT){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPRT.remove({postId:postId}, function(err, result){	// 删除原先的关联
				if(err){
					db.close();
					return cb(err);
				}

				async.eachSeries(tagIds, function(tagId, callback){		// 添加关联
					commonFn.getNextId(db, 'post_rel_tag', function(err, prtId){
						if(err){
							return callback(err);
						}
						db.collection('post_rel_tag', function(err, collectionPRT){
							collectionPRT.insert({id:prtId, postId:postId, tagId:tagId}, function(err, result){
								if(err){
									return callback(err);
								}
								return callback();
							});
						});
					});
				}, function(err){
					if(err){
						db.close();
						return cb(err);
					}
					return cb(null, true);
				});
			});
		});
	});
}

module.exports = Post;