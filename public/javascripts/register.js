
$("#register-form").ajaxForm({
	dataType : 'json',
	success : function(resJson){
		if(resJson.status === 'success'){
			location.href = '/login';
		}else{
			alert(resJson.message);
		}
	}
});