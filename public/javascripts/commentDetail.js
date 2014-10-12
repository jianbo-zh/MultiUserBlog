$('#comment-reply').ajaxForm({
	success : function(res){
		if(res.status == 'success'){
			alert('回复成功！');
		}else{
			alert(res.message);
		}
	}
});