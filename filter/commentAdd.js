
var validator = require('validator');

exports.run = function(userId, post, cb){
	var c = {};
	c.userId = validator.toInt(userId);
	c.authorId = validator.toInt(validator.trim(post.authorId));
	c.postId = validator.toInt(validator.trim(post.postId));
	c.title = validator.escape(validator.trim(post.title));
	c.content = validator.trim(post.content);
	c.commentTime = (new Date()).getTime();
	c.score = 0;
	c.parent = validator.toInt(validator.trim(post.parent));

	if(c.content == ''){
		return cb(new Error('评论内容不能为空！'));
	}else if(! c.parent){
		return cb(new Error('主题编号为空！'));
	}

	return cb(null, c);
}