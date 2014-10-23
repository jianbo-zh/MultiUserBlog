var express = require('express');
var router = express.Router();
var async = require('async');
var commonFn = require('../lib/common.js');
var logger = require('../lib/logger.js');
var moment = require('moment');

var fPostAdd = require('../filter/postAdd.js');
var fPostModify = require('../filter/postModify.js');
var fCategoryAdd = require('../filter/categoryAdd.js');
var fCategoryModify = require('../filter/categoryModify.js');
var fTagModify = require('../filter/tagModify.js');
var fMessageAdd = require('../filter/messageAdd.js');
var fMessageReply = require('../filter/messageReply.js');

var UserModel = require('../model/user.js');
var PostModel = require('../model/post.js');
var TagModel = require('../model/tag.js');
var CategoryModel = require('../model/category.js');
var MessageModel = require('../model/message.js');

/**
 * 公共方法，检查是否登录，及获取公共数据
 */
router.use(function(req, res, next){
	if(req.session.isLogin !== true){
		req.flash('refUrl', req.originalUrl);	// 登录后跳转到当前访问URL
		console.log('设置refUrl：' + req.originalUrl);
		return res.redirect(commonFn.url('/login'));
	}
	var data = {};
	data.user = req.session.user;
	data.preCss = commonFn.css(['reset.css', 'center.css']);
	data.preJs = commonFn.js(['jquery.js']);
	data.sufJs = '';
	req.data = data;
	next();
});


/**
 * 用户中心
 */
router.get('/', getPosts);

/**
 * 文章列表
 */
router.get('/posts', getPosts);

/**
 * 获取新建文章
 */
router.get('/post', function(req, res){
	var data = req.data;
	data.title = "新增文章";
	data.preCss = data.preCss + "\n" + commonFn.css(['kindeditor.css']);
	data.preJs = data.preJs + "\n" + commonFn.js(['jquery.form.js', 'kindeditor.js', 'kindeditor_zh.js']);
	data.sufJs = commonFn.editor("content") + "\n" + commonFn.js(['postAdd.js']);
	data.current = 'posts';

	CategoryModel.getCategoriesOfUser(data.user.id, function(err, categories){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		data.categories = categories;
		return res.render('center/postAdd', data);
	});
});

router.get('/post/:id', function(req, res){
	var postId = req.params.id,
		data = req.data;
	data.title = "修改文章";
	data.preCss = data.preCss + "\n" + commonFn.css(['kindeditor.css']);
	data.preJs = data.preJs + "\n" + commonFn.js(['jquery.form.js', 'kindeditor.js', 'kindeditor_zh.js']);
	data.sufJs = commonFn.editor("content") + "\n" + commonFn.js(['postModify.js']);
	data.current = 'posts';

	PostModel.getPostById(postId, function(err, post){
		if(err){
			// 获取错误
			return res.send('发生错误！'+err.message);
		}
		if(! post){
			// 没有对应的文章
			return res.send('没有对应的文章');
		}
		async.parallel({
			categories : function(callback){
				CategoryModel.getCategoriesOfUser(data.user.id, callback);
			},
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
				return res.send('发生错误！' + err.message);
			}
			post.category = results.category;
			post.tags = results.tags;
			post.statics = results.statics;
			console.log(post);
			data.post = post;
			data.categories = results.categories;
			res.render('center/postModify', data);
		});
	});
});

/**
 * 保存新建文章
 */
router.post('/post', function(req, res){
	var userId = req.session.user.id;

	fPostAdd.run(req.body, function(err, newPost){		// 验证并过滤
		if(err){
			return res.send({status:'fail', message:err.message});
		}

		var postObj = new PostModel(userId, newPost);

		postObj.add(function(err, postId){
			if(err){
				return res.send({status:'fail', message:'新建文章失败！'});
			}

			var tags = newPost.tags;

			if(tags.length == 0){									// 如果没有关联标签
				return res.send({status:'success'});
			}
			TagModel.adds(userId, tags, function(err, tagIds){		// 保存标签
				if(err){
					return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
				}
				if(tagIds.length == 0){
					return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
				}
				PostModel.setTags(postId, tagIds, function(err, result){	// 关联文章和标签
					if(err){
						return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
					}
					return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
				});
			});
		});
	});
});

/**
 * 修改文章
 */
router.post('/post/:id', function(req, res){
	var userId = req.session.user.id;

	fPostModify.run(req.body, function(err, newPost){		// 验证并过滤
		if(err){
			return res.send({status:'fail', message:err.message});
		}

		var postObj = new PostModel(userId, newPost);

		postObj.modify(function(err, result){
			if(err){
				return res.send({status:'fail', message:'文章修改失败！'});
			}

			var tags = newPost.tags;

			if(tags.length == 0){									// 如果没有关联标签
				return res.send({status:'success'});
			}
			TagModel.adds(userId, tags, function(err, tagIds){		// 保存标签
				if(err){
					return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
				}
				if(tagIds.length == 0){
					return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
				}
				PostModel.setTags(newPost.id, tagIds, function(err, result){	// 关联文章和标签
					if(err){
						return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
					}
					return res.send({status:'success'});	// 如果保存标签失败了，文章也添加成功
				});
			});
		});
	});
});

/**
 * 新增分类
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.post('/category', function(req, res){
	var data = req.data;
	
	fCategoryAdd.run(data.user.id, req.body, function(err, category){
		if(err){
			return res.send({status:'fail', message:'发生错误！'+err.message});
		}
		var category = new CategoryModel(data.user.id, category);

		category.add(function(err, categoryId){
			if(err){
				return res.send({status:'fail', message:'发生错误！'+err.message});
			}
			return res.send({status:'success'});
		});
	});
});

router.get('/category/:id', function(req, res){
	var data = req.data,
	categoryId = parseInt(req.params.id);
	data.urlFn = commonFn.url;
	data.current = 'categories';

	async.parallel({
		category : function(callback){
			CategoryModel.getById(categoryId, callback);
		},
		posts : function(callback){

			PostModel.getPostsByCategory(categoryId, function(err, posts){

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
		return res.render('center/postsOfCategory', data);
	});
});

router.get('/tag/:id', function(req, res){
	var data = req.data;
	data.current = 'tags';
	data.urlFn = commonFn.url;
	tagId = parseInt(req.params.id);

	async.parallel({
		tag : function(callback){
			TagModel.getTagById(tagId, callback);
		},
		posts : function(callback){
			TagModel.getRelByTagId(tagId, function(err, rels){
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
		return res.render('center/postsOfTag', data);
	});	
});

/**
 * 修改分类
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.post('/category/:id', function(req, res){
	var data = req.data;
	req.body.id = req.params.id;

	fCategoryModify.run(data.user.id, req.body, function(err, category){
		if(err){
			return res.send({status:'fail', message:'发生错误！' + err.message});
		}
		var category = new CategoryModel(data.user.id, category);
		category.modify(function(err, result){
			if(err){
				return res.send({status:'fail', message:'发生错误！' + err.message});
			}
			return res.send({status:'success'});
		});
	});

});

router.delete('/category/:id', function(req, res){
	var data = req.data,
		id = parseInt(req.params.id);
	CategoryModel.delete(data.user.id, id, function(err, result){
		if(err){
			return res.send({status:'fail', message:'发生错误！' + err.message});
		}
		return res.send({status:'success'});
	});
});


/**
 * 获取用户所有分类
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.get('/categories', function(req, res){
	var data = req.data;
	data.title = '所有分类';
	data.sufJs = commonFn.js(['jquery.form.js', 'category.js']);
	data.current = 'categories';

	CategoryModel.getCategoriesOfUser(data.user.id, function(err, categories){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		if(!categories){
			data.categories = [];
		}
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
			data.categories = categories;
			res.render('center/categories', data);
		});
	});
});

/**
 * 获取用户所有标签
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.get('/tags', function(req, res){
	var data = req.data;
		data.title = '所有标签';
		data.sufJs = commonFn.js('tags.js');
		data.current = 'tags';
	TagModel.getTagsOfUser(data.user.id, function(err, tags){
		if(err){
			return res.send('发生错误！'+err.message);
		}
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
			data.tags = tags;
			res.render('center/tags', data);
		});
	});
});

/**
 * 修改标签
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.post('/tag/:id', function(req, res){
	var data = req.data;
	req.body.id = parseInt(req.params.id);

	fTagModify.run(data.user.id, req.body, function(err, tag){
		console.log(tag);
		if(err){
			return res.send({status:'fail', message:'发生错误！'+err.message});
		}
		var t = new TagModel(tag);
		t.modify(function(err, result){
			if(err){
				return res.send({status:'fail', message:'发生错误！'+err.message});
			}
			return res.send({status:'success'});
		});
	});
});

/**
 * 删除指定标签
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.delete('/tag/:id', function(req, res){
	var data = req.data,
	tagId = parseInt(req.params.id);

	TagModel.delete(data.user.id, tagId, function(err, result){
		if(err){
			return res.send({status:'fail', message:'发生错误！'+err.message});
		}
		return res.send({status:'success'});
	});
});

/**
 * 发送私信表单
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.get('/message', function(req, res){
	var data = req.data;
	data.title = '发送私信';
	data.current = 'messages';
	data.preCss = data.preCss + "\n" + commonFn.css(['kindeditor.css']);
	data.preJs = data.preJs + "\n" + commonFn.js(['jquery.form.js', 'kindeditor.js', 'kindeditor_zh.js']);
	data.sufJs = commonFn.editor("content") + "\n" + commonFn.js(['messageAdd.js']);

	return res.render('center/messageAdd', data);
});

/**
 * 发送私信
 * @param  {object} req 
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.post('/message', function(req, res){
	var data = req.data;

	fMessageAdd.run(data.user.id, req.body, function(err, message){
		if(err){
			return res.send({status:'fail', message:'发生错误！'+err.message});
		}
		var m = new MessageModel(message);
		m.add(function(err, messageId){
			if(err){
				return res.send({status:'fail', message:'发生错误！'+err.message});
			}
			return res.send({status:'success'});
		});
	});
});

/**
 * 获取消息列表
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
router.get('/messages', function(req, res){
	var data = req.data;
	data.title = '私信列表';
	data.current = 'messages';
	var type = (req.query.type===undefined) ? null : (parseInt(req.query.type) ? 1 : 0);

	MessageModel.getMessageOfUser(data.user.id, type, function(err, messages){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		async.each(messages, function(message, callback){
			UserModel.getUserById(message.relId, function(err, user){
				if(err){
					return callback(err);
				}
				message.relUser = user;
				message.sendDate = moment(message.time).format('YYYY-MM-DD');
				return callback();
			});
		}, function(err){
			if(err){
				return res.send('发生错误！'+err.message);
			}
			data.messages = messages
			return res.render('center/messages', data);
		});
	});
});

router.get('/message/:id', function(req, res){
	var data = req.data;
	data.current = 'messages';
	messageId = parseInt(req.params.id);
	if(!messageId){
		return res.send('消息编号不能为空！');
	}

	MessageModel.getMessageById(data.user.id, messageId, function(err, message){
		if(err){
			return res.send('发生错误！'+err.message);
		}
		if(message.type == 0){	// 接收的消息，需要回复
			data.preCss = data.preCss + "\n" + commonFn.css(['kindeditor.css']);
			data.preJs = data.preJs + "\n" + commonFn.js(['jquery.form.js', 'kindeditor.js', 'kindeditor_zh.js']);
			data.sufJs = commonFn.editor("content") + "\n" + commonFn.js(['messageReply.js']);
		}

		UserModel.getUserById(message.relId, function(err, user){
			if(err){
				return res.send('发生错误！'+err.message);
			}
			message.relUser = user;
			message.sendDate = moment(message.time).format('YYYY-MM-DD');
			data.message = message;
			if(message.type == 1){
				data.title = '我发送给'+user.nickname+'的消息';
			}else{
				data.title = user.nickname + '发送给我的消息';
			}
			return res.render('center/message', data);
		});
	});
});

router.post('/message/:id', function(req, res){
	var data = req.data,
		messageId = parseInt(req.params.id);
		req.body.messageId = messageId;

		fMessageReply.run(data.user.id, req.body, function(err, message){
		if(err){
			return res.send({status:'fail', message:'发生错误！'+err.message});
		}
		var m = new MessageModel(message);
		m.add(function(err, messageId){
			if(err){
				return res.send({status:'fail', message:'发生错误！'+err.message});
			}
			return res.send({status:'success'});
		});
	});
});

/**
 * 获取用户所有文章
 * @param  {object} req 请求对象
 * @param  {object} res 响应对象
 */
function getPosts(req, res) {
	var data = req.data;
	data.title = data.user.nickname + "的个人中心";
	data.sufJs = commonFn.js('center.js');
	data.current = 'posts';

	var userId = data.user.id,
		offset = req.query.page ? (req.query.page - 1) : 0,
		limit = commonFn.config('pageLimit'),
		sortBy;
	switch(req.query.sort){
		case 'collects': sortBy = 'collects'; break;
		case 'likes': sortBy = 'likes'; break;
		case 'shares': sortBy = 'shares'; break;
		case 'reads': sortBy = 'reads'; break;
		default : sortBy = 'times';
	}

	PostModel.getPostsBySort(userId, sortBy, offset, limit, function(err, posts){
		if(err){
			// 发生错误 ??
		}
		async.eachSeries(posts, function(post, callback){
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
			data.urlFn = commonFn.url;
			data.posts = posts;
			res.render('center/center', data);
		});
	});
}

module.exports = router;