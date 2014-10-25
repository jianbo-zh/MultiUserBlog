$('.remove-like-to-me').click(function(e){
	var likeId = $(this).attr('like-id');
	$.ajax({
		url : '/center/like',
		dataType : 'json',
		type : 'post',
		data : {likeId:likeId, type:'likeToMe'},
		beforeSend : function(xhr){
					return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
		},
		success : function(res){
			if(res.status == 'success'){
				alert('删除记录成功！');
				location.reload();
			}else{
				alert(res.message);
			}
		}
	});
});
$('.remove-my-like').click(function(e){
	var likeId = $(this).attr('like-id');
	$.ajax({
		url : '/center/like',
		dataType : 'json',
		type : 'post',
		data : {likeId:likeId, type:'myLike'},
		beforeSend : function(xhr){
					return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
		},
		success : function(res){
			if(res.status == 'success'){
				alert('删除记录成功！');
				location.reload();
			}else{
				alert(res.message);
			}
		}
	});
});