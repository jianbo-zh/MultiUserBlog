
var validator = require('validator');

exports.run = function(post, cb){
	var p = {};
	p.title = validator.escape(validator.trim(post.title));
	p.content = validator.trim(post.content);
	p.categoryId = validator.toInt(post.categoryId);
	p.isPublic = post.isPublic ? 1 : 0;
	p.isOriginal = post.isOriginal ? 1 : 0;

	if(p.title == ''){
		return cb(new Error('文章标题不能为空！'));
	}else if(p.content == ''){
		return cb(new Error('文章内容不能为空！'));
	}

	// 标签过滤
	if(post.tags){
		var obj = {}, newTags = [];
		post.tags.forEach(function(tag){
			tag = validator.trim(tag);
			if((tag !== '') && (!obj[tag])){
				newTags.push(tag);
				obj[tag] = 1;
			}
		});
		p.tags = newTags;
	}else{
		p.tags = [];
	}
	return cb(null, p);
}