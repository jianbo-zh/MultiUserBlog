$('#send-message-form').ajaxForm({
	type : 'post',
	dataType : 'json',
	success : function(res){
		if(res.status === 'success'){
			alert('信息发送成功！');
			history.back();
		}else{
			alert(res.message);
		}
	}
});