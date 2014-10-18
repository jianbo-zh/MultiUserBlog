
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var async = require('async');

/**
 * 获取读数据库
 * @param {string} dbName 数据库名，可选
 * @param {Function} cb 回调函数，必须
 */
function getRead(){
	var dbName, cb;
	if(arguments.length == 0){
		throw new Error('获取读数据库，必须提供回调函数！');
	}else if(arguments.length ==1 ){
		dbName = 'blog';
		cb = arguments[0];
	}else{
		dbName = arguments[0];
		cb = arguments[1];
	}
	
	var db = new Db(dbName, new Server('127.0.0.1', 27017), {w:1});
	db.open(function(err, db){
		if(err){
			return cb(err);
		}
		return cb(null, db);
	});
}

/**
 * 获取写数据库
 * @param {string} dbName 数据库名，可选
 * @param {Function} cb 回调函数，必须
 */
var getWrite = function(){
	var dbName, cb;
	if(arguments.length == 0){
		throw new Error('获取写数据库，必须提供回调函数！');
	}else if(arguments.length ==1 ){
		dbName = 'blog';
		cb = arguments[0];
	}else{
		dbName = arguments[0];
		cb = arguments[1];
	}
	
	var db = new Db(dbName, new Server('127.0.0.1', 27017), {w:1});
	db.open(function(err, db){
		if(err){
			return cb(err);
		}
		return cb(null, db);
	});
}

/**
 * 初始化ids表，该表保存了所有表的当前最大id
 */
var init = function(){
	getWrite(function(err, db){
		if(err){
			db.close();
			throw err;
		}
		db.collection('ids', function(err, collectionIds){
			if(err){
				db.close();
				throw err;
			}
			async.parallel([
				function(callback){		// 用户表
					collectionIds.findOne({table:'user'}, function(err, item){
						if(err){ return callback(err); }
						if(!item){
							collectionIds.insert({table:'user', id:0}, function(err, result){
								if(err){ return callback(err); }
								return callback();
							});
						}else{ return callback(); }
					});
				},
				function(callback){		// 文章表
					collectionIds.findOne({table:'post'}, function(err, item){
						if(err){ return callback(err); }
						if(!item){
							collectionIds.insert({table:'post', id:0}, function(err, result){
								if(err){ return callback(err); }
								return callback();
							});
						}else{ return callback(); }
					});
				},
				function(callback){		// 标签表
					collectionIds.findOne({table:'tag'}, function(err, item){
						if(err){ return callback(err); }
						if(!item){
							collectionIds.insert({table:'tag', id:0}, function(err, result){
								if(err){ return callback(err); }
								return callback();
							});
						}else{ return callback(); }
					});
				},
				function(callback){		// 文章标签表
					collectionIds.findOne({table:'post_rel_tag'}, function(err, item){
						if(err){ return callback(err); }
						if(!item){
							collectionIds.insert({table:'post_rel_tag', id:0}, function(err, result){
								if(err){ return callback(err); }
								return callback();
							});
						}else{ return callback(); }
					});
				},
				function(callback){		// 文章标签表
					collectionIds.findOne({table:'category'}, function(err, item){
						if(err){ return callback(err); }
						if(!item){
							collectionIds.insert({table:'category', id:0}, function(err, result){
								if(err){ return callback(err); }
								return callback();
							});
						}else{ return callback(); }
					});
				}
			], function(err, result){
				if(err){
					db.close();
					throw err;
				}
			});
		});
	});
}

init();		// 初始化ids表

exports.getRead = getRead;
exports.getWrite = getWrite;