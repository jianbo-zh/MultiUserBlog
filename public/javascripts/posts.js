$('select.post-action').change(function(){
	var that = $(this),
		val = $(this).val(),
		postId = $(this).attr('postId');

	if(val === '1'){
		location.assign('/center/post/'+postId);

	}else if(val === '2'){
		if(confirm('确定要删除：'+'文章')){
			$.ajax({
				url : '/center/post/' + postId,
				type : 'post',
				dataType : 'json',
				beforeSend : function(xhr){
					return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
				},
				success : function(res){
					if(res.status === 'success'){
						that.parentsUntil('#post-list').remove();
					}else{
						alert(res.message);
					}
				}
			});
		}
	}
});