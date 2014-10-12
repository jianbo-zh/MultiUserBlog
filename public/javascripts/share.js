$('.remove-share-to-me').click(function(e){
	var shareId = $(this).attr('share-id');
	$.ajax({
		url : '/center/share',
		dataType : 'json',
		type : 'post',
		data : {shareId:shareId, shareType:'shareToMe'},
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
$('.remove-my-share').click(function(e){
	var shareId = $(this).attr('share-id');
	$.ajax({
		url : '/center/share',
		dataType : 'json',
		type : 'post',
		data : {shareId:shareId, shareType:'myShare'},
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