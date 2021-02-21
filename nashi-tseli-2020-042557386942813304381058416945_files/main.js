/*! =========================================================
 *
 * Material Dashboard PRO - V1.1.0
 *
 * =========================================================
 *
 * Copyright 2016 Creative Tim (http://www.creative-tim.com/product/material-dashboard-pro)
 *
 *
 *                       _oo0oo_
 *                      o8888888o
 *                      88" . "88
 *                      (| -_- |)
 *                      0\  =  /0
 *                    ___/`---'\___
 *                  .' \|     |// '.
 *                 / \|||  :  |||// \
 *                / _||||| -:- |||||- \
 *               |   | \\  -  /// |   |
 *               | \_|  ''\---/''  |_/ |
 *               \  .-\__  '-'  ___/-. /
 *             ___'. .'  /--.--\  `. .'___
 *          ."" '<  `.___\_<|>_/___.' >' "".
 *         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *         \  \ `_.   \_ __\ /__ _/   .-` /  /
 *     =====`-.____`.___ \_____/___.-`___.-'=====
 *                       `=---='
 *
 *     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *               Buddha Bless:  "No Bugs"
 *
 * ========================================================= */
/*
 (function(){
     isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

     if (isWindows && !$('body').hasClass('sidebar-mini')){
        // if we are on windows OS we activate the perfectScrollbar function
        $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();

        $('html').addClass('perfect-scrollbar-on');
    } else {
        $('html').addClass('perfect-scrollbar-off');
    }
 })();
*/
var breakCards = true;

var searchVisible = 0;
var transparent = true;

var transparentDemo = true;
var fixedTop = false;

var mobile_menu_visible = 0,
    mobile_menu_initialized = false,
    toggle_initialized = false,
    bootstrap_nav_initialized = false;

var seq = 0, delays = 80, durations = 500;
var seq2 = 0, delays2 = 80, durations2 = 500;


$(function(){

    $sidebar = $('.sidebar');

    //$.material.init();

    // We put modals out of wrapper to working properly
    $('.modal').appendTo("body");

    md.initSidebarsCheck();

    if($('body').hasClass('sidebar-mini')){
        md.misc.sidebar_mini_active = true;
    }

    window_width = $(window).width();

    // check if there is an image set for the sidebar's background
    md.checkSidebarImage();

    md.initMinimizeSidebar();

    //    Activate bootstrap-select
    if($(".selectpicker").length != 0){
        $(".selectpicker").selectpicker();
    }

	/////////////////////////////////////////////////
    //  Activate the tooltips
//    $('[rel="tooltip"]').tooltip();

	/////////////////////////////////////////////////


    //removed class label and label-color from tag span and replaced with data-color
/*    var tagClass = $('.tagsinput').data('color');

    $('.tagsinput').tagsinput({
        tagClass: ' tag-'+ tagClass +' '
    });
*/
    //    Activate bootstrap-select
//    $(".select").dropdown({ "dropdownClass": "dropdown-menu", "optionClass": "" });

    $('.form-control').on("focus", function(){
        $(this).parent('.input-group').addClass("input-group-focus");
    }).on("blur", function(){
        $(this).parent(".input-group").removeClass("input-group-focus");
    });


    if(breakCards == true){
        // We break the cards headers if there is too much stress on them :-)
        $('[data-header-animation="true"]').each(function(){
            var $fix_button = $(this)
            var $card = $(this).parent('.card');

            $card.find('.fix-broken-card').click(function(){
                console.log(this);
                var $header = $(this).parent().parent().siblings('.card-header, .card-image');

                $header.removeClass('hinge').addClass('fadeInDown');

                $card.attr('data-count',0);

                setTimeout(function(){
                    $header.removeClass('fadeInDown animate');
                },480);
            });

            $card.mouseenter(function(){
                var $this = $(this);
                hover_count = parseInt($this.attr('data-count'), 10) + 1 || 0;
                $this.attr("data-count", hover_count);

                if (hover_count >= 20){
                    $(this).children('.card-header, .card-image').addClass('hinge animated');
                }
            });
        });
    }

    var parseSearch = location.search.match(/scroll=(.*?)(&|$)/);
    if (parseSearch) {
        $('html, body').animate({
            scrollTop: $('#' + parseSearch[1]).offset().top
        }, 500);
    }

});

// activate collapse right menu when the windows is resized
$(window).resize(function(){
    md.initSidebarsCheck();
    seq = seq2 = 0;
});

md = {
    misc:{
        navbar_menu_visible: 0,
        active_collapse: true,
        disabled_collapse_init: 0,
    },

    checkSidebarImage: function(){
        $sidebar = $('.sidebar');
        image_src = $sidebar.data('image');

        if(image_src !== undefined){
            sidebar_container = '<div class="sidebar-background" style="background-image: url(' + image_src + ') "/>';
            $sidebar.append(sidebar_container);
        }
    },

    initSliders: function(){
        // Sliders for demo purpose
        // $('#sliderRegular').noUiSlider({
        //     start: 40,
        //     connect: "lower",
        //     range: {
        //         min: 0,
        //         max: 100
        //     }
        // });

        // $('#sliderDouble').noUiSlider({
        //     start: [20, 60] ,
        //     connect: true,
        //     range: {
        //         min: 0,
        //         max: 100
        //     }
        // });
    },

    initSidebarsCheck: function(){
        if($(window).width() <= 991){
            if($('.sidebar').length != 0){
                md.initRightMenu();
            } else {
                md.initBootstrapNavbarMenu();
            }
        }

    },

    initMinimizeSidebar:function(){

        // when we are on a Desktop Screen and the collapse is triggered we check if the sidebar mini is active or not. If it is active then we don't let the collapse to show the elements because the elements from the collapse are showing on the hover state over the icons in sidebar mini, not on the click.
        $('.sidebar .collapse').on('show.bs.collapse',function(){
            if($(window).width() > 991 && md.misc.sidebar_mini_active == true){
                return false;
            } else{
                return true;
            }
        });

        $('#minimizeSidebar').click(function(){
            var $btn = $(this);

            if(md.misc.sidebar_mini_active == true){
                $('body').removeClass('sidebar-mini');
                md.misc.sidebar_mini_active = false;

                if(isWindows){
                    $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
                }

            }else{

                $('.sidebar .collapse').collapse('hide').on('hidden.bs.collapse',function(){
                    $(this).css('height','auto');
                });

                if(isWindows){
                    $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar('destroy');
                }

                setTimeout(function(){
                    $('body').addClass('sidebar-mini');

                    $('.sidebar .collapse').css('height','auto');
                    md.misc.sidebar_mini_active = true;
                },300);
            }

            // we simulate the window Resize so the charts will get updated in realtime.
            var simulateWindowResize = setInterval(function(){
                window.dispatchEvent(new Event('resize'));
            },180);

            // we stop the simulation of Window Resize after the animations are completed
            setTimeout(function(){
                clearInterval(simulateWindowResize);
            },1000);
        });
    },

    checkScrollForTransparentNavbar: debounce(function() {
            if($(document).scrollTop() > 260 ) {
                if(transparent) {
                    transparent = false;
                    $('.navbar-color-on-scroll').removeClass('navbar-transparent');
                }
            } else {
                if( !transparent ) {
                    transparent = true;
                    $('.navbar-color-on-scroll').addClass('navbar-transparent');
                }
            }
    }, 17),


    initRightMenu: debounce(function(){
        $sidebar_wrapper = $('.sidebar-wrapper');

        if(!mobile_menu_initialized){
            $navbar = $('nav').find('.navbar-collapse').first().clone(true);

            nav_content = '';
            mobile_menu_content = '';

            $navbar.children('ul').each(function(){

                content_buff = $(this).html();
                nav_content = nav_content + content_buff;
            });

            nav_content = '<ul class="nav nav-mobile-menu">' + nav_content + '</ul>';

            $navbar_form = $('nav').find('.navbar-form').clone(true);

            $sidebar_nav = $sidebar_wrapper.find(' > .nav');

            // insert the navbar form before the sidebar list
            $nav_content = $(nav_content);
            $nav_content.insertBefore($sidebar_nav);
            $navbar_form.insertBefore($nav_content);

            $(".sidebar-wrapper .dropdown .dropdown-menu > li > a").click(function(event) {
                event.stopPropagation();

            });

            // simulate resize so all the charts/maps will be redrawn
            window.dispatchEvent(new Event('resize'));

            mobile_menu_initialized = true;
        } else {
            if($(window).width() > 991){
                // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
                $sidebar_wrapper.find('.navbar-form').remove();
                $sidebar_wrapper.find('.nav-mobile-menu').remove();

                mobile_menu_initialized = false;
            }
        }

        if(!toggle_initialized){
            $toggle = $('.navbar-toggle');

            $toggle.click(function (){

                if(mobile_menu_visible == 1) {
                    $('html').removeClass('nav-open');

                    $('.close-layer').remove();
                    setTimeout(function(){
                        $toggle.removeClass('toggled');
                    }, 400);

                    mobile_menu_visible = 0;
                } else {
                    setTimeout(function(){
                        $toggle.addClass('toggled');
                    }, 430);


                    main_panel_height = $('.main-panel')[0].scrollHeight;
                    $layer = $('<div class="close-layer"></div>');
                    $layer.css('height',main_panel_height + 'px');
                    $layer.appendTo(".main-panel");

                    setTimeout(function(){
                        $layer.addClass('visible');
                    }, 100);

                    $layer.click(function() {
                        $('html').removeClass('nav-open');
                        mobile_menu_visible = 0;

                        $layer.removeClass('visible');

                         setTimeout(function(){
                            $layer.remove();
                            $toggle.removeClass('toggled');

                         }, 400);
                    });

                    $('html').addClass('nav-open');
                    mobile_menu_visible = 1;

                }
            });

            toggle_initialized = true;
        }
    }, 200),


    initBootstrapNavbarMenu: debounce(function(){

        if(!bootstrap_nav_initialized){
            $navbar = $('nav').find('.navbar-collapse').first().clone(true);

            nav_content = '';
            mobile_menu_content = '';

            //add the content from the regular header to the mobile menu
            $navbar.children('ul').each(function(){
                content_buff = $(this).html();
                nav_content = nav_content + content_buff;
            });

            nav_content = '<ul class="nav nav-mobile-menu">' + nav_content + '</ul>';

            $navbar.html(nav_content);
            $navbar.addClass('off-canvas-sidebar');

            // append it to the body, so it will come from the right side of the screen
            $('body').append($navbar);

            $toggle = $('.navbar-toggle');

            $navbar.find('a').removeClass('btn btn-round btn-default');
            $navbar.find('button').removeClass('btn-round btn-fill btn-info btn-primary btn-success btn-danger btn-warning btn-neutral');
            $navbar.find('button').addClass('btn-simple btn-block');

            $toggle.click(function (){
                if(mobile_menu_visible == 1) {
                    $('html').removeClass('nav-open');

                    $('.close-layer').remove();
                    setTimeout(function(){
                        $toggle.removeClass('toggled');
                    }, 400);

                    mobile_menu_visible = 0;
                } else {
                    setTimeout(function(){
                        $toggle.addClass('toggled');
                    }, 430);

                    $layer = $('<div class="close-layer"></div>');
                    $layer.appendTo(".wrapper-full-page");

                    setTimeout(function(){
                        $layer.addClass('visible');
                    }, 100);


                    $layer.click(function() {
                        $('html').removeClass('nav-open');
                        mobile_menu_visible = 0;

                        $layer.removeClass('visible');

                         setTimeout(function(){
                            $layer.remove();
                            $toggle.removeClass('toggled');

                         }, 400);
                    });

                    $('html').addClass('nav-open');
                    mobile_menu_visible = 1;

                }

            });
            bootstrap_nav_initialized = true;
        }
    }, 500),

    startAnimationForLineChart: function(chart){

        chart.on('draw', function(data) {
          if(data.type === 'line' || data.type === 'area') {
            data.element.animate({
              d: {
                begin: 600,
                dur: 700,
                from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                to: data.path.clone().stringify(),
                easing: Chartist.Svg.Easing.easeOutQuint
              }
            });
          } else if(data.type === 'point') {
                seq++;
                data.element.animate({
                  opacity: {
                    begin: seq * delays,
                    dur: durations,
                    from: 0,
                    to: 1,
                    easing: 'ease'
                  }
                });
            }
        });

        seq = 0;
    },
    startAnimationForBarChart: function(chart){

        chart.on('draw', function(data) {
          if(data.type === 'bar'){
              seq2++;
              data.element.animate({
                opacity: {
                  begin: seq2 * delays2,
                  dur: durations2,
                  from: 0,
                  to: 1,
                  easing: 'ease'
                }
              });
          }
        });

        seq2 = 0;
    }
}


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
		if (immediate && !timeout) func.apply(context, args);
	};
};
$(function(){

    if($(window).width() <= 991){
        if($('.sidebar').length != 0){
            md.initRightMenu();
        } else {
            md.initBootstrapNavbarMenu();
        }
    }
});

// fileinput limit size notify
$(function(){
	$('input[type="file"]').on("change.bs.fileinput", function (e) {
		change_file_handler(this);
	});

	$(document).on("click", ".input-video-remove", function (e) {
        let form = $('form.upload_images');
        let formData = new FormData(form.get(0));
        $.post({
            url: 			form.attr('action'),
            dataType: 		'html',
            contentType: 	false, // важно - убираем форматирование данных по умолчанию
            processData: 	false, // важно - убираем преобразование строк по умолчанию
            data: 			formData,
            success: 		function(response)
            {
                $(".contest_detail").html($(response).find('.contest_detail').html());

                $('input[type="file"]').off("change.bs.fileinput").on("change.bs.fileinput", function (e) {
                    change_file_handler(this);
                });
            },

        }).always(function()
        {
            $(".fileinput-buttons").removeClass('hide');
            $(".preloader").addClass('hide');
        });
	});

	$('.fileinput').on("max_size.bs.fileinput", function (e) {
		console.log('error');
		$(this).find(".error").show();
	});

	$(document).on('click', '.btn-danger.fileinput-exists', function (e) {
		$(this).parents('.fileinput').find(".error").show();
		$(this).parents('.fileinput').find('input.date_photo').removeAttr('required');
	});

	$(document).on('submit', 'form.upload_images', function(e) {

		if ($(this).hasClass('subscribe'))
			return true;

		e.preventDefault();

		var $that = $(this),
		formData = new FormData($that.get(0)); // создаем новый экземпляр объекта и передаем ему нашу форму (*)
		$.post({
			url: 			$that.attr('action'),
			dataType: 		'html',
			contentType: 	false, // важно - убираем форматирование данных по умолчанию
			processData: 	false, // важно - убираем преобразование строк по умолчанию
			data: 			formData,
			success: 		function(response)
			{
				$(".contest_detail").html($(response).find('.contest_detail').html());

				$('input[type="file"]').off("change.bs.fileinput").on("change.bs.fileinput", function (e) {
					change_file_handler(this);
				});
			},

		}).always(function()
		{
			$(".fileinput-buttons").removeClass('hide');
			$(".preloader").addClass('hide');
		});
	});
});

// hypercomments block click on nickname
$(function(){
	$('document').on("click", ".hc__nick", function (e) {
		return false;
	});

	// выводим нормальную дату размещения комментария
	hypercomments_display_date();
	setInterval(hypercomments_display_date, 5000);

	// перезагружаем виджет, если слетела авторизация
	setInterval(hypercomments_reinit, 5000);
});

function hypercomments_display_date()
{
	$(".hc__message__comment").each(function(e){
		var dateTime = new Date($(this).find("meta[itemprop=dateCreated]").attr("content"));
		$(this).find(".hc__time").text( dateTime.toLocaleDateString('ru') + ' ' + dateTime.toLocaleTimeString('ru') );
	});
}

function hypercomments_reinit()
{
	if ($("#hypercomments_widget .hcc.hc__nodisqus__login").length > 0)
	{
		var xid = $("#hypercomments_widget").data("xid");

		if (!!xid)
		{
			$.ajax({
				url: "/local/templates/personal/ajax/get_hypercomments.php",
				type: "POST",
				data: {xid: xid},
				success: function(data) {
					if (!!data)
					{
						eval($(data).filter("script").html());
					}
				},
				dataType: 'html'
			});
		}
	}
}

$(function(){
	$(document).on('click', ".rotate_image_link", function(e){
		e.preventDefault();

		console.log("click");

		var fileId = $(this).data("file-id");

		console.log(fileId);

		if (fileId && $("#" + fileId + "Edit").length > 0)
		{
			$("#" + fileId + "Edit").click();
		}
	});

	$(document).on("click", "#popupFM .popup-window-button-accept", function(e){
		e.preventDefault();

		console.log("click");

		var popup = $(this).parents("#popupFM");

		if (!!popup)
		{
			var editor = popup.find(".adm-photoeditor-preview-panel-container.active");

			if (!!editor)
			{
				var fileId = editor.attr('id').replace('FM_', '').replace('EditorItem', '');
				console.log("fileId");
				console.log(fileId);

				if (!!fileId)
				{
					var changeImageForm = $("form[name=changeImage" + fileId + "]");
					if (changeImageForm.length > 0)
					{
						window.rotateTimerId = setInterval(rotate_image_ajax, 1000, changeImageForm);
					}
				}
			}
		}
	});

	/*$(".form_rotate_image .adm-fileinput-item-preview input:eq(2)").change(function(e){
		console.log("change");
	});*/

    showPopupMinSort();
});

function rotate_image_ajax(changeImageForm)
{
	if (changeImageForm.find(".adm-fileinput-item-preview input[type=hidden]").length > 0)
	{
		clearInterval(window.rotateTimerId);

		$.ajax({
			url:		changeImageForm.attr("action"),
			type:     	changeImageForm.attr("method"),
			dataType: 	"html",
			data: 		changeImageForm.serialize(),
			success: function(result) { //Данные отправлены успешно
				if (result == 'ok')
					location.reload();
			},
			error: function(result) { // Данные не отправлены
				console.log('Ошибка. Данные не отправлены.');
			}
		});
	}
}

function change_file_handler(elem)
{
	let fileinput = $(elem).parents('.fileinput');
	let maxFileSize = fileinput.data("max-size");
	fileinput.find(".error").hide();
	fileinput.find('input.date_photo').prop('required', true);

    let file = elem.files[0];

	if (file["size"] > 1024 * 1024 * maxFileSize)
	{
		fileinput.find(".error").show();
	}
	else
	{
		if (!$(elem).hasClass('subscribe'))
		{
			$(".fileinput-buttons").addClass('hide');
			$(".preloader").removeClass('hide');

            let that = $(elem);
			setTimeout(function() {
				that.parents('form.upload_images').submit();
			}, 100);
		}
	}
}

$(document).on('submit', 'form.socserv_set_email', function(e) {
	e.preventDefault();

	var that = $(this);

	$.ajax({
		type: 'POST',
		url: $(this).attr('action'),
		data: $(this).serialize(),
		success: function(data)
		{
			switch(data)
			{
				case 'ok':
					that.attr('action', '/auth/email-confirm/').find(".title-text").html("Введите код подтверждения");
					that.find("input[name=email]").hide().after('<input type="text" class="form-control" name="code" placeholder="Код подверждения"/>');
					break;

				case 'redirect':
					window.location.href = '/personal/';
					break;

				default:
					that.find(".error").text(data);
					break;
			}
		}
	});
});

function preloaderStart(elem)
{
    var preloader = $(document).find(".melannett_preloader.main").clone();
    elem.after(preloader);

    elem.addClass('hide');
    preloader.removeClass('main hide');

    return preloader;
}

function preloaderStop(preloader, elem = false)
{
    preloader.remove();

    if (!!elem)
        elem.removeClass('hide');
}

/**
 * Отображаем попап с минимальным значением сортировки среди попапов на странице
 */
function showPopupMinSort()
{
    var minSort = false;

    $('.popup[data-popup-sort]').each(function() {
        var currentSort = parseInt($(this).data('popup-sort'));

        if (
            !minSort
            || (minSort > currentSort)
        ) {
            minSort = currentSort;
        }
    });

    $('.popup[data-popup-sort="' + minSort + '"]').show();
}

$(document).ready(function () {
    $(".options-toggle").closest('.primary-btn').click(function (event) {
        // event.preventDefault();
        $(".button-options").toggleClass("show");
        $(".options-toggle").toggleClass("rotate");
    });

    $(".tarif-toggle").click(function (event) {
        event.preventDefault();
        $(".tarif-cards").toggleClass("show");
        $(".arrow").toggleClass("rotate");
    });

    $(".history-toggle").closest('h2').click(function (event) {
        // event.preventDefault();
        $(".history-list").toggleClass("show");
        $(".history-toggle").toggleClass("rotate");
    });

    $(".approve").click(function (event) {
        event.preventDefault();
        $(".approve-form").toggleClass("show");
    });

    $(".toggle-points-overlay").click(function (event) {
        event.preventDefault();
        $(".modal-overlay").addClass("show");
    });

    $(".modal-close").click(function (event) {
        event.preventDefault();
        $(".modal-overlay").removeClass("show");
    });

    if ($('.autosize')) {
        autosize()

        function autosize() {
            var text = $('.autosize');

            text.each(function () {
                $(this).attr('rows', 1);
                resize($(this));
            });

            text.on('input', function () {
                resize($(this));
            });

            function resize($text) {
                $text.css('height', 'auto');
                $text.css('height', $text[0].scrollHeight + 'px');
            }
        }
    }

    var $arrCheckBox = $('.js-validate-checkbox');
    if ($arrCheckBox.length) {
        $arrCheckBox.each(function () {
            $(this).before("<div class='tooltip-new'></div>")
        });

        $arrCheckBox.change(function () {
            var $this = $(this);
            var tooltip = $this.siblings('.tooltip-new');

            tooltip.tooltip('hide');
        });

        $("form").on('submit', function (e) {
            var valid = true;
            var first = true;

            $arrCheckBox.each(function () {
                var $this = $(this);
                var tooltip = $this.siblings('.tooltip-new');

                if ($this.prop('checked') === false) {
                    valid = false
                    if (first) {
                        $('body, html').animate({scrollTop: $this.offset().top - 120}, 600, 'swing');
                        tooltip.tooltip({
                            title: 'Нажмите checkbox',
                        });
                        tooltip.tooltip('show');
                        first = false;
                    }
                }
            });
            if (!valid) {
                return false;
            }
        });
    }

    $('.js-change-tab a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        console.log('Событие переключения табов');
        console.log(e.target);
    });

    $(document).on('click', '.js-to-tab', function (e) {
      e.preventDefault();

      var href = $(this).attr('href');
      var linkTab = $('.webinar-form__nav').find('[href=' + '"' + href + '"]');

      $('li[role="presentation"]').removeClass('active');
      linkTab.closest('li').addClass('active');
      $(this).tab('show');

      if (href === '#reg') {
        $('.js-tab-reg').hide();
        $('.js-tab-auth').show();
      } else if (href === '#auth') {
        $('.js-tab-reg').show();
        $('.js-tab-auth').hide();
      }
    });


    $(document).on('change', '.js-radio-open-textarea', function (e) {
      console.log(e.target);

      if($(e.target).hasClass('js-radio-open-collapse')) {
        $('.js-radio-close-collapse').attr('checked',false);
        $('#collapseTextarea').collapse('show');
      } else if ($(e.target).hasClass('js-radio-close-collapse')) {
        $('.js-radio-open-collapse').attr('checked',false);
        $('#collapseTextarea').collapse('hide');
      }
    });

    $(document).on('click', '.js-switch-text', function (e) {
      e.preventDefault();
      var $this = $(this);
      var dataText = $this.data('text');
      var valText = $this.text();

      $this.data('text', valText);
      $this.text(dataText);

    });
});
