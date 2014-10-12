
$("#login-form").ajaxForm({
	dataType : 'json',
	success : function(resJson){
		if(resJson.status === 'success'){
			location.href = resJson.url;
		}else{
			alert(resJson.message);
		}
	}
});