
var validator = require('validator');
var TagModel = require('../model/tag.js');

exports.run = function(userId, post, cb){
	var tag = {};
	tag.userId = validator.toInt(userId);
	tag.name = validator.escape(validator.trim(post.name));
	tag.id = validator.toInt(validator.trim(post.id));

	if(tag.name == ''){
		return cb(new Error('标签名称不能为空！'));
	}
	if(! tag.id){
		return cb(new Error('标签编号错误！'));
	}

	// 检查标签是否已经存在
	TagModel.checkUserTagIfExists(userId, tag.name, function(err, isExists){
		if(err){
			return cb(err);
		}
		return isExists ? cb(new Error('该标签名已经存在了')) : cb(null, tag);
	});
}