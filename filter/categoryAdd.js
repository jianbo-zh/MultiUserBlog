
var validator = require('validator');
var categoryModel = require('../model/category.js');

exports.run = function(userId, post, cb){
	var category = {};
	category.name = validator.escape(validator.trim(post.name));
	category.parent = validator.toInt(validator.trim(post.parent));
	category.sort = validator.toInt(validator.trim(post.sort));

	if(category.name == ''){
		return cb(new Error('分类名称不能为空！'));
	}

	// 检查分类是否已经存在
	categoryModel.checkUserCategoryIfExists(userId, category.name, function(err, isExists){
		if(err){
			return cb(err);
		}
		return isExists ? cb(new Error('该分类已经存在了')) : cb(null, category);
	});
}