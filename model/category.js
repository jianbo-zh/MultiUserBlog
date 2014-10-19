var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var async = require('async');
var util = require('util');

/**
 * 分类的构造函数
 * @param {object} category 初始化对象
 */
var Category = function(userId, category){
	this.id = category.id || null;
	this.userId = userId;
	this.name = category.name;
	this.parent = category.parent || 0;
	this.sort = category.sort || 100;
}


Category.prototype.add = function(cb){
	var c = {};
	c.userId = this.userId;
	c.name = this.name;
	c.parent = this.parent;
	c.sort = this.sort;

	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		commonFn.getNextId(db, 'category', function(err, categoryId){
			if(err){
				db.close();
				return cb(err);
			}
			c.id = categoryId;
			db.collection('category', function(err, collectionCategory){
				if(err){
					db.close();
					return cb(err);
				}
				collectionCategory.insert(c, function(err, result){
					db.close();
					if(err){
						return cb(err);
					}
					return cb(null, categoryId);
				});
			});
		});
	});
}

Category.prototype.modify = function(cb){
	var c = {}, 
		categoryId = this.id;
	c.name = this.name;

	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('category', function(err, collectionCategory){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCategory.update({id:categoryId}, {$set:c}, function(err, result){
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
 * 删除分类
 * @param  {int}   userId     用户编号
 * @param  {int}   categoryId 分类编号
 * @param  {Function} cb         [description]
 */
Category.delete = function(userId, categoryId, cb){
	db.getWrite(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('category', function(err, collectionCategory){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCategory.remove({userId:userId, id:categoryId}, function(err, result){
				if(err){
					db.close();
					return cb(err);
				}
				// 重新设置对应文章的分类为未分类
				db.collection('post', function(err, collectionPost){
					if(err){
						db.close();
						return cb(err);
					}
					collectionPost.update({userId:userId, categoryId:categoryId}, {categoryId:0}, function(err, result){
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

Category.getById = function(categoryId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('category', function(err, collectionCategory){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCategory.findOne({id:categoryId}, function(err, category){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, category);
			});
		});
	});
}

Category.getCategoriesOfUser = function(userId, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('category', function(err, collectionCategory){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCategory.find({userId:userId}).toArray(function(err, categories){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, categories);
			});
		});
	});
}

/**
 * 检查用户的分类是否存在
 * @param  {int}   userId 用户编号
 * @param  {string}   name   分类名称
 * @param  {Function} cb     回调函数
 */
Category.checkUserCategoryIfExists = function(userId, name, cb){
	db.getRead(function(err, db){
		if(err){
			return cb(err);
		}
		db.collection('category', function(err, collectionCategory){
			if(err){
				db.close();
				return cb(err);
			}
			collectionCategory.count({userId:userId, name:name}, function(err, counts){
				db.close();
				if(err){
					return cb(err);
				}
				return (counts>0) ? cb(null, true) : cb(null, false);
			});
		});
	});
}

module.exports = Category;