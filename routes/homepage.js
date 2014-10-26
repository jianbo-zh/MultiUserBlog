var express = require('express');
var router = express.Router();
var async = require('async');
var commonFn = require('../lib/common.js');
var moment = require('moment');

var UserModel = require('../model/user.js');
var CategoryModel = require('../model/category.js');
var TagModel = require('../model/tag.js');
var PostModel = require('../model/post.js');

router.use('/:id', function(req, res, next){
	var data = {};
		data.authorId = parseInt(req.params.id);
		data.preCss = commonFn.css(['reset.css', 'homepage.css']);
		data.preJs = commonFn.js(['jquery.js']);
		data.sufJs = '';

	// 检查是否登录，登录则查找用户信息
	if(req.session.isLogin){
		data.user = req.session.user;
	}

	// 获取作者信息，及所有分类和标签
	UserModel.getUserById(data.authorId, function(err, author){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		data.author = author;

		async.parallel({
			categories : function(callback){
				CategoryModel.getCategoriesOfUser(author.id, 0, 10, function(err, categories){
					async.each(categories, function(category, callback){
						var postCount = PostModel.getPostCountOfCategory(category.id, function(err, counts){
							if(err){
								return callback(err);
							}
							category.postCount = counts;
							return callback();
						});
					}, function(err){
						if(err){
							return callback(err);
						}
						return callback(null, categories);
					});
				});
			},
			tags : function(callback){
				TagModel.getTagsOfUser(author.id, 0, 10, function(err, tags){
					async.each(tags, function(tag, callback){
						TagModel.getPostCountOfTag(tag.id, function(err, count){
							if(err){
								return callback(err);
							}
							tag.postCount = count;
							return callback();
						});
					}, function(err){
						if(err){
							return callback(err);
						}
						return callback(null, tags);
					});
				});
			}
		}, function(err, results){
			if(err){
				return res.send('发生错误！'+err.message);
			}
			data.categories = results.categories;
			data.tags = results.tags;
			req.data = data;
			next();
		});
	});
});

router.get('/:id', function(req, res) {
	var data = req.data,
		offset = 0,
		limit = 1000,
		sortBy = 'postTime';
		data.title = '最新文章';

	PostModel.getPostsBySort(data.authorId, sortBy, offset, limit, function(err, posts){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		async.each(posts, function(post, callback){
			async.parallel({
				tags : function(callback){
					TagModel.getTagsByPostId(post.id, callback);
				},
				category : function(callback){
					CategoryModel.getById(post.categoryId, callback);
				}
			}, function(err, results){
				if(err){
					return callback(err);
				}
				post.tags = results.tags;
				post.category = results.category;
				return callback();
			});
		}, function(err){
			if(err){
				return res.send('发生错误！'+err.message);
			}
			data.posts = posts;
			return res.render('homepage/index', data);
		});
	});
});

router.get('/:id/categories', function(req, res){
	var data = req.data,
		offset = 0,
		limit = 20;
	data.title = '所有分类';

	CategoryModel.getCategoriesOfUser(data.author.id, offset, limit, function(err, categories){
		async.each(categories, function(category, callback){
			var postCount = PostModel.getPostCountOfCategory(category.id, function(err, counts){
				if(err){
					return callback(err);
				}
				category.postCount = counts;
				return callback();
			});
		}, function(err){
			if(err){
				return res.send('发生错误！'+err.message);
			}
			data.postCategories = categories;
			return res.render('homepage/categories', data);
		});
	});
});

router.get('/:id/tags', function(req, res){
	var data = req.data,
		offset = 0,
		limit = 20;
	data.title = '所有标签';
	
	TagModel.getTagsOfUser(data.author.id, offset, limit, function(err, tags){
		async.each(tags, function(tag, callback){
			TagModel.getPostCountOfTag(tag.id, function(err, count){
				if(err){
					return callback(err);
				}
				tag.postCount = count;
				return callback();
			});
		}, function(err){
			if(err){
				return res.send('发生错误！'+err.message);
			}
			data.postTags = tags;
			return res.render('homepage/tags', data);
		});
	});
});

router.get('/:id/category/:categoryId', function(req, res){
	var data = req.data,
		offset = 0,
		limit = 20;
	categoryId = parseInt(req.params.categoryId);
	data.title = '所有标签';
	
	async.parallel({
		category : function(callback){
			CategoryModel.getById(categoryId, callback);
		},
		posts : function(callback){

			PostModel.getPostsByCategory(categoryId, offset, limit, function(err, posts){

				async.eachSeries(posts, function(post, callback){

					async.parallel({
/*						category : function(callback){
							CategoryModel.getById(post.categoryId, callback);
						},*/
						tags : function(callback){
							TagModel.getTagsByPostId(post.id, callback);
						},
						statics : function(callback){
							PostModel.getStatics(post.id, callback);
						}
					}, function(err, results){
						if(err){
							return callback(err);
						}
						/*post.category = results.category;*/
						post.tags = results.tags;
						post.statics = results.statics;
						post.postDate = moment(post.postTime).format('YYYY-MM-DD');
						return callback();
					});

				}, function(err){
					if(err){
						return callback(err);
					}
					return callback(null, posts);
				});
			});
		}
	}, function(err, results){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		data.title = '分类：' + results.category.name;
		data.category = results.category;
		data.posts = results.posts
		return res.render('homepage/category', data);
	});
});

router.get('/:id/tag/:tagId', function(req, res){
	var data = req.data,
		offset = 0,
		limit = 20;
	tagId = parseInt(req.params.tagId);
	
	async.parallel({
		tag : function(callback){
			TagModel.getTagById(tagId, callback);
		},
		posts : function(callback){
			TagModel.getRelsByTagId(tagId, offset, limit, function(err, rels){
				if(err){
					return callback(err);
				}

				var posts = [];

				async.eachSeries(rels, function(rel, callback){
					PostModel.getPostById(rel.postId, function(err, post){
						if(err){
							return callback(err);
						}
						async.parallel({
							category : function(callback){
								CategoryModel.getById(post.categoryId, callback);
							},
							tags : function(callback){
								TagModel.getTagsByPostId(post.id, callback);
							},
							statics : function(callback){
								PostModel.getStatics(post.id, callback);
							}
						}, function(err, results){
							if(err){
								return callback(err);
							}
							post.category = results.category;
							post.tags = results.tags;
							post.statics = results.statics;
							post.postDate = moment(post.postTime).format('YYYY-MM-DD');
							posts.push(post);
							return callback();
						});
					});
				}, function(err){
					if(err){
						return callback(err);
					}
					return callback(null, posts);
				});
			});
		}
	}, function(err, results){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		data.tag = results.tag;
		data.posts = results.posts;
		data.title = '标签：' + data.tag.name;
		return res.render('homepage/tag', data);
	});	
});

module.exports = router;
