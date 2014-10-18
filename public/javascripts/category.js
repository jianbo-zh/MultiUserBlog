$("#category-add").ajaxForm({
	dataType : 'json',
	success : function(res){
		if(res.status === 'success'){
			location.reload();
		}else{
			alert(res.message);
		}
	}
});
$("#category-list").find('.edit').click(function(){
	var cEdit = $(this),
		cid = cEdit.attr('cid');

	if(cEdit.attr('editing')){
		return;
	}
	cEdit.attr('editing', true);
	var categoryItem = cEdit.parentsUntil('#category-list', 'li');

	var catA = categoryItem.children('a');
	catA.replaceWith('<input type="text" oldValue="'+catA.text()+'" value="'+catA.text()+'" />');
	
	var catInput = categoryItem.children('input');
	catInput.select().blur(function(){
		var that = $(this);
		if(that.attr('oldValue') === $.trim(that.val())){
			return;
		}
		$.ajax({
			type : 'post',
			dataType : 'json',
			data : {name:that.val()},
			url : '/center/category/' + cid,
			success : function(res){
				if(res.status === 'success'){
					that.replaceWith('<a href="/center/category/' + cid + '">'+that.val()+'</a>');
					cEdit.removeAttr('editing');
				}else{
					that.replaceWith('<a href="/center/category/' + cid + '">'+that.attr('oldValue')+'</a>');
					cEdit.removeAttr('editing');
				}
			}
		});
	});
});

$("#category-list").find('.delete').click(function(){
	if(confirm('确定要删除该分类吗？')){
		var cid = $(this).attr('cid'),
			that = $(this);
		$.ajax({
			url : '/center/category/' + cid,
			type : 'post',
			dataType : 'json',
			beforeSend : function(xhr){
				return xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
			},
			success : function(res){
				if(res.status === 'success'){
					that.parentsUntil('#category-list').remove();
				}else{
					alert(res.message);
				}
			}
		});
	}
});