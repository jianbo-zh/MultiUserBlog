$('#post-add').find('input#add-tag').keyup(function(e) {
	$(this).val($.trim($(this).val()));
	if (e.keyCode === 13 && $(this).val() !== '') {
		$(this).before(' <span>' + $(this).val() + '</span>')
			.after('<input type="hidden" name="tags" value="' + $(this).val() + '" />')
			.val('');
	}
}).blur(function() {
	var that = $(this);
	that.val($.trim(that.val()));
	if (that.val() !== '') {
		that.before(' <span>' + that.val() + '</span>')
			.after('<input type="hidden" name="tags" value="' + that.val() + '" />')
			.val('');
	}
});

$('#post-add').ajaxForm({
	dataType : 'json',
	success : function(res){
		if(res.status === 'success'){
			$('#post-add').resetForm();
			alert('新建文章成功！');
		}else{
			alert(res.message);
		}
	}
});

$('#post-add').find('[name=isOriginal]').click(function(){
	if($(this).val() == 1){
		$('#sourceUrl').attr('disabled', 'true');
	}else{
		$('#sourceUrl').removeAttr('disabled');
	}
});