var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var moment = require('moment');

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
	this.categoryId = post.categoryId;
	this.content = post.content;
	this.isPublic = post.isPublic || 0;
	this.isOriginal = post.isOriginal || 0;
	this.sourceUrl = post.sourceUrl;
}

Post.getStatics = function(postId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post_static', function(err, collectionPS){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPS.findOne({postId:postId}, function(err, postStatic){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, postStatic);
			});
		});
	});
}

Post.getPostsBySort = function(userId, sortBy, offset, limit, cb){
	Post.getPostIdsBySort(userId, sortBy, -1, offset, limit, function(err, postStatics){
		if(err){
			return cb(err);
		}
		if(! postStatics){
			return cb(null, []);
		}
		var posts = [];
		async.eachSeries(postStatics, function(postStatic, callback){
			Post.getPostById(postStatic.postId, function(err, post){
				if(err){
					return callback(err);
				}
				if(post){
					post.statics = postStatic;
					post.postDate = moment(post.postTime).format('YYYY-MM-DD');
					posts.push(post);
				}
				return callback();
			});
		}, function(err){
			if(err){
				return cb(err);
			}
			return cb(null, posts);
		});
	});
}

Post.getPostIdsBySort = function(userId, sortBy, asc, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post_static', function(err, collectionPS){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPS.find({userId:userId}, {sort:[[sortBy,asc]], skip:offset, limit:limit}).toArray(function(err, docs){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, docs);
			});
		});
	});
}

Post.getPostById = function(postId, cb){
	postId = parseInt(postId);	// 转换成整型，mongodb类型敏感
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post', function(err, collectionPost){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPost.findOne({id:postId}, function(err, post){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, post);
			});
		});
	});
}

Post.getPostsByCategory = function(categoryId, offset, limit, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post', function(err, collectionPost){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPost.find({categoryId:categoryId}, {skip:offset, limit:limit}).toArray(function(err, posts){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, posts);
			});
		});
	});
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
		categoryId : this.categoryId,
		postTime : this.postTime,
		content : this.content,
		isPublic : this.isPublic,
		isOriginal : this.isOriginal,
		sourceUrl : this.sourceUrl
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
					if(err){
						db.close();
						return cb(err);
					}
					db.collection('post_static', function(err, collectionPS){
						if(err){
							db.close();
							return cb(err);
						}
						collectionPS.insert({userId:post.userId, postId:postId, reads:0, likes:0, collects:0, shares:0, postTime:post.postTime}, function(err, result){
							db.close();
							if(err){
								return cb(err);
							}
							return cb(null, postId);
						});
					});
				})
			});
		});
	});
}

Post.prototype.modify = function(cb){

	var id = this.id,
	post = {
		title : this.title,
		summary : this.summary,
		categoryId : this.categoryId,
		postTime : this.postTime,
		content : this.content,
		isPublic : this.isPublic,
		isOriginal : this.isOriginal,
		sourceUrl : this.sourceUrl
	};
	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post', function(err, postCollection){
			if(err){
				db.close();
				return cb(err);
			}
			postCollection.update({id:id}, {$set:post}, function(err, result){
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
 * 获取某个分类下的文章数量
 * @param  {int}   categoryId 文章编号
 * @param  {Function} cb         回调函数
 */
Post.getPostCountOfCategory = function(categoryId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post', function(err, collectionPost){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPost.count({categoryId:categoryId}, function(err, counts){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, counts);
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