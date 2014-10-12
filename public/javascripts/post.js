
$('#postCollect').click(function(){
	var postId = $(this).attr('post-id'),
		postTitle = $(this).attr('post-title');
	$('.post-collect').html('\
		<form action="/collect" method="post"> \
			<input type="hidden" name="postId" value="'+postId+'" /> \
			<div class="post-title">收藏文章</div> \
			<div class="post-body"> \
				收藏名：<input type="text" name="collectName" value="'+postTitle+'" /> \
			</div> \
			<div class="post-footer"> \
				<input type="submit" value="确定"> \
				<input type="reset" value="取消"> \
			</div> \
		</form>').show();
});


$('#postLike').click(function(){
	var postId = $(this).attr('post-id'),
		postTitle = $(this).attr('post-title'),
		postUserId = $(this).attr('post-user-id');
		that = $(this);
	$.ajax({
		url : '/like',
		type : 'post',
		data : {postId:postId, postTitle:postTitle, postUserId:},
		dataType : 'json',
		success : function(res){
			if(res.status == 'success'){
				alert('操作成功！');
				var collectSpan = that.prev('span.collect');
				collectSpan.text(collectSpan.text()+1)
			}else{
				alert(res.message);
			}
		}
	});
});

$('#postShare').click(function(){
	var postId = $(this).attr('post-id'),
		postTitle = $(this).attr('post-title');
	$('.post-share').html('\
		<form action="/share" method="post"> \
			<input type="hidden" name="postId" value="'+postId+'" /> \
			<div class="post-title">分享文章</div> \
			<div class="post-body"> \
				分享给：<input type="text" name="userName" value="" /><br /> \
				备注说明：<textarea name="shareName" cols="30" rows="10"></textarea> \
			</div> \
			<div class="post-footer"> \
				<input type="submit" value="确定"> \
				<input type="reset" value="取消"> \
			</div> \
		</form>').show();
});


$('#post-collect-form').delegate('form', 'submit', function(e){
	var postId = $(this).children('input[name=postId]').val(),
		collectName = $(this).find('input[name=collectName]').val();
	$.ajax({
		url : '/collect',
		type : 'post',
		data : {postId:postId, collectName:collectName},
		dataType : 'json',
		success : function(res){
			if(res.status == 'success'){
				alert('收藏成功！');
			}else{
				alert(res.message);
			}
			$('#post-collect-form').hide();
		}
	});
	return false;
});

$('#post-share-form').delegate('form', 'submit', function(e){
	var postId = $(this).children('input[name=postId]').val(),
		userName = $(this).find('input[name=userName]').val(),
		shareName = $(this).find('textarea[name=shareName]').val();
	$.ajax({
		url : '/share',
		type : 'post',
		data : {postId:postId, userName:userName, shareName: shareName},
		dataType : 'json',
		success : function(res){
			if(res.status == 'success'){
				alert('分享成功！');
			}else{
				alert(res.message);
			}
			$('#post-share-form').hide();
		}
	});
	return false;
});

$('#comment-form').ajaxForm({
	type : 'post',
	dataType : 'json',
	success : function(res){
		if(res.status === 'success'){
			alert('评论提交成功！');
			location.reload();
		}else{
			alert(res.message);
		}
	}
});
$('.open-subComment-form').click(function(e){
	var postId = $(this).attr('post-id'),
		commentId = $(this).attr('comment-id');
	$(this).parents().siblings('.comment-replay').html(' \
	<form action="/comment/follow" id="comment-replay-form"> \
		<input type="hidden" name="commentId" value="'+commentId+'" /> \
		<textarea name="comment" cols="30" rows="10"></textarea> \
		<input type="submit" value="确定"> \
	</form> \
	');
});

$('.comment-replay').delegate('form', 'submit', function(e){
	var parent = $(this).children('input[name=commentId]').val(),
		comment = $(this).children('textarea[name=comment]').val();
	$.ajax({
		url : '/comment/content',
		type : 'post',
		data : {commentId:commentId, comment: comment},
		dataType : 'json',
		success : function(res){
			if(res.status == 'success'){
				alert('评论成功！');
				location.reload();
			}else{
				alert(res.message);
			}
		}
	});
	return false;
});

$('.agree-comment').click(function(e){
	var commentId = $(this).attr('comment-id');
	$.ajax({
		url : '/comment/agree',
		type : 'post',
		data : {commentId: commentId},
		dataType : 'json',
		success : function(res){
			if(res.status == 'success'){
				alert('同意成功！');
				location.reload();
			}else{
				alert(res.message);
			}
		}
	});
});