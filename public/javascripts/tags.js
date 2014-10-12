$("#tag-add").ajaxForm({
	dataType : 'json',
	success : function(res){
		if(res.status === 'success'){
			location.reload();
		}else{
			alert(res.message);
		}
	}
});

$("#tag-list").find('.edit').click(function(){
	var cEdit = $(this),
		tid = cEdit.attr('tid');

	if(cEdit.attr('editing')){
		return;
	}
	cEdit.attr('editing', true);
	var categoryItem = cEdit.parentsUntil('#tag-list', 'li');

	var catA = categoryItem.children('a');
	catA.replaceWith('<input type="text" oldValue="'+catA.text()+'" value="'+catA.text()+'" />');
	
	var catInput = categoryItem.children('input');
	catInput.select().blur(function(){
		var that = $(this);
		if(that.attr('oldValue') === trim(that.val())){
			return;
		}
		$.ajax({
			type : 'post',
			dataType : 'json',
			data : {tagName:that.val()},
			url : '/center/tag/' + tid,
			success : function(res){
				if(res.status === 'success'){
					that.replaceWith('<a href="/center/tag/' + tid + '">'+that.val()+'</a>');
					cEdit.removeAttr('editing');
				}else{
					that.replaceWith('<a href="/center/tag/' + tid + '">'+that.attr('oldValue')+'</a>');
					cEdit.removeAttr('editing');
				}
			}
		});
	});
});

$("#tag-list").find('.delete').click(function(){
	if(confirm('确认删除该标签吗？')){
		var tid = $(this).attr('tid'),
			that = $(this);
		$.ajax({
			url : '/center/tag/' + tid,
			type : 'post',
			dataType : 'json',
			beforeSend : function(xhr){
				return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
			},
			success : function(res){
				if(res.status === 'success'){
					that.parentsUntil('#tag-list').remove();
				}else{
					alert(res.message);
				}
			}
		});
	}
});