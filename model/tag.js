var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 标签的构造函数
 * @param {object} tag 初始化对象
 */
var Tag = function(tag){
	this.id = tag.id || null;
	this.userId = tag.userId || null;
	this.name = tag.name || null;
}

Tag.getTagById = function(tagId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('tag', function(err, collectionTag){
			if(err){
				db.close();
				return cb(err);
			}
			collectionTag.findOne({id:tagId}, function(err, tag){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, tag);
			});
		});
	});
}


Tag.getTagsOfUser = function(userId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('tag', function(err, collectionTag){
			if(err){
				db.close();
				return cb(err);
			}
			collectionTag.find({userId:userId}).toArray(function(err, tags){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, tags);
			});
		});
	});
}

Tag.getPostCountOfTag = function(tagId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post_rel_tag', function(err, collectionTag){
			if(err){
				db.close();
				return cb(err);
			}
			collectionTag.count({tagId:tagId}, function(err, count){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, count);
			});
		});
	});
}

Tag.getTagsByPostId = function(postId, cb){

	Tag.getRelByPostId(postId, function(err, rels){
		if(err){
			return cb(err);
		}
		db.getRead(function(err, db){
			if(err){
				return cb(err);
			}
			db.collection('tag', function(err, collectionTag){
				if(err){
					db.close();
					return cb(err);
				}
				var tags = [];
				async.each(rels, function(rel, callback){
					collectionTag.findOne({id:rel.tagId}, function(err, tag){
						if(err){
							return callback(err);
						}
						if(tag){
							tags.push(tag);
						}
						return callback();
					});
				}, function(err){
					db.close();			// 成功，失败都要关闭数据库连接
					if(err){
						return cb(err);
					}
					return cb(null, tags);
				});
			});
		});
	});
}

Tag.getRelByTagId = function(tagId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post_rel_tag', function(err, collectionPRT){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPRT.find({tagId:tagId}, {fields:{postId:1}}).toArray(function(err, docs){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, docs);
			});
		});
	});
}

Tag.getRelByPostId = function(postId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('post_rel_tag', function(err, collectionPRT){
			if(err){
				db.close();
				return cb(err);
			}
			collectionPRT.find({postId:postId}, {fields:{tagId:1}}).toArray(function(err, docs){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, docs);
			});
		});
	});
}

/**
 * 批量添加标签
 * @param  {int}   userId 用户ID
 * @param  {array}   tags   标签数组
 * @param  {Function} cb     回调函数
 */
Tag.adds = function(userId, tags, cb){
	if(!userId){
		throw new Error('必须指定用户ID！');
	}
	if(!tags){
		throw new Error('必须标签！');
	}

	var ids = [];	// 返回标签IDs

	if(!util.isArray(tags)){
		tags = [tags];
	}
	async.eachSeries(tags, function(tagName, callback){

		async.waterfall([
			function(callback){
				db.getWrite(callback);
			},
			function(db, callback){
				db.collection('tag', function(err, collectionTag){
					if(err){
						db.close();		// 关闭数据库连接
						return callback(err);
					}else{
						return callback(null, db, collectionTag);
					}
				});
			},
			function(db, collectionTag, callback){
				collectionTag.findOne({userId:userId, name:tagName}, function(err, tagObj){		// 检查标签是否存在
					if(err){
						db.close();		// 关闭数据库连接
						return callback(err);
					}
					if(! tagObj){	// 没有标签则添加
						commonFn.getNextId(db, 'tag', function(err, tagId){
							if(err){
								db.close();		// 关闭数据库连接
								return callback(err);
							}
							db.collection('tag', function(err, collectionTag){
								if(err){
									db.close();		// 关闭数据库连接
									return callback(err);
								}
								collectionTag.insert({id:tagId, userId:userId, name:tagName}, function(err, result){
									db.close();		// 关闭数据库连接
									if(err){
										return callback(err);
									}
									return callback(null, tagId);
								});
							});
						});
		    		}else{			// 有标签则直接返回标签ID
						db.close();		// 关闭数据库连接
		    			return callback(null, tagObj.id);
		    		}
		    	});
			}
		], function(err, tagId){
			if(err){
				return callback(err);
			}
			ids.push(tagId);
			return callback();
		});
	}, function(err){
		if(err){
			if(ids.length>0){	// 如果有部分成功了
				return cb(null, ids);
			}
			return cb(err);
		}else{
			if(ids.length>0){	// 如果有部分成功了
				return cb(null, ids);
			}
			return cb(new Error('添加标签失败！'));
		}
	});
}

Tag.prototype.modify = function(cb){
	var t = {}, tagId = this.id, userId = this.userId;
	t.name = this.name;

	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('tag', function(err, collectionTag){
			if(err){
				db.close();
				return cb(err);
			}
			collectionTag.update({id: tagId, userId:userId}, {$set: t}, function(err, result){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, result);
			});
		});
	});
}


Tag.checkUserTagIfExists = function(userId, TagName, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('tag', function(err, collectionTag){
			if(err){
				db.close();
				return cb(err);
			}
			collectionTag.count({userId:userId, name:TagName}, function(err, count){
				db.close();
				if(err){
					return cb(err);
				}
				return count>0 ? cb(null, true) : cb(null, false);
			});
		});
	});
}

Tag.delete = function(userId, tagId, cb){
	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('tag', function(err, collectionTag){
			if(err){
				db.close();
				return cb(err);
			}
			collectionTag.remove({id: tagId, userId:userId}, function(err, result){
				if(err){
					db.close();
					return cb(err);
				}
				// 删除关联标签
				db.collection('post_rel_tag', function(err, collectionPRT){
					if(err){
						db.close();
						return cb(err);
					}
					collectionPRT.remove({tagId:tagId}, function(err, result){
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
}


module.exports = Tag;