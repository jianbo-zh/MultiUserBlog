var fs = require('fs');
var os = require('os');
var util = require('util');
var logdir = require('../config.js').logdir;
var info = fs.createWriteStream(logdir + '/info.log', {flags: 'a', mode: '0666'});
var error = fs.createWriteStream(logdir + '/error.log', {flags: 'a', mode: '0666'});

var logger = new console.Console(info, error);

Date.prototype.format = function(format) {
    /*
     * eg:format="YYYY-MM-DD hh:mm:ss";
     */
    var o = {
        "M+" :this.getMonth() + 1, // month
        "D+" :this.getDate(), // day
		"H+" :this.getHours(), // hour
        "m+" :this.getMinutes(), // minute
        "s+" :this.getSeconds(), // second
        "q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
        "S" :this.getMilliseconds()
    // millisecond
    }
 
    if (/(Y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
    }
 
    for ( var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

var logFormat = function(msg){
	var  ret = '';
	if(!msg){
		return ret;
	}
	var time = new Date().format('YYYY-MM-DD HH:mm:ss.S');
	if(msg instanceof Error){
		var err = {
			name : msg.name,
			data : msg.data
		};
		err.stack = msg.stack;
		ret = util.format('%s %s: %s \nHost: %s\nData: %j\n%s\n\n', 
			time,
			err.name,
			err.stack,
			os.hostname(),
			err.data,
			time);
	}else{
		ret = time + ' ' + util.format.apply(util, arguments) + '\n'; 
	}
	return ret;
};



module.exports.log = function(msg){
	logger.log(logFormat(msg));
}

module.exports.error = function(msg){
	logger.error(logFormat(msg));
}