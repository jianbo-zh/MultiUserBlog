var config = require('../config/common.json');
var resource = require('../config/resource.json');
var util = require('util');

/**
 * 获取配置文件的字段
 * @param  {string} key 配置文件的键
 * @return {mixed}     配置文件键对应的值
 */
exports.config = function(key){
	return config[key] ? config[key] : null;
}

/**
 * 通过绝对路径生成具体的URL
 * @param  {string} aPath 相对根目录的路径
 * @return {string}       生成的url
 */
exports.url = function(aPath){
	return config['domain'] + aPath;
}

/**
 * 自动生成编辑器具体脚本，需要其他引人js和css资源
 * @param  {string} name   表单元素的名字
 * @param  {string} option 编辑器配置选项
 * @return {string}        生成的编辑器脚本
 */
exports.editor = function(name, option){
	if(!name || (typeof name !== 'string')){
		throw new Error("编辑器必须提供关联的textarea的name");
	}
	var defaultOption = "{ \n \
		resizeType : 1, \n \
		allowPreviewEmoticons : false, \n \
		allowImageUpload : false, \n \
		afterBlur: function () { this.sync(); }, \n \
		items : ['fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline','removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright','insertorderedlist','insertunorderedlist', '|', 'emoticons', 'image', 'link'] \n \
	}";

	var optionStr = option || defaultOption;
	return "<script> \n \
		var editor; \n \
		KindEditor.ready(function(K) { \n \
			editor = K.create('textarea[name=\"" + name +"\"]', "+ optionStr +"); \n \
		}); \n \
	</script>";
}

/**
 * 生成JS字符串
 * @param  {string|array} jsArr 脚本资源名
 * @return {string}       脚本对应的标签字符串
 */
exports.js = function(jsArr){

	var  jss = [];

	if(typeof jsArr === 'string'){

		jsArr = [jsArr];

	}else if( ! util.isArray(jsArr)){

		return;
	}

	jsArr.forEach(function(val, index, arr){
		if(resource.js[val]){
			jss.push('<script src="' + resource.js[val] + '" type="text/javascript" /></script>');
		}
	});

	return jss.join("\n");
}

/**
 * 生成css
 * @param  {array|string} cssArr 样式的资源名，或数组
 * @return {string}        样式对应的标签
 */
exports.css = function(cssArr){
	var  csss = [];

	if(typeof cssArr === 'string'){

		cssArr = [cssArr];

	}else if( ! util.isArray(cssArr) ){
		return;
	}

	cssArr.forEach(function(val, index, arr){
		if(resource.css[val]){
			csss.push('<link rel="stylesheet" type="text/css" href="' + resource.css[val] + '" />');
		}
	});

	return csss.join("\n");
}

/**
 * 获取对应表的下一个id
 * @param  {resource}   db    数据库资源
 * @param  {strint}   table 表明
 * @param  {Function} cb    回调函数
 */
exports.getNextId = function(db, table, cb){
	db.collection('ids', function(err, collectionIds){
		if(err){
			return cb(err);		// 只报错，关闭数据库留到上层调用者实现
		}
		collectionIds.findAndModify({table:table}, [['table', 1]], {$inc:{id:1}}, {new:true}, function(err, item){
			if(err){
				return cb(err);	// 只报错，关闭数据库留到上层调用者实现
			}
			return cb(null, item.id);
		});
	});
}