$('.remove-share-to-me').click(function(e){
	var shareId = $(this).attr('share-id');
	if(confirm('确定删除该记录吗？')){
		$.ajax({
			url : '/center/share/'+shareId,
			dataType : 'json',
			type : 'post',
			data : {shareType:'shareToMe'},
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
	}
});
$('.remove-my-share').click(function(e){
	var shareId = $(this).attr('share-id');
	if(confirm('确定删除该记录吗？')){
		$.ajax({
			url : '/center/share/'+shareId,
			dataType : 'json',
			type : 'post',
			data : {shareType:'myShare'},
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
	}
});