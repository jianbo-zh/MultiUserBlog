var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 评论的构造函数
 * @param {object} message 初始化对象
 */
var Comment = function(userId, comment){
	this.id = comment.id || null;
	this.userId = userId;
	this.authorId = comment.authorId;
	this.postId = comment.postId;
	this.title = comment.title;
	this.content = comment.content;
	this.commentTime = comment.commentTime || (new Date()).getTime();
	this.score = comment.score || 0;
	this.parent = comment.parent || 0;
}

/**
 * 获取我评论了的
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     回调函数
 */
Comment.getMyComments = function(userId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('comment', function(err, collectionComment){
			if(err){
				db.close();
				return cb(err);
			}
			collectionComment.find({userId:userId}, {skip:offset, limit:limit, sort:{commentTime:-1}}).toArray(function(err, comments){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, comments);
			});
		});
	});
}


/**
 * 获取评论了我的
 * @param  {int}   userId 用户编号
 * @param  {int}   offset 偏移量
 * @param  {int}   limit  获取记录条数
 * @param  {Function} cb     回调函数
 */
Comment.getCommentsToMe = function(authorId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('comment', function(err, collectionComment){
			if(err){
				db.close();
				return cb(err);
			}
			collectionComment.find({authorId:authorId, parent:0}, {skip:offset, limit:limit, sort:{commentTime:-1}}).toArray(function(err, comments){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, comments);
			});
		});
	});
}

Comment.getCommentById = function(commentId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('comment', function(err, collectionComment){
			if(err){
				db.close();
				return cb(err);
			}
			collectionComment.findOne({id:commentId}, function(err, comment){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, comment);
			});
		});
	});
};

Comment.getSubCommentsOfParent = function(parentId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('comment', function(err, collectionComment){
			if(err){
				db.close();
				return cb(err);
			}
			collectionComment.find({parent:parentId}, {skip:offset, limit:limit, sort:{commentTime:-1}}).toArray(function(err, comments){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, comments);
			});
		});
	});
};

Comment.prototype.add = function(cb){
	var c = {
		userId : this.userId,
		authorId : this.authorId,
		postId : this.postId,
		title : this.title,
		content : this.content,
		commentTime: this.commentTime,
		score : this.score,
		parent : this.parent
	};

	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		commonFn.getNextId(db, 'comment', function(err, commentId){
			if(err){
				db.close();
				return cb(err);
			}
			c.id = commentId;	// 设置文章ID
			db.collection('comment', function(err, collectionComment){
				if(err){
					db.close();
					return cb(err);
				}
				collectionComment.insert( c , function(err, result){
					db.close();
					if(err){
						return cb(err);
					}
					return cb(null, commentId);
				});
			});
		});
	});
}

module.exports = Comment;
