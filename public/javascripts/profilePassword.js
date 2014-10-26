$('#profile-password').ajaxForm({
	dataType : 'json',
	success : function(res){
		if(res.status == 'success'){
			alert('修改成功!');
			$('#profile-password').resetForm();
		}else{
			alert(res.message);
		}
	}
});