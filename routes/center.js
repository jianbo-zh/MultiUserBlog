var express = require('express');
var router = express.Router();
var commonFn = require('../lib/common.js');

var fPostAdd = require('../filter/postAdd.js');

var PostModel = require('../model/post.js');
var TagModel = require('../model/tag.js');

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
	req.data = data;
	next();
});


/**
 * 用户中心
 */
router.get('/', function(req, res) {
	var data = req.data;
	data.title = data.user.nickname + "的个人中心";
	data.sufJs = commonFn.js('center.js');
	data.current = 'posts';

	res.render('center/center', data);
});

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

	res.render('center/postAdd', data);
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

module.exports = router;