$('#profile-basic').ajaxForm({
	dataType : 'json',
	success : function(res){
		if(res.status == 'success'){
			alert('修改成功!');
			location.reload();
		}else{
			alert(res.message);
		}
	}
});