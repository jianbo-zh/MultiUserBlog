$('#post-modify').find('input#add-tag').keyup(function(e) {
	$(this).val(trim($(this).val()));
	if (e.keyCode === 13 && $(this).val() !== '') {
		$(this).before(' <span>' + $(this).val() + '</span>')
			.after('<input type="hidden" name="tags[]" value="' + $(this).val() + '" />')
			.val('');
	}
}).blur(function() {
	var that = $(this);
	that.val(trim(that.val()));
	if (that !== '') {
		$(this).before(' <span>' + $(this).val() + '</span>')
			.after('<input type="hidden" name="tags[]" value="' + $(this).val() + '" />')
			.val('');
	}
});

$('#post-modify').ajaxForm({
	dataType : 'json',
	success : function(res){
		if(res.status === 'success'){
			alert('修改文章成功！');
			$('#post-add').resetForm();
		}else{
			alert(res.message);
		}
	}
});