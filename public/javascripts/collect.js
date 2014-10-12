$('.remove-collect').click(function(e){
	var collectId = $(this).attr('collect-id');
	$.ajax({
		url : '/center/collect/'+collectId,
		dataType : 'json',
		type : 'post',
		beforeSend : function(xhr){
					return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
		},
		success : function(res){
			if(res.status == 'success'){
				alert('删除成功！');
				location.reload();
			}else{
				alert(res.message);
			}
		}
	});
});