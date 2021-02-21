$(function(){
	var xhr = null;

	// Отправка формы комментария
	$(document).on("submit", "#treecomments_widget form, #temp-reply-popup form", function (e) {
		e.preventDefault();
		
		var that = $(this);
		var submitBtn = that.find('input[type=submit]');
		var formWaiting = that.find('.form_waiting');
		var formType = that.find('input[name=type]').val();
		var parentId = that.find('input[name=UF_PARENT_ID]').val();
		var contenteditableArea = that.find('.textarea__textarea');
		that.find('input[name=UF_TEXT]').val( contenteditableArea.html() );
		contenteditableArea.html('');
		submitBtn.prop('disabled', true);
		formWaiting.show();

		// очистим вывод ошибок
		$('.reply-msg-wrap .error_text').html('');

		// если при редактировании удаляются текст и все файлы,
		// удаляем пустой комментарий.
		if (formType == 'change')
		{
			if (that.find('input[name=UF_TEXT]').val().length == 0 && that.find('.tc_files .tc_file').length == 0)
				that.find('input[name=type]').val('delete');
		}

		var formData = new FormData(this);

		if(xhr && xhr.readyState != 4)
		{
			xhr.abort();
		}

		xhr = $.post({
			url         : $(this).attr("action"),
			type        : "POST",
			data        : formData,
			processData : false,
			contentType : false,
			success: function(data, status, xhr)
			{
				var ct = xhr.getResponseHeader("content-type") || "";
				if (ct.indexOf('html') > -1)
				{ // если ответ html
				  if (formType == 'add')
				  {

					// Если форма основная - добавляем новый коммент в верх списка.
					if (that.hasClass('main'))
					{
					  that.find("textarea").val('');
					  $(".treecomments.tree").prepend(data);
					  that.find('.tc_files').html('').attr('active', 'false');
					}
					else // Если это ответ на коммент, добавляем в начало ветки родителя
					{
									var parent_block = $('#tc_comment_message_'+parentId);

									// Если уровень вложенности родителя больше максимального, то добавляем коммент ещё родителю уровнем на 1 меньше
									/*if (parent_block.data('level') >= $("#treecomments_widget").data('maxlevel'))
									{
										parent_block = parent_block.parents('.tc_comment_block:eq(1)').children('.tc_comment_message:first');
									}*/

									parent_block.after(data);

									// после отправки ответа удаляем из DOM форму
									// that.closest("div.reply_form_block").html('');
									$('#temp-reply-popup').remove();

									// Если был добавлен ответ на какой-то коммент и этот коммент был удалён не физически, а заменён на стандартный текст, то скрываем ссылку на удаление
									if (parent_block.find('.tc_comment_message_text:first').text() == "Сообщение было удалено.")
									{
										// Запрещаем его удалить физически
										parent_block.find('.tc_button.delete:first').addClass('hide');
									}
					}

					var comments_count = $(data).find(".commments_count_ajax").text();

					if (!!comments_count)
									$(".tc_comments_count").text(comments_count);
				  }
				  else if (formType == 'change')
				  {
					// that.closest('.tc_comment_message').html( $(data).find('.tc_comment_message').html() );
								var _data = $(data);
					var commentId = _data.find('.tc_comment_message').prop('id');
					$('#'+commentId).html( _data.find('.tc_comment_message').html() );

					$('#temp-reply-popup').remove();

				  }
				else if (formType == 'ban')
				{
					$('#temp-reply-popup').remove();
				}

				  //$("#treecomments_widget").html( $(data).filter("#treecomments_widget").html() );

				} else if (ct.indexOf('json') > -1) { // если ответ json
				  if (typeof data.TYPE !== 'undefined'
									&& data.TYPE === 'ERROR') {
					showError(data.MESSAGE);
							} else if (typeof data.TYPE !== 'undefined'
					&& data.TYPE === 'OK') {
					showError(data.MESSAGE);
							}
							if ($('#temp-reply-popup').length > 0) {
					$('#temp-reply-popup').remove();
							}
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown)
			{
				showError("Возникла ошибка. Попробуйте снова.");
			},
			complete: function(jqXHR, textStatus)
			{
				formWaiting.hide();
				submitBtn.prop('disabled', false);
			}
		});


	});
	
	// клик по кнопке Ответить
	$(document).on("click", ".tc_button.reply", function(e) {

		var parentId = $(this).data("parentid");
		//$("form.reply_form:first").find(".smile-list--holder").mCustomScrollbar('destroy');
		// var formHtml = $("form.reply_form")[0].outerHTML;
		// var reply_form_block = $(this).closest(".tc_comment_message_footer").find(".reply_form_block").html('');

		// удаление форм под другими комментариями
		/*$("div.reply_form_block").each(function (e){
			$(this).html('');
		});*/
		
		// $(formHtml).find("textarea").val('');
		
		// reply_form_block.append(formHtml);
		// reply_form_block.find('form.reply_form').removeClass('main').prepend("<input type='hidden' name='UF_PARENT_ID' value='" + parentId + "'>").find("textarea[name=UF_TEXT]").css('height', '');
		// reply_form_block.find(".tc_files").html('').attr('active', 'false');



    var popupHtml = $('.popup.popup-reply-wrap')[0].outerHTML;
    var popup = $(popupHtml);
    var form = popup.find("form.reply_form");

		var commentContainerHtml = $(this).closest('.tc_comment_block').html();
		var commentContainer = $(commentContainerHtml);
		commentContainer.find('.tc_comment_block').remove();
    commentContainer.find('.tc_comment_message_footer').remove();
    popup.find('.tc_comment_block').html(commentContainer.html());
    form.removeClass('main').prepend("<input type='hidden' name='UF_PARENT_ID' value='" + parentId + "'>");
    popup.prop('id', 'temp-reply-popup');
		$('body').append(popup);

    $('#temp-reply-popup').show();
	});
	
	// клик по кнопке Редактировать
	$(document).on("click", ".tc_button.change", function(e) {
		
		var commentId = $(this).data("id");
		var popupHtml = $('.popup.popup-reply-wrap')[0].outerHTML;
		var popup = $(popupHtml);
		var form = popup.find("form.reply_form");
		form.removeClass('main');
		var contenteditableArea = popup.find('.textarea__textarea');

		var commentContainerHtml = $(this).closest('.tc_comment_block').html();
		var commentContainer = $(commentContainerHtml);
		commentContainer.find('.tc_comment_block').remove();
		commentContainer.find('.tc_comment_message_footer').remove();
		popup.find('.tc_comment_block').html(commentContainer.html());
		form.removeClass('main').prepend("<input type='hidden' name='ID' value='" + commentId + "'>");
		popup.find("input[name=type]").val("change");
		// берём текущий текст комментария и меняем картинки в тексте на emoji (берём их из alt картинок)
		// var commentText = $(this).closest(".comment-msg-wrap").find('.tc_comment_message_text').html().replace(/\<img.*?alt="(.*?)"\>/g, '$1').replace(/\<br\>/g, '').replace(/&nbsp;/g, " ");
		var commentText = $(this).closest(".comment-msg-wrap").find('.tc_comment_message_text').html();
		contenteditableArea.html(commentText);
		if (commentText.length > 0) {
			hidePlaceholer(contenteditableArea);
		}
		popup.prop('id', 'temp-reply-popup');
		$('body').append(popup);

		$('#temp-reply-popup').show();
		
		// Редактирование прикреплённых фоток
		var tc_files = popup.find(".tc_files").html('');
		$(this).closest('.comment-msg-wrap').find('.tc_comments_message_att .tc_message_attimg img').each(function(e){
			var fileId = $(this).data('fileid');
			var previewSrc = $(this).attr('src');
			tc_files.append('<div class="tc tc_file"><div class="tc tc_file_close" rel="DelFile"><svg width="12" height="12" viewBox="0 0 612 670.2"><path fill="#424242" d="M345.2,335.1L603.4,44.7c9.9-9.9,9.9-27.3,0-37.2s-24.8-9.9-37.2,0L305.5,300.4L44.8,7.4C34.9-2.5,20-2.5,7.6,7.4c-9.9,9.9-9.9,27.3,0,37.2l258.2,290.5L7.6,625.6c-9.9,9.9-9.9,27.3,0,37.2s24.8,9.9,37.2,0l260.7-292.9l260.7,292.9c9.9,9.9,24.8,9.9,37.2,0c9.9-9.9,9.9-27.3,0-37.2L345.2,335.1z"></path></svg></div><img class="tc tc_file_img" src="' + previewSrc + '" active="true"><input type="hidden" name="old_files[]" value="' + fileId + '"></div>');
		});
		
		tc_files.attr('active', 'true');
	});
	
	// клик по кнопке Удалить
	$(document).on("click", ".tc_button.delete", function(e) {
		e.preventDefault();
		
		var commentId = $(this).data("id");
		var formBlock = $("form.reply_form")[0];
		var thread = $("input[name=UF_THREAD]").val();
		var marathonId = $("input[name=MARATHON_ID]").val() || '';
		var exerciseId = $("input[name=EXERCISE_ID]").val() || '';
		var that = $(this);
		
		var data = {type: 'delete', ID: commentId, UF_THREAD: thread, MARATHON_ID: marathonId, EXERCISE_ID: exerciseId};
		
		$.post(
			$(formBlock).attr("action"),
			data,
			function(data, status, xhr)
			{
				var ct = xhr.getResponseHeader("content-type") || "";
				if (ct.indexOf('html') > -1) { // если ответ html
					var parent_block = that.parents('.tc_comment_block').eq(1);
					var fadeOut = $(data).find('.tc_comment_message').hasClass('fadeout');
					var tc_comment_message = that.closest('.tc_comment_message');
					tc_comment_message.html( $(data).find('.tc_comment_message').html() );
					tc_comment_message.closest('.tc_comment_block').addClass('deleted');

					if (fadeOut)
						setTimeout(function() {tc_comment_message.closest('.tc_comment_block').fadeOut( "slow" );}, 1000);

					// Если был удалён ответ на какой-то коммент, то нужно проверить, есть ли у этого коммента ещё ответы
					if (!!parent_block)
					{
						// Если этот коммент был удален не физически из таблицы (из-за наличия ответов на этот коммент)
						if (parent_block.find('.tc_comment_message_text:first').text() == "Сообщение было удалено." &&
							parent_block.find('.tc_comment_block').filter(function() {return !$(this).hasClass('deleted');}).length == 0) // И на него не осталось больше ответов
						{
							// Разрешаем его удалить физически
							parent_block.find('.tc_button.delete:first').removeClass('hide');
						}
					}

					var comments_count = $(data).find(".commments_count_ajax").text();

					if (!!comments_count)
						$(".tc_comments_count").text(comments_count);

				} else if (ct.indexOf('json') > -1) { // если ответ json
					if (typeof data.TYPE !== 'undefined'
						&& data.MESSAGE.length > 0) {
						showError(data.MESSAGE);
					}
				}
			}
		);
	});
	
	// клик по кнопке Забанить
	$(document).on("click", ".tc_button.ban", function(e) {
		
		e.preventDefault();

    var userId = $(this).data("userid");

    var popupHtml = $('.popup.popup-reply-wrap')[0].outerHTML;
    var popup = $(popupHtml);
    var form = $("form.reply_form");

    var commentContainerHtml = $(this).closest('.tc_comment_block').html();
    var commentContainer = $(commentContainerHtml);
    commentContainer.find('.tc_comment_block').remove();
    commentContainer.find('.tc_comment_message_footer').remove();
    popup.find('.tc_comment_block').html(commentContainer.html());
    popup.find('form.reply_form').removeClass('main').prepend("<input type='hidden' name='ID' value='" + userId + "'>");
    popup.find('textarea').prop('placeholder', window.commentsMess.BAN_PLACEHOLDER);
    popup.find("input[name=type]").val("ban");
    var banForeverBtnText = 'Забанить навсегда';
    var banForThreeDaysBtnText = 'Забанить на 3 дня';
    
	if (typeof window.commentsMess.BAN_FOREVER !== 'undefined')
		banForeverBtnText = window.commentsMess.BAN_FOREVER
	
	if (typeof window.commentsMess.BAN_FOR_THREE_DAYS !== 'undefined')
		banForThreeDaysBtnText = window.commentsMess.BAN_FOR_THREE_DAYS
	
		
	popup.find(".submit_buttons").append(popup.find(".reply-btn").clone().val(banForThreeDaysBtnText).addClass('for_three_days'));
    popup.find(".reply-btn:first").val(banForeverBtnText).addClass('forever');
    //popup.find(".reply-bottom").css('display', 'none'); // скрытие кнопок "прикрепить файлы" и "эмодзи"
    popup.prop('id', 'temp-reply-popup');
    $('body').append(popup);

    $('#temp-reply-popup').show();

		/*
		var userId = $(this).data("userid"); // +
		var formBlock = $("form.reply_form")[0];
		var thread = $("input[name=UF_THREAD]").val();
		var marathonId = $("input[name=MARATHON_ID]").val() || '';
		var exerciseId = $("input[name=EXERCISE_ID]").val() || '';
		var that = $(this);
		
		var data = {type: 'ban', ID: userId, UF_THREAD: thread, MARATHON_ID: marathonId, EXERCISE_ID: exerciseId};
		
		$.post(
			$(formBlock).attr("action"),
			data,
			function(data)
			{
				var tc_buttons_info = that.closest('.tc_comment_message_footer').find('.tc_buttons_info');
				tc_buttons_info.html( $(data).html() );
			},
			'html'
		);
		*/
	});
	
	// клик по кнопке Закрепить
	$(document).on("click", ".tc_button.pin", function(e) {
		e.preventDefault();
		
		var commentId = $(this).data("id");
		var formBlock = $("form.reply_form")[0];
		var thread = $("input[name=UF_THREAD]").val();
		var marathonId = $("input[name=MARATHON_ID]").val() || '';
		var exerciseId = $("input[name=EXERCISE_ID]").val() || '';
		var that = $(this);
		
		var data = {type: 'pin', ID: commentId, UF_THREAD: thread, MARATHON_ID: marathonId, EXERCISE_ID: exerciseId};
		
		$.post(
			$(formBlock).attr("action"),
			data,
			function(data, status, xhr)
			{
				var ct = xhr.getResponseHeader("content-type") || "";
				if (ct.indexOf('html') > -1) // если ответ html
				{
					var pinned = $('div.pinned');
					
					pinned.html($(data).find('.pinned').html());
					pinned.removeClass('hide');
					
					checkPinnedCommentToFix();
				}
				else if (ct.indexOf('json') > -1) // если ответ json
				{
					if (typeof data.TYPE !== 'undefined' && data.MESSAGE.length > 0)
					{
						showError(data.MESSAGE);
					}
				}
			}
		);
	});
	
	// клик по крестику Открепить
	$(document).on("click", ".close.pinned-hide", function(e) {
		e.preventDefault();
		
		var formBlock = $("form.reply_form")[0];
		var thread = $("input[name=UF_THREAD]").val();
		var marathonId = $("input[name=MARATHON_ID]").val() || '';
		var exerciseId = $("input[name=EXERCISE_ID]").val() || '';
		var that = $(this);
		
		var data = {type: 'unpin', UF_THREAD: thread, MARATHON_ID: marathonId, EXERCISE_ID: exerciseId};
		
		$.post(
			$(formBlock).attr("action"),
			data,
			function(data, status, xhr)
			{
				var ct = xhr.getResponseHeader("content-type") || "";
				if (ct.indexOf('json') > -1) // если ответ json
				{
					if (typeof data.TYPE !== 'undefined')
					{
						if (data.TYPE == 'OK')
						{
							$('div.pinned').addClass('hide');
						}
					}
				}
			}
		);
	});
	
	// клик по закреплённому комменту (открываем попап с полным комментарием)
	$(document).on("click", "div.pinned", function(e) {
		
		var popupHtml = $('.popup.pinned-popup')[0].outerHTML;
		var popup = $(popupHtml);

		popup.prop('id', 'temp-reply-popup').removeClass('hide');
		$('body').append(popup);

		$('#temp-reply-popup').show();
	});
	
	// Закрытие попапа закреплённого коммента
	$(document).on("click", ".popup.pinned-popup .close", function(e) {
		$(this).closest('.popup.popup-reply-wrap').remove();
		$('#temp-reply-popup').remove();
	});
	
	// клик по кнопке Загрузить ещё
	$(document).on("click", ".tc_get_more, .tc_get_all", function(e) {
		
		e.preventDefault();
		
		var lastCommentId = $(this).data("lastid");
		var formBlock = $("form.reply_form")[0];
		var thread = $("input[name=UF_THREAD]").val();
		var marathonId = $("input[name=MARATHON_ID]").val() || '';
		var exerciseId = $("input[name=EXERCISE_ID]").val() || '';
		
		if ($(this).hasClass('tc_get_more'))
			var COMMENTS_ON_PAGE = $("input[name=COMMENTS_ON_PAGE]").val();
		else
			var COMMENTS_ON_PAGE = '99999999'; // если кликнули по tc_get_all, значит нужно загрузить все комментарии
		
		var data = {
			type: 'more',
			LAST_COMMENT_ID: lastCommentId,
			COMMENTS_ON_PAGE: COMMENTS_ON_PAGE,
			UF_THREAD: thread,
			MARATHON_ID: marathonId,
			EXERCISE_ID: exerciseId,
			load_comment_tree : 'Y'
		};
		
		$.post(
			$(formBlock).attr("action"),
			data,
			function(data)
			{
				$(".treecomments.tc_left .tc_get_more_block").html('');
				
				$(".treecomments.tree").append( $(data).filter(".treecomments.tree").html() );

				if ($(data).filter(".tc_get_more_block").length > 0){
					$(".treecomments.tc_left .tc_get_more_block").append($(data).filter(".tc_get_more_block").html());
				}
				// if ($(data).find(".tc_get_more_block").length > 0)
				// $(".treecomments.tc_left").append($(data).find(".tc_get_more_block")[0].outerHTML);
			},
			'html'
		);
	});
	
	// клик по кнопке Забанить на 3 дня
	$(document).on("click", ".reply-btn.for_three_days", function(e) {
		$(this).parents("#temp-reply-popup form").prepend('<input type="hidden" name="ban_period" value="259200">'); // 3 дня в секундах
	});

	$(document).on("click", ".popup.popup-reply-wrap .close", function(e) {
		$(this).closest('.popup.popup-reply-wrap').remove();
		$('#temp-reply-popup').remove();
	});
	
	// при написании/стирании текста в textarea выводим/скрываем крестик закрытия формы
	$(document).on("keyup", ".reply_form_block textarea", function(e) {
		if ($(this).val().length > 0) 	$(this).siblings('.close').fadeOut('fast');
		else 							$(this).siblings('.close').fadeIn('fast');
	});
	
	// если textarea нужно расширить - расширяем
	$(document).on("keyup", "textarea[name=UF_TEXT]", function(e) {
		console.log($(this).scrollTop());
		if ($(this).scrollTop() > 0)
			$(this).css('height', $(this)[0].scrollHeight + "px");
	});

	// ========== Прикрепление файлов ===========
	function readURL(input, reply_msg_wrap)
	{
		
		if (input.files && input.files[0]) 
		{
			var reader = new FileReader();
			var error = false;

			reader.onload = function(e)
			{
				var tc_files = reply_msg_wrap.find('.tc_files');
				if (tc_files.find('.tc_file').length >= 10) {
				  error_text.append("Максимальное количество файлов 10.<br/>");
				  error = true;
				} else {
				  tc_files.append('<div class="tc tc_file"><div class="tc tc_file_close" rel="DelFile"><svg width="12" height="12" viewBox="0 0 612 670.2"><path fill="#424242" d="M345.2,335.1L603.4,44.7c9.9-9.9,9.9-27.3,0-37.2s-24.8-9.9-37.2,0L305.5,300.4L44.8,7.4C34.9-2.5,20-2.5,7.6,7.4c-9.9,9.9-9.9,27.3,0,37.2l258.2,290.5L7.6,625.6c-9.9,9.9-9.9,27.3,0,37.2s24.8,9.9,37.2,0l260.7-292.9l260.7,292.9c9.9,9.9,24.8,9.9,37.2,0c9.9-9.9,9.9-27.3,0-37.2L345.2,335.1z"></path></svg></div><img class="tc tc_file_img" alt="" src="' + e.target.result + '" active="true"><input type="file" name="tc_files[]" class="tc_files_input hide"></div>');

				  tc_files.attr('active', 'true');

				  tc_files.find('.tc_files_input:last')[0].files = input.files;
				}
			}
			
			var error_text = reply_msg_wrap.find(".error_text");
			error_text.html('');
			
			var file = input.files[0];
			if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif')
			{
				error_text.append("Загрузите картинку Jpg/jpeg, Png или Gif.<br/>");
				error = true;
			}
			
			if (file.size > 5 * 1024 * 1024)
			{
				error_text.append("Максимальный размер файла: 5 Мб.<br/>");
				error = true;
			}
			
			if (!error)
				reader.readAsDataURL(input.files[0]);
		}
	}

	function showError(error_message_text) {
		if (typeof error_message_text !== 'undefined'
				&& error_message_text !== null
				&& error_message_text.length > 0) {


			var error_container = $('#tc_error');
			var error_message = error_container.find('#tc_error_message');
      error_message.text(error_message_text);
			panelErrorOpen();

      setTimeout(function() {
				panelErrorClose();
      }, 7000);

		}
  }

	/**
	 * открыть панель с выводом ошибок
	 */
	function panelErrorOpen() {
		var error_container = $('#tc_error');
		error_container.show();
	}

	/**
	 * закрыть панель с выводом ошибок
	 */
	function panelErrorClose() {
		var error_container = $('#tc_error');
		var error_message = error_container.find('#tc_error_message');
		error_container.fadeOut(300);
		error_message.text('');
	}

	/**
	 * закрытие попапа с ошибкой/уведомлением
	 */
	$('#tc_error_close').on('click', function() {
		panelErrorClose();
	});

	$(document).on("change", ".fileupload", function(e){
		var reply_msg_wrap = $(this).closest('.reply-msg-wrap');
		readURL(this, reply_msg_wrap);
	});
	
	// удаляем блок с превью и input
	$(document).on("click", ".tc_file_close", function(e) {
		e.preventDefault();
		
		var reply_msg_wrap = $(this).closest('.reply-msg-wrap');
		var tc_files = reply_msg_wrap.find('.tc_files');
		
		$(this).closest(".tc_file").remove();
		
		if (tc_files.find('.tc_file').length == 0)
			tc_files.attr('active', 'false');
	});
	// ========== /Прикрепление файлов ===========
	
	// ========== Обработка смайлов =============
	
	// открывашка/закрывашка
	$(document).on("click, mouseenter", ".smile", function(e) {
		e.preventDefault();
		
		var smile_list = $(this).find(".smile-list");
		
		// if (smile_list.html().length > 0)
		// {
			// smile_list.html('').removeClass('smile-list-open');
		// }
		// else
		if (smile_list.html().length == 0) {
			smile_list.append( $(".smiles_holder").html() ).addClass('smile-list-open').find(".smile-list--holder").mCustomScrollbar({
        theme     : "dark",
        callbacks : {
          onScroll : function() {

            if (this.mcs.topPct == 100) {
            	// подгрузим ещё смайлов
              // если список смайлов полностью прокручен
              var smileScrollBlock = $(this);
              var smileList = smileScrollBlock.find('.mCSB_container');
              var smileCount = smileList.find('.tc_smile_item').length;

              if (smileCount < window.commentsSmileCountTotal) {
              	// запрос на дополнительные смайлы
                smileList.append('<div id="smile_loading_wrapper"></div>'); // покажем прелоадер
                $.post(window.commentsComponentUrl + '/ajax.php', {
                  type   : 'ajax_smile',
                  offset : smileCount
                }, function(data) {
                  smileList.find('#smile_loading_wrapper').remove(); // уберём прелоадер
                  smileList.append(data);
                });
              }

            }
          } // /onScroll
        }
			});
		}
	});
	$(document).on("mouseleave", ".smile", function(e) {
		e.preventDefault();

		var smile_list = $(this).find(".smile-list");

		if (smile_list.html().length > 0)
		{
			smile_list.html('').removeClass('smile-list-open');
		}
	});


	// клик вне блока смайлов закрывает блок
	$(document).mouseup(function (e){
		$(".smile").each(function(smile_list) {
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && !$(".smile").is(e.target)) // если клик не по блоку и не по его дочерним элементам
			{
				var smile_list = $(this).find(".smile-list");
				
				smile_list.html('');
				smile_list.removeClass('smile-list-open');
			}
		});
	});
	
	// скроллер
	/*$(window).on("load",function(){
		$(".smile-list--holder").mCustomScrollbar({
			theme:"dark"
		});
	});*/
	
	// клик по смайлу - вставка в textarea
	$(document).on("click", ".tc_smile_item img", function(e) {
		e.preventDefault();

    var contenteditableArea = $(this).closest(".reply-msg-wrap").find('.textarea__textarea');
    insertEmoji(contenteditableArea, $(this)[0].cloneNode());
	});

  /**
	 * вставка эмодзи в контентном элементе
	 *
   * @param contenteditableArea
   * @param text
   */
	function insertEmoji(contenteditableArea, node) {
    var sel = window.getSelection();
    var focusNode = null;
    var indexLastEl = null;
    var range = document.createRange();

    if (sel.focusNode !== null) {
    	focusNode = sel.focusNode;
		} else {
      range.setStart(contenteditableArea[0], 0);
      focusNode = sel.focusNode
		}

		if (focusNode !== null
				&& (focusNode == contenteditableArea[0]
						|| $.contains(contenteditableArea[0], focusNode))) {
			// если целевой узел - потомок контентного,
			// добавляем куда указано
      range = sel.getRangeAt(0);
      range.startOffset = range.startOffset + 1;
		} else {
      // если целевой узел - НЕ потомок контентного,
			// добавляем в подходящий контекстный блок
			if (contenteditableArea[0].childNodes.length > 0) {
				// если контент есть,
        // добавляем в конец
				indexLastEl = contenteditableArea[0].childNodes.length - 1;
				range.setStartAfter(contenteditableArea[0].childNodes[indexLastEl]);
			} else {
				// если контента нет,
        // добавляем в начало
        range.setStart(contenteditableArea[0], 0);
			}
		}

    sel.addRange(range);
    hidePlaceholer(contenteditableArea);
    range.insertNode(node);
    sel.collapseToEnd(); // снимаем выделение узла при подстановке без фокуса
  }
	

	
	// ========= /Обработка смайлов ==============

  /**
   * показывает плейсхолдер в контентном элементе
	 *
   */
	function showPlaceholer(contenteditableArea) {
    var contenteditableContainer = contenteditableArea.closest('.textarea__container');
		contenteditableContainer.find('.textarea__placeholder').show();

  }

  /**
   * скрывает плейсхолдер в контентном элементе
   *
   */
	function hidePlaceholer(contenteditableArea) {
    var contenteditableContainer = contenteditableArea.closest('.textarea__container');
		contenteditableContainer.find('.textarea__placeholder').hide();

  }

  /**
   * обработчик фокуса на кастомном текстовом поле
   */
  $(document).on('focus', '.textarea__textarea', function(){
		hidePlaceholer($(this));
  });

  /**
   * обработчик потери фокуса на кастомном текстовом поле
   */
  $(document).on('focusout', '.textarea__textarea', function(){
    var contenteditableArea = $(this);
    var text = contenteditableArea.html();

    if(text.length > 0){
      hidePlaceholer(contenteditableArea);
    } else {
      showPlaceholer(contenteditableArea);
    }
  });

	$(document).on('click', '.js-like', function(e) {
		var _this = $(this);
		var commentId = _this.data('comment-id');

		$.ajax({
			type: 'POST',
			url: window.commentsComponentUrl + '/ajax.php',
			data: {
				type: 'like',
				comment_id: commentId,
				UF_THREAD: window.commentsThread,
			},
			success: function(data) {
				if (
					(data.TYPE !== 'OK')
					&& (typeof data.TYPE !== 'undefined')
					&& (data.MESSAGE.length > 0)
				) {
					showError(data.MESSAGE);
				}
			},
		});
	});

  /**
	 * подмена нативных эмодзи в мобилках на изображения с сайта,
   */
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
	  
	var savedSel = null;
	var savedSelActiveElement = null;
	  
    $(document).on('keyup', '.textarea__textarea', function(e){

		saveSelection();
		var text = $(e.target).html();
		text = replaceNativeEmoji(text);
		$(e.target).html(text);
		
		restoreSelection();
		
	});
	
	function saveSelection() {
		// Remove markers for previously saved selection
		if (savedSel) {
			rangy.removeMarkers(savedSel);
		}
		savedSel = rangy.saveSelection();
		savedSelActiveElement = document.activeElement;
	}

	function restoreSelection() {
		if (savedSel) {
			rangy.restoreSelection(savedSel, true);
			savedSel = null;
			window.setTimeout(function() {
				if (savedSelActiveElement && typeof savedSelActiveElement.focus != "undefined") {
					savedSelActiveElement.focus();
				}
			}, 1);
		}
	}

  }
  
	// При скролле фиксим/блочим закреплённый пост
	$(window).scroll(function () {
		checkPinnedCommentToFix();
	});

});

BX.ready(function(){
  /**
	 * меню работы с комментариями
   */
	$(document).on('click', '.more-tools-btn', function(){
		$(this).toggleClass('show');
		
		// Если блок вылез за экран, делаем его выше
		var bodyHeight = $("body").height(),
			moreToolsBlock = $(this).siblings('.rpl-btn-dd'),
			moreToolsBlockTop = $(moreToolsBlock).offset().top,
			moreToolsBlockHeight = $(moreToolsBlock).outerHeight();
			
		if (bodyHeight - moreToolsBlockTop - moreToolsBlockHeight < 0)
		{
			moreToolsBlock.offset({top: moreToolsBlockTop - $(this).outerHeight() - moreToolsBlockHeight});
		}
	});

  /**
	 * закрытие меню по клику вне меню
   */
  $(document).mouseup(function (e){
    var div = $(".more-tools-btn.show");
    if (!$(e.target).closest('div').is(div)) {
      if (!div.is(e.target)) {
        $('.more-tools-btn').removeClass('show');
      }
		}
  });

	// Push & Pull
  /**
	 * При загрузке страницы подключение к push&pull происходит через 1-2 сек.
	 * Из-за этого пользватель может не получить комментарий, добавленный в данное время.
	 *
	 * Обработчик обновляет контейнер с комментариями при статусе клиента push&pull «online»
	 *
   */
	if (typeof window.commentsLoadImmediately != 'undefined' && window.commentsLoadImmediately === true)
	{
		// если не требуется ожидать onPullStatus
		loadNewComments();
	}
	else
	{
		BX.addCustomEvent('onPullStatus', function(status){
			if (status === 'online') loadNewComments();
		});
	}
	
	// Функция загружает комменты в DOM
	function loadNewComments()
	{
		// Если комментарии ещё не загружены, то загружаем
		if ($('.treecomments.tc_left .treecomments.tree').length == 0)
		{
			$.get(
				window.commentsComponentTemplateUrl + '/comments.php',
				{
					load_comment_tree : 'Y',
					threadId : window.commentsThread,
					show_comment_id : window.show_comment_id,
					publicMode : (window.publicMode ? 'Y' : 'N'),
				},
				function(data)
				{
					$('.treecomments.tc_left').append( data );
					$('#loading_wrapper').fadeOut();
					
					if (!!window.show_comment_id)
					{
						$.when($('html, body').animate({
							scrollTop: $('#tc_comment_message_' + window.show_comment_id).offset().top
						}, 2000))
						.then(function(){
							$('#tc_comment_message_' + window.show_comment_id).css('background', 'none');
						});
					}
				}
			)
			.always(function() {
				$("#treecomments_widget .preloader").addClass('hide');
			});
		}
	}

	BX.addCustomEvent("onPullEvent", function(module_id,command,params) {
		 //console.log(module_id,command,params);
		if (module_id == "melannett.main")
		{
			if (params.COMMENT.UF_THREAD == window.commentsThread)
			{
				var treecomments = $(".treecomments.tree");
				
				/*if (window.userId == 7698)
				{
					$.post('/local/ajax/save_logs.php', {
						command: command,
						params: params
					});
				}*/

				// Добавили коммент
				if (command == 'commentAdd')
				{

					// Если комментарий добавлен текущим пользователем, то он уже добавлен ajax-ом, и дополнительно обрабатывать push&pull-ом не нужно.
					if (params.COMMENT.UF_USER_ID != window.userId)
					{
						var commentHtml = $('#pullCommentTemplate').tmpl(params.COMMENT)[0].outerHTML;

						// Если форма основная - добавляем новый коммент в верх списка.
						if (params.COMMENT.UF_PARENT_ID == 0) {
							treecomments.prepend($(commentHtml).addClass('push_added'));

						} else { // Если это ответ на коммент, добавляем в конец ветки родителя
							var parent_block = treecomments.find('#tc_comment_message_' + params.COMMENT.UF_PARENT_ID).closest('.tc_comment_block');
							parent_block.append($(commentHtml).addClass('push_added'));

						}

						treecomments.find('.push_added').removeClass('push_added');
					}

					$(".tc_comments_count").text(params.COMMENT.COMMENTS_COUNT);
				}

				// Удалили коммент
				if (command == 'commentDelete')
				{		
					if (typeof params.COMMENT.ID !== 'undefined' && params.COMMENT.ID !== null && params.COMMENT.ID > 0) {
						var treecomments = $(".treecomments.tree");
						var comment_message = treecomments.find('#tc_comment_message_' + params.COMMENT.ID);

						if (comment_message.length > 0) {
							var parent_block = comment_message.parents('.tc_comment_block').eq(1);
							comment_message.closest('.tc_comment_block').addClass('deleted');

							if (!!parent_block)
							{
								// Если этот коммент был удален не физически из таблицы (из-за наличия ответов на этот коммент)
								if (parent_block.find('.tc_comment_message_text:first').text() == "Сообщение было удалено."
									&& parent_block.find('.tc_comment_block').length > 0) // И на него не осталось больше ответов
								{
									// Разрешаем его удалить физически
									parent_block.find('.tc_button.delete:first').removeClass('hide');
								}
							}

							comment_message.closest('.tc_comment_block').remove();
						}

						$(".tc_comments_count").text(params.COMMENT.COMMENTS_COUNT);
					}
				}

				// Отредактировали коммент
				if (command == 'commentChange')
				{
					var commentHtml = $('#pullCommentTemplate').tmpl(params.COMMENT)[0];
					var comment_block = treecomments.find('#tc_comment_message_' + params.COMMENT.ID);
					var parent_block = comment_block.closest('.tc_comment_block');
					parent_block.addClass('push_added');

					var comment = $(commentHtml);
					comment_block.find('.tc_datetime').html(comment.find('.tc_datetime').html());

					var comment_block_message_text = comment_block.find('.tc_comment_message_text');
					comment_block_message_text.html(comment.find('.tc_comment_message_text').html());

					if (comment.find('.tc_comments_message_att').length > 0) {
						var comment_block_att = comment_block.find('.tc_comments_message_att');

						if (comment_block_att.length == 0) {
							comment_block_message_text.after( comment.find('.tc_comments_message_att')[0].outerHTML );
						} else {
							comment_block_att.html( comment.find('.tc_comments_message_att').html() );
						}
					}

					if (!params.COMMENT.CAN_DELETE) {
						comment_block.find('.tc_button.reply').addClass('hide')
						comment_block.find('.tc_button.delete').addClass('hide')
					} else {
						comment_block.find('.tc_button.reply').removeClass('hide')
						comment_block.find('.tc_button.delete').removeClass('hide')
					}

					treecomments.find('.push_added').removeClass('push_added');
				}
				
				// Закрепили коммент
				if (command == 'commentPin')
				{
					var pinnedCommentHtml = $($('#pullPinnedCommentTemplate').tmpl(params.COMMENT)[0]).filter('div.pinned').html();
					console.log();
					$('div.pinned').html(pinnedCommentHtml).removeClass('hide');
					
					checkPinnedCommentToFix();
				}
				
				// Открепили коммент
				if (command == 'commentUnpin')
				{		
					$('div.pinned').addClass('hide');
				}

				// Лайк
				if (command == 'commentLike')
				{
					var commentLikeCheckboxNode = $('#like' + params.COMMENT.ID);
					var likesCountNode = commentLikeCheckboxNode.parent().find('.js-likes-count');

					if (params.USER_ID == window.userId) {
						if (commentLikeCheckboxNode.attr('checked') === 'checked') {
							commentLikeCheckboxNode.removeAttr('checked');
						} else {
							commentLikeCheckboxNode.attr('checked', 'checked');
						}
					}

					if (params.COMMENT.UF_LIKES_COUNT === 0) {
						likesCountNode.addClass('hide');
					} else if (likesCountNode.hasClass('hide')) {
						likesCountNode.removeClass('hide');
					}

					likesCountNode.text(params.COMMENT.UF_LIKES_COUNT);
				}
			}
		}
	});
	
	if (window.isAuthorized == true)
		BX.PULL.extendWatch('TREE_COMMENTS');
});

// Очистка тегов при вставке текста в поле комментария
function OnPasteStripFormatting(elem, e)
{
	if (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData)
	{
		e.preventDefault();
		var text = e.originalEvent.clipboardData.getData('text/plain');

    // подмена нативных эмодзи на img
    text = replaceNativeEmoji(text);

		window.document.execCommand('insertHtml', false, text);
	}
	else if (e.clipboardData && e.clipboardData.getData)
	{
		e.preventDefault();
		var text = e.clipboardData.getData('text/plain');

		// подмена нативных эмодзи на img
    text = replaceNativeEmoji(text);

		window.document.execCommand('insertHtml', false, text);
	}
	else if (window.clipboardData && window.clipboardData.getData)
	{
		// Stop stack overflow
		/*if (!_onPaste_StripFormatting_IEPaste) {
			_onPaste_StripFormatting_IEPaste = true;
			e.preventDefault();
			window.document.execCommand('ms-pasteTextOnly', false);
		}
		_onPaste_StripFormatting_IEPaste = false;*/
	}

}

/**
 * подмена нативных эмодзи на изображения с сайта
 *
 * @param text
 */
function replaceNativeEmoji(text) {
  // text = text.replace(/(?!alt=")([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE0F]|[\u2700–\u27BF])(?!")/g, function(c){
  text = text.replace(/(?!alt=")([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF]|[\uFE0F]|[\u2700–\u27BF]|[\u2763])(?!")/g, function(c){
  // text = text.replace(/(?!alt=")([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE0F]|[\u2700–\u27BF]|[\u0169-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]|[\uFE0F])(?!")/g, function(c){
    var res = '';
    if (typeof c != 'undefined' && typeof window.commentsEmoji2Img[c] != 'undefined') {
      res = window.commentsEmoji2Img[c];
    }
    return res;
  });
  return text;
}

// Если есть закреплённый комментарий, то проверяем текущее положение экрана и фиксируем, либо делаем блочным закреплённый пост
function checkPinnedCommentToFix()
{
	$('.pinned').each(function() {
		var pinnedBottom = $(this).parents('.pinned-parent').offset().top + $(this).parents('.pinned-parent').height();

		if (!$(this).hasClass('hide')) {
			if ($(window).scrollTop() > pinnedBottom) {
				$(this).removeClass('block');
			} else {
				$(this).addClass('block');
			}
		}
	});
}