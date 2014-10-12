var db = require('../lib/db.js');
var commonFn = require('../lib/common.js');
var crypto = require('crypto');

/**
 * 用户的构造函数
 * @param {objec} user 初始化参数
 */
var User = function(user){
	this.nickname = user.nickname;
	this.email = user.email;
	this.weibo = user.weibo;
	this.qq = user.qq
	this.password = User.encrypt(user.password);
}

/**
 * 用户密码的加密方法
 * @param  {string} plain 明文密码
 * @return {string}       密文密码
 */
User.encrypt = function(plain){
	var md5 = crypto.createHash('md5');
	md5.update(plain);
	return md5.digest('hex');
}

/**
 * 新增用户对象方法
 * @param {Function} cb [description]
 */
User.prototype.add = function(cb){
	var user = {};
	user.nickname = this.nickname;
	user.email = this.email;
	user.weibo = this.weibo;
	user.qq = this.qq;
	user.password = this.password;

	db.getRead(function(err, db){
		if(err){
			db.close();
			return cb(err);
		}
		commonFn.getNextId(db, 'user', function(err, userId){
			if(err){
				db.close();
				return cb(err);
			}
			db.collection('user', function(err, collectionUser){
				collectionUser.insert(user, function(err, result){
					db.close();
					if(err){
						return cb(err);
					}
					return cb(null, result);
				});
			});
		});
	});
}

/**
 * 通过用户邮箱获取用户
 * @param  {string}   email 邮箱
 * @param  {Function} cb    回调函数
 */
User.getByEmail = function(email, cb){
	db.getRead(function(err, db){
		if(err){
			db.close();
			return cb(err);
		}
		db.collection('user', function(err, collectionUser){
			if(err){
				db.close();
				return cb(err);
			}

			var user = {email:email};
			collectionUser.findOne(user, function(err, item){
				db.close();
				if(err){
					return cb(err);
				}
				return cb(null, item);
			});
		});
	});
}

module.exports = User;