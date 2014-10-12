$('.cancel-following').click(function(e){
	var followId = $(this).attr('follow-id');
	$.ajax({
		url : '/center/follow',
		dataType : 'json',
		type : 'post',
		data : 'followId='+followId,
		beforeSend : function(xhr){
					return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
		},
		success : function(res){
			if(res.status == 'success'){
				alert('取消关注成功！');
				location.reload();
			}else{
				alert(res.message);
			}
		}
	});
});

// center 关注
$('.to-following').click(function(e){
	var userId = $(this).attr('user-id');
	$.ajax({
		url : '/center/follow',
		data : 'userId='+userId,
		dataType : 'json',
		type : 'post',
		success : function(res){
			if(res.status == 'success'){
				alert('关注成功！');
			}else if(res.data == 'toLogin'){
				alert(res.message);
				location.href = '/login';
			}else{
				alert(res.message);
			}
		}
	});
});

// homepage 关注
$('#to-following').click(function(e){
	var userId = $(this).attr('user-id');
	$.ajax({
		url : '/center/follow',
		data : 'userId='+userId,
		dataType : 'json',
		type : 'post',
		success : function(res){
			if(res.status == 'success'){
				alert('关注成功！');
			}else if(res.data == 'toLogin'){
				alert(res.message);
				location.href = '/login';
			}else{
				alert(res.message);
			}
		}
	});
});
