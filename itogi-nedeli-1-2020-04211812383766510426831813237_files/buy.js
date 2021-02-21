$(function() {
    $('.section-pay input[type=submit].pay_button').click(function(e) {

        e.preventDefault();

        let button = $(this);
        let preloader = preloaderStart(button);

        let link = $(this);
        let id = link.data('product_id');
        let typeId = link.data('type_id');
        let itemType = link.data('item_type');
        let payment_system = link.data('payment_system');
        let current_url = encodeURIComponent(document.location.href);
        let url = "/local/ajax/buy.php";

        $.ajax({
            type: 'POST',
            cache:false,
            url: url,
            data: {
                id: id,
                typeId: typeId,
                itemType: itemType,
                backurl: current_url,
                paySystem: payment_system,
                ym_client_id: window.ymClientId
            },
            success: function(data) {
                preloaderStop(preloader, button);

                var response = JSON.parse(data);
                var status = response.status;
                var url = response.url;
                window.location.href = url;
            },
            error: function(data) {
                preloaderStop(preloader, button);
            }
        });

    });

    $(document).on('submit', 'form.promocode_save', function(e) {
        e.preventDefault();

        let code = $(this).find('.input_promocode ').val();

        if (code == '') {
            $(".promocode input.input_promocode").addClass('input-invalid');
            $(".promocode .error").text('Промокод не введён');
        } else {
            $(".promocode input.input_promocode").removeClass('input-invalid');
            $(".promocode .error").text('');

            var preloader = preloaderStart($(".promocode input.input_promocode"));

            $.ajax({
                type: 'POST',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data) {

                    if (IsJsonString(data)) {
                        var json = JSON.parse(data);

                        if (json.status == 'ok') {
                            $(".promocode_save .new-price span").text(json.price);
                            $(".promocode_save .old-price span").text(json.old_price);
                            $(".promocode_save .promocode-result .code span").text(json.promocode);
                            $(".promocode_save .promocode-result .discount-info span").text(json.discount);

                            // Если после ввода промокода цена меньше 3000 руб, не отображаем выбор оплаты в кредит
                            if ($("#tinkoff_credit").length > 0)
                            {
                                if (json.price_val < 3000)
                                {
                                    $("#tinkoff_credit").parent('.radio-wrap').addClass('block-hide');

                                    $("#tinkoff_credit").parents('.second-step')
                                        .find('.radio-wrap:not(.block-hide):first')
                                        .find('input')
                                        .prop('checked', true)
                                        .attr('checked', 'checked');

                                    $('form.pay_form .total').removeClass('block-hide');
                                    $('form.pay_form .total-credit').addClass('block-hide');

                                    $('form.pay_form .pay_button').val('Оплатить');
                                }
                                else
                                    $("#tinkoff_credit").parent('.radio-wrap').removeClass('block-hide');
                            }

                            goalParams.order_price = json.price_val;

                            $(".promocode").addClass('hide');
                            $(".promocode-result, .old-price").removeClass('hide');
                        } else {
                            $(".promocode input.input_promocode").addClass('input-invalid');
                            $(".promocode .error").text(json.error);
                            $(".promocode_save .new-price span").text(json.price);

                            $(".promocode").removeClass('hide');
                            $(".promocode-result, .old-price").addClass('hide');
                        }
                    }
                },
                complete: function(data) {
                    preloaderStop(preloader);
                }
            });
        }
    });

    $('.promocode-result .close').click(function(e) {
        e.preventDefault();

        $.ajax({
            type: 'POST',
            url: $('form.promocode_save').attr('action'),
            data: {type: 'clear', product_id: $('form.promocode_save input[name=product_id]').val()},
            success: function(data) {
                if (IsJsonString(data)) {
                    var json = JSON.parse(data);

                    $(".promocode_save .new-price span").text(json.price);
                    $(".promocode input[name=promocode]").val('');

                    goalParams.order_price = json.price_val;

                    $(".promocode").removeClass('hide');
                    $(".promocode-result, .old-price").addClass('hide');

                    $(".second-step .text-notice .discount_promocode_name").text('').addClass("hide");
                    $(".second-step .text-notice .discount_name").removeClass("hide");
                }
            }
        });

    });

    $(document).on('click', '#got-promo', function(event) {
        event.preventDefault();
        $(".promocode_save").removeClass("hide");
        $("#got-promo").addClass("hide");
        $("#promo-price").addClass("hide");
    });

    $(document).on('click', '.popup_pay .popup-close', function(event) {
        event.preventDefault();

        $(this).parents('.popup_pay').addClass('hide');
    });

    $(document).on('click', '.popup_pay .have_promocode', function(event) {
        event.preventDefault();

        $(".popup_pay .promo-input").removeClass("block-hide");
        $(this).addClass("block-hide");
    });

    $(document).on('click', '.prev-step-trigger', function(event) {
        event.preventDefault();
        $(".popup_pay .first-step .error-text").text('');
        $('.prev-step-trigger').attr('disabled','disabled');
		$('.prev-step-trigger').addClass("block-hide");
        $('.popup_pay .first-step input[type=email]').attr('readonly',false);
        $('.popup_pay .first-step input[type=password]').val('');
        $(".subscription").addClass("block-hide");
        $(".popup_pay .block_password").addClass("block-hide");
        return false;
    });

    $(document).on('click', '.prev-step-trigger-gift', function(event) {
        event.preventDefault();
        $(".popup_pay .first-step .error-text").text('');
        $('.prev-step-trigger-gift').attr('disabled','disabled');
		$('.prev-step-trigger-gift').addClass("block-hide");
        $('.popup_pay .first-step input[type=email]').attr('readonly',false);
        $('.popup_pay .first-step input[type=password]').val('');
        $(".subscription").addClass("block-hide");
        $(".popup_pay .block_password").addClass("block-hide");
        return false;
    });

    $(document).on('click', '.next-step-trigger-gift', function(event) {
        event.preventDefault();

        $('.prev-step-trigger-gift').attr('disabled',false);
        $('.popup_pay .first-step input[type=email]').attr('readonly','readonly');

        $(".popup_pay .first-step .error-text").text('');

        let that = $(this);
        let email = $('.popup_pay .first-step input[type=email]').val();
        let product_id = $('.popup_pay input[name=product_id]').val() || 0;
        let item_type = $('.popup_pay input[name=item_type]').val() || "";

        if ($('.popup_pay .block_password').hasClass('block-hide')) {
            var request_data = {
                action: 'check',
                product_id: product_id,
                item_type: item_type,
                email: email
            };
        } else {
            var request_data = {
                action: 'register',
                email: email,
                password: $('.popup_pay input[name=password]').val(),
                password_confirm: $('.popup_pay input[name=password_confirm]').val(),
                sessid: BX.bitrix_sessid(),
                promocode: $('.popup_pay .promocode-wrap.subscription input.input_promocode').val() || '',
            };
        }

        var preloader = preloaderStart(that);
        //alert('stop');
        //return true;
        $.ajax({
            type: 'POST',
            url: '/local/ajax/buy_unregistered.php',
            data: request_data,
            success: function(data) {
                if (request_data.action === 'check') {
                    if (data.status === 'ok') {
						$('.prev-step-trigger-gift').removeClass("block-hide");
                        if(data.was_signed=='Y')
                        {
                            $(".popup_pay .second-step .sub-step-2-full").removeClass("block-hide");
                            $(".popup_pay .second-step .sub-step-2-gift").addClass("block-hide");

                        }
                        else
                        {
                            $(".popup_pay .second-step .sub-step-2-full").addClass("block-hide");
                            $(".popup_pay .second-step .sub-step-2-gift").removeClass("block-hide");
                        }

                        // Пользователь уже существует
                        if (data.exist === true) {

                            let showExistUserText = false;

                            if (data.item_purchased === true && ["paid_subscription", "cours"].includes(item_type))
                                showExistUserText = true;

                            if (showExistUserText) {
                                $(".popup_pay .first-step .exist-user-text").removeClass("block-hide");
                                $(".popup_pay .first-step .button").addClass("block-hide");
                            } else {
                                $(".popup_pay .first-step").addClass("block-hide");
                                $(".popup_pay .second-step").removeClass("block-hide");
                            }
                        } else // Пользователя с таким email нет в базе
                        {
                            $(".popup_pay .block_password").removeClass("block-hide");
                            $(".popup_pay .promocode-wrap.subscription").removeClass("block-hide");
                        }
                    } else {
                        $(".popup_pay .first-step .error-text").text(data.result);
						$('.popup_pay .first-step input[type=email]').attr('readonly',false);
                    }
                }
                else // action = register
                {
                    if (data.status === 'ok')
                    {

                        if(data.was_signed=='Y')
                        {
                            $(".popup_pay .second-step .sub-step-2-full").removeClass("block-hide");
                            $(".popup_pay .second-step .sub-step-2-gift").addClass("block-hide");
                        }
                        else
                        {
                            $(".popup_pay .second-step .sub-step-2-full").addClass("block-hide");
                            $(".popup_pay .second-step .sub-step-2-gift").removeClass("block-hide");
                        }


                        $(".popup_pay .first-step").addClass("block-hide");
                        $(".popup_pay .promocode-wrap.subscription").addClass("block-hide");

                        // Если это платная подписка
                        if (item_type === "paid_subscription")
                        {
                            // При регистрации был активирован промокод на бонусную подписку, отображаем кнопку перехода в клуб
                            if (data.is_subscriber)
                            {
                                $(".popup_pay .promocode-activated").removeClass("block-hide");
                            }
                            else // Промокод не активировали, отображаем второй экран с выбором тарифа / платежной системы
                            {
                                $(".popup_pay .tariff .gift").removeClass("hide");
                                $(".popup_pay .second-step").removeClass("block-hide");
                            }
                        }
                        else // Если это любые другие товары (марафон, сертификат, курс)
                        {
                            // Отображаем экран ввыода телефона
                            $(".popup_pay .phone-step").removeClass("block-hide");
                        }

                    } else {
                        $(".popup_pay .first-step .error-text").text(data.result);
						$('.popup_pay .first-step input[type=email]').attr('readonly',false);
                    }
                }
            },
            complete: function(data) {
                preloaderStop(preloader, that);
            }
        });
    });


    $(document).on('click', '.popup_pay .next-step-trigger', function(event) {
        event.preventDefault();

        $(".popup_pay .first-step .error-text").text('');

        $('.prev-step-trigger').attr('disabled',false);
		$('.popup_pay .first-step input[type=email]').attr('readonly','readonly');

        let that = $(this);
        let email = $('.popup_pay .first-step input[type=email]').val();
        let product_id = $('.popup_pay input[name=product_id]').val() || 0;
        let item_type = $('.popup_pay input[name=item_type]').val() || "";

        if ($('.popup_pay .block_password').hasClass('block-hide')) {
            var request_data = {
                action: 'check',
                product_id: product_id,
                item_type: item_type,
                email: email
            };
        } else {
            var request_data = {
                action: 'register',
                email: email,
                password: $('.popup_pay input[name=password]').val(),
                password_confirm: $('.popup_pay input[name=password_confirm]').val(),
                sessid: BX.bitrix_sessid(),
                promocode: $('.popup_pay .promocode-wrap.subscription input.input_promocode').val() || '',
            };
        }

        var preloader = preloaderStart(that);

        $.ajax({
            type: 'POST',
            url: '/local/ajax/buy_unregistered.php',
            data: request_data,
            success: function(data) {
                if (request_data.action === 'check')
                {
                    if (data.status === 'ok') {
						$('.prev-step-trigger').removeClass("block-hide");
                        // Пользователь уже существует
                        if (data.exist === true) {

                            let showExistUserText = false;

                            if (data.item_purchased === true && ["paid_subscription", "cours"].includes(item_type))
                                showExistUserText = true;

                            if (showExistUserText) {
                                $(".popup_pay .first-step .exist-user-text").removeClass("block-hide");
                                $(".popup_pay .first-step .button").addClass("block-hide");
                            } else {
                                $(".popup_pay .first-step").addClass("block-hide");
                                $(".popup_pay .second-step").removeClass("block-hide");
                            }
                        } else // Пользователя с таким email нет в базе
                        {
                            $(".popup_pay .block_password").removeClass("block-hide");
                            $(".popup_pay .promocode-wrap.subscription").removeClass("block-hide");
                        }
                    } else {
                        $(".popup_pay .first-step .error-text").text(data.result);
						$('.popup_pay .first-step input[type=email]').attr('readonly',false);
                    }
                }
                else // action = register
                {
                    if (data.status === 'ok')
                    {
                        $(".popup_pay .first-step").addClass("block-hide");
                        $(".popup_pay .promocode-wrap.subscription").addClass("block-hide");

						// Если это платная подписка
						if (item_type === "paid_subscription")
						{
							// При регистрации был активирован промокод на бонусную подписку, отображаем кнопку перехода в клуб
							if (data.is_subscriber)
							{
								$(".popup_pay .promocode-activated").removeClass("block-hide");
							}
							else // Промокод не активировали, отображаем второй экран с выбором тарифа / платежной системы
							{
								$(".popup_pay .tariff .gift").removeClass("hide");
								$(".popup_pay .second-step").removeClass("block-hide");
							}
						}
						else // Если это любые другие товары (марафон, сертификат, курс)
						{
                            // Отображаем экран ввыода телефона
                            $(".popup_pay .phone-step").removeClass("block-hide");
						}
						
                    } else {
                        $(".popup_pay .first-step .error-text").text(data.result);
						$('.popup_pay .first-step input[type=email]').attr('readonly',false);
                    }
                }
            },
            complete: function(data) {
                preloaderStop(preloader, that);
            }
        });
    });

    $(document).on('click', '.buy-marathon, .js-buy-certificate', function(e) {

        e.preventDefault();

        var preloader = preloaderStart($(this));

        var link = $(this);
        var id = link.data('id');
        var typeId = link.data('type-id');
        var itemType = link.data('item-type');
        let backurl = link.data('backurl');

        var url = '/local/ajax/basket.php';

        $.ajax({
            type: 'POST',
            url: url,
            data: {
                id: id,
                typeId: typeId,
                itemType: itemType,
                ym_client_id: window.ymClientId,
                backurl: backurl
            },
            success: function(data) {
                $(".popup_pay .popup-inner").html($(data).find('.popup-inner').html());
            },
            complete: function(data) {
                $(".popup_pay").removeClass('hide');
                preloaderStop(preloader, link);

                phoneValidation();
            }
        });
    });

    // Установка промокода
    $(document).on('click', '.button_promocode', function(e) {
        e.preventDefault();

        var that = $(this);

        let code = $(this).val();

        if (code == '') {
            $(this).addClass('input-invalid');
            $(".popup_pay .promo-input .error").text('Промокод не введён');
        } else {

            var preloader = preloaderStart($(this));
            $(this).removeClass('input-invalid');
            $(".popup_pay .promo-input .error").text('');
            var promo_form = $(this).parents('form.promocode_save');

            $.ajax({
                type: 'POST',
                url: promo_form.attr('action'),
                data: promo_form.serialize(),
                success: function(data) {
                    if (IsJsonString(data)) {
                        var json = JSON.parse(data);

                        if (json.status == 'ok') {
                            $(".popup_pay .total span").text(json.price);
                            $(".popup_pay .total .old").text(json.old_price);

                            $(".popup_pay .total-credit span").text('от ' + Math.ceil(json.price_val / 19) + ' руб в месяц');

                            $(".popup_pay .promo-info").removeClass('hide').find('span').text(json.discount + ' по промокоду ' + json.promocode);
							
							$(".second-step .text-notice .discount_promocode_name").text(json.discount + ' по промокоду ' + json.promocode).removeClass("hide");
                            $(".second-step .text-notice .discount_name").addClass("hide");

                            // Если после ввода промокода цена меньше 3000 руб, не отображаем выбор оплаты в кредит
                            if ($("#tinkoff_credit").length > 0)
                            {
                                if (json.price_val < 3000)
                                {
                                    $("#tinkoff_credit").parent('.radio-wrap').addClass('block-hide');

                                    $("#tinkoff_credit").parents('.second-step')
                                        .find('.radio-wrap:not(.block-hide):first')
                                        .find('input')
                                        .prop('checked', true)
                                        .attr('checked', 'checked');

                                    $('form.pay_form .total').removeClass('block-hide');
                                    $('form.pay_form .total-credit').addClass('block-hide');

                                    $('form.pay_form .pay_button').val('Оплатить');
                                }
                                else
                                    $("#tinkoff_credit").parent('.radio-wrap').removeClass('block-hide');
                            }

                            window.goalParams = {
                                order_price: json.price_val,
                                currency: "RUB"
                            };

                            that.addClass('hide');
                            //$(".promocode-result, .old-price").removeClass('hide');
                        } else {
                            that.addClass('input-invalid');
                            $(".popup_pay .promo-input .error").text(json.error);
                            $(".popup_pay .total span").text(json.price);

                            $(".popup_pay .total-credit span").text('от ' + Math.ceil(json.price_val / 19) + ' руб в месяц');

                            that.removeClass('hide');
                            //$(".promocode-result, .old-price").addClass('hide');
                        }
                    }
                },
                complete: function(data) {
                    preloaderStop(preloader, that);
                }
            });
        }
    });

    // Установка промокода в подписке
    $(document).on('blur', '.popup_pay .promocode-wrap.subscription input.input_promocode', function(e) {
        e.preventDefault();

        var that = $(this);

        let code = $(this).val();

        if (code === '') {
            $(this).addClass('input-invalid');
            $(".popup_pay .promo-input .error").text('Промокод не введён');
        } else {

            var preloader = preloaderStart($(this));
            $(this).removeClass('input-invalid');
            $(".popup_pay .promo-input .error").text('');
            var promo_form = $(this).parents('form.promocode_save');

            $.ajax({
                type: 'POST',
                url: promo_form.attr('action'),
                data: promo_form.serialize(),
                success: function(data) {
                    if (IsJsonString(data)) {
                        var json = JSON.parse(data);

                        if (json.status === 'ok') {
                            $(".popup_pay .promo-info").removeClass('hide').find('span').text(json.description);

                            that.addClass('hide');
                            //$(".promocode-result, .old-price").removeClass('hide');
                        } else {
                            that.addClass('input-invalid');
                            $(".popup_pay .promo-input .error").text(json.description);
                            $(".popup_pay .promo-info").addClass('hide');
                            that.removeClass('hide');
                            //$(".promocode-result, .old-price").addClass('hide');
                        }
                    }
                },
                complete: function(data) {
                    preloaderStop(preloader, that);
                }
            });
        }
    });

    // Удаление промокода
    $(document).on('click', '.promocode-wrap .promo-info a', function(e) {
        e.preventDefault();

        let promocode_wrap = $(this).parents('.promocode-wrap');
        let promo_form = $(this).parents('form.promocode_save');

        let preloader = preloaderStart($(this));

        $.ajax({
            type: 'POST',
            url: promo_form.attr('action'),
            data: {type: 'clear', product_id: promo_form.find('input[name=product_id]').val()},
            success: function(data) {
                if (IsJsonString(data)) {
                    var json = JSON.parse(data);

                    if (promocode_wrap.hasClass('subscription'))
                    {
                        $(".popup_pay input.input_promocode").val('').removeClass('hide');

                        $(".popup_pay .promo-input").removeClass('hide');
                        $(".popup_pay .promo-info").addClass('hide');
                    }
                    else
                    {
                        $(".popup_pay .total span").text(json.price);
                        $(".popup_pay .total-credit span").text('от ' + Math.ceil(json.price_val / 19) + ' руб в месяц');

                        $(".popup_pay input.input_promocode").val('').removeClass('hide');

                        // Если после ввода промокода цена меньше 3000 руб, не отображаем выбор оплаты в кредит
                        if ($("#tinkoff_credit").length > 0)
                        {
                            if (json.price_val < 3000)
                            {
                                $("#tinkoff_credit").parent('.radio-wrap').addClass('block-hide');

                                $("#tinkoff_credit").parents('.second-step')
                                    .find('.radio-wrap:not(.block-hide):first')
                                    .find('input')
                                    .prop('checked', true)
                                    .attr('checked', 'checked');

                                $('form.pay_form .total').removeClass('block-hide');
                                $('form.pay_form .total-credit').addClass('block-hide');

                                $('form.pay_form .pay_button').val('Оплатить');
                            }
                            else
                                $("#tinkoff_credit").parent('.radio-wrap').removeClass('block-hide');
                        }

                        window.goalParams.order_price = json.price_val;

                        $(".popup_pay .promo-input").removeClass('hide');
                        $(".popup_pay .total .old").text('');
                        $(".popup_pay .promo-info").addClass('hide');
						
						$(".second-step .text-notice .discount_promocode_name").text('').addClass("hide");
						$(".second-step .text-notice .discount_name").removeClass("hide");
                    }
                }
            },
            complete: function(data) {
                preloaderStop(preloader, $(this));
            }
        });

    });

    // При установке/снятии галки активируем/деактивируем кнопку оплаты
    $(document).on('change', '#oferta', function(e) {
        if (this.checked == true)
            $('.popup_pay .pay_button').prop('disabled', false);
        else
            $('.popup_pay .pay_button').prop('disabled', true);
    });

    // Оплата заказа
    $(document).on('submit', 'form.pay_form', function(e) {

        e.preventDefault();

        let _this = $(this);
        let pay_button = $(this).find('.pay_button');
        let preloader = preloaderStart(pay_button);
        $(".popup_pay .second-step .error-text").text('');

        let id = pay_button.data('product_id');
        let typeId = pay_button.data('type_id') || '';
        let itemType = pay_button.data('item_type') || '';
        let email = $(this).find('input[name=email]').val();
        let paySystem = $('.popup_pay input[name=paysystem]:checked').val() || '';
        let current_url = encodeURIComponent(document.location.href);
        let url = $(this).attr('action');
        let backurl = $(this).find('input[name=backurl]').val();
		let phone = $(this).find('input[name=form-by-send-phone]').val() || '';
		let gift = $(this).find('input[name=gift]:checked').val() || '';

        //console.log(current_url);

        $.ajax({
            type: 'POST',
            url: url,
            data: {
                id: id,
                typeId: typeId,
                itemType: itemType,
                paySystem: paySystem,
                email: email,
                ym_client_id: window.ymClientId,
                is_public: true,
				phone: phone,
                backurl: backurl,
				gift: gift
            },
            success: function(data) {
                preloaderStop(preloader, pay_button);

                try {
                    let response = JSON.parse(data);
                    let status = response.status;

                    if ((paySystem === "YANDEX" || paySystem === "CLOUDPAYMENTS") && status !== "not tester")
                    {
                        if (paySystem === "YANDEX")
                        {
                            if (!!response.confirmation_token)
                            {
                                _this.parents('.popup-content').addClass('no-padding').html('<div class="popup-close"></div><div id="yandex-payment-form"></div>');

                                //Инициализация виджета. Все параметры обязательные.
                                const checkout = new window.YandexCheckout({
                                    confirmation_token: response.confirmation_token, //Токен, который перед проведением оплаты нужно получить от Яндекс.Кассы
                                    return_url: response.return_url, //Ссылка на страницу завершения оплаты
                                    error_callback(error) {
                                        //Обработка ошибок инициализации
                                        console.log('Ошибка: ' + error);
                                        window.location.href = response.pay_url;
                                    }
                                });

                                //Отображение платежной формы в контейнере
                                checkout.render('yandex-payment-form');
                            }
                            else
                            {
                                window.location.href = response.url;
                            }
                        }

                        if (paySystem === "CLOUDPAYMENTS")
                        {
                            let widget = new cp.CloudPayments();

                            widget.pay('charge', // или 'charge'
                                response.options,
                                {
                                    onSuccess: function (options) { // success
                                        //действие при успешной оплате
                                        //console.log(options);
                                        window.location.href = response.return_url;
                                    },
                                    onFail: function (reason, options) { // fail
                                        //действие при неуспешной оплате
                                        //window.location.href = response.return_url;
                                        if (reason == "User has cancelled")
                                            _this.parents('.popup_pay').removeClass('hide');
                                        else
                                        {
                                            window.location.href = response.return_url;
                                        }
                                        
                                        //console.log(reason);
                                        //console.log(options);
                                    },
                                    onComplete: function (paymentResult, options) {
                                        
                                        //console.log(paymentResult);
                                        //console.log(options);
                                        
                                        // Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
                                        //например вызов вашей аналитики Facebook Pixel
                                        window.location.href = response.return_url;
                                    }
                                }
                            );

                            // Закрываем попап сайта, чтобы он не перекрывал попап CloudPayments
                            _this.parents('.popup_pay').addClass('hide');
                        }

                    } else {
                        let url = response.url;
                        if (url.match(/javascript/i) !== null)
                            throw "В ответе пришла не ссылка на оплату: " + url;

                        window.location.href = url;
                    }
                } catch (e) {
                    console.log(e);

                    $(".popup_pay .second-step .error-text").text('Оплата не была произведена. Пожалуйста повторите попытку через несколько минут.');
                }
            },
            error: function(data) {
                preloaderStop(preloader, pay_button);
            }
        });

    });

    // накупить сертификатов
    function getBasketSertificate(link)
    {
        let showType = link.attr('data-show');
        let url = '/local/ajax/basket_sertificate.php?t='+ (new Date().getTime()) + Math.random();
        let tariffId = link.data('id');
        let email = '';
		let backurl = link.data('backurl') || '';

        if (link.hasClass('js-subscription-email')) {
            email = link.find('input[name=email]').val();
            link = link.find('.button');
        }

        let preloader = preloaderStart(link);

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            data: {
                product_id: tariffId,
                email: email,
                show_type: showType,
                backurl: backurl,
            },
            success: function(data) {
                preloaderStop(preloader, link);

                if (data === 'redirect') {
                    location.href = '/personal/subscription-feed/';
                } else {
                    $(".popup_pay .popup-inner").html($(data).find('.popup-inner').html());
                    phoneValidation();
                    $(".popup_pay").removeClass('hide');

                    if (email) {
                        $(".popup_pay .first-step .next-step-trigger").trigger('click');
                    }

                    if (tariffId) {
                        $(".popup_pay input#tariff" + tariffId).parent().find('label').trigger('click');
                    }
                }
            },
            error: function(data) {
                preloaderStop(preloader, link);
            }
        });
    }

    // Вступить в Клуб
    function getBasketSubscription(link)
    {
        var url = '/local/ajax/basket_subscription.php';
        var tariffId = link.data('id');
        var email = '';
		let backurl = link.data('backurl') || '';

        if (link.hasClass('js-subscription-email')) {
            email = link.find('input[name=email]').val();
            link = link.find('.button');
        }

        var preloader = preloaderStart(link);

        $.ajax({
            type: 'GET',
            url: url,
            data: {
                product_id: tariffId,
                email: email,
				backurl:backurl
            },
            success: function(data) {
                preloaderStop(preloader, link);

                if (data === 'redirect') {
                    location.href = '/personal/subscription-feed/';
                } else {
                    $(".popup_pay .popup-inner").html($(data).find('.popup-inner').html());
                    $(".popup_pay").removeClass('hide');

                    if (email) {
                        $(".popup_pay .first-step .next-step-trigger").trigger('click');
                    }

                    if (tariffId) {
                        $(".popup_pay input#tariff" + tariffId).parent().find('label').trigger('click');
                    }
                }
            },
            error: function(data) {
                preloaderStop(preloader, link);
            }
        });
    }

    // 3 дня бесплатного Клуба
    function getBasketSubscriptionGift(link)
    {
        var url = '/local/ajax/basket_subscription_gift.php';
        var tariffId = link.data('id');
        var email = '';

        if (link.hasClass('js-subscription-email')) {
            email = link.find('input[name=email]').val();
            link = link.find('.button');
        }
        var preloader = preloaderStart(link);

        $.ajax({
            type: 'GET',
            url: url,
            data: {
                product_id: tariffId,
                email: email,
            },
            success: function(data) {
                preloaderStop(preloader, link);

                if (data === 'redirect') {
                    location.href = '/personal/subscription-feed/';
                } else {
                    $(".popup_pay .popup-inner").html($(data).find('.popup-inner').html());
                    $(".popup_pay").removeClass('hide');

                    if (email) {
                        alert(email);
                        //$(".popup_pay .first-step .next-step-trigger").trigger('click');
                    }

                    if (tariffId) {
                        $(".popup_pay input#tariff" + tariffId).parent().find('label').trigger('click');
                    }
                }
            },
            error: function(data) {
                preloaderStop(preloader, link);
            }
        });
    }

    $(document).on('click', '.subscribe_link, .js-subscription-future-slide, .js-subscription-tariff', function(e) {
        e.preventDefault();
        getBasketSubscription($(this));
    });

    $(document).on('click', '.sertificate_link', function(e) {
        e.preventDefault();
        getBasketSertificate($(this));
    });

    $(document).on('click', '.subscribe_link_gift', function(e) {
        e.preventDefault();
        getBasketSubscriptionGift($(this));
    });

    $(document).on('submit', '.js-subscription-email', function(e) {
        e.preventDefault();
        getBasketSubscription($(this));
    });

    // При смене тарифа клуба меняем цену и id товарного предложения
    $(document).on('change', 'input[name=tariff]', function(e) {
        var checkedInput = $('input[name=tariff]:checked');
        var id = checkedInput.val();
        var price = checkedInput.parent().find('span.price').text();

        $('form.pay_form .total span').text(price);
        $('form.pay_form input[name=id]').val(id);
        $('form.pay_form .pay_button').attr('product_id', id);
        $('form.pay_form .pay_button').attr('data-product_id', id);
        $('form.pay_form .pay_button').attr('data-id', id);

    });

    //Отправить sms скодом подтерждения на указанный телефон
    //На обработку осуществляет компонент модуля bxmaker /bitrix/components/bxmaker/authuserphone.edit
    $(document).on('click', '.form-input-tel__btn__send__code, .form-input-tel__link-repeat-send', function(e) {
        e.preventDefault();

        $('.error-message').html('').hide();
        $('.success-message').html('').hide();

        $('input[name="form-by-send-repeat-phone"]').val($('input[name="form-by-send-phone"]').val());
        var data = {
            method: 'sendCode',
            phone: $('input[name="form-by-send-phone"]').val(),
            parameters: $('input[name="form-by-send-code-params"]').val(),
            template: $('input[name="form-by-send-code-template-name"]').val(),
            siteId: $('input[name="form-by-send-code-site-id"]').val(),
            sessid: BX.bitrix_sessid()
        };

        $.ajax({
            url: '/bitrix/components/bxmaker/authuserphone.edit/ajax.php',
            type: 'POST',
            dataType: 'json',
            data: data,
            error: function (r) {
                $('.error-message').html('Error connect to server!').show();
            },
            success: function (r) {
                if(!!r.error){
                    $('.error-message').html(r.error.msg).show();
                }else{
                    $('.success-message').html(r.msg).show();
                    $('.set-andsend-phone').addClass('block-hide');
                    $('.confirm-sms-code').removeClass('block-hide');
					$(".form-input-tel__btn").removeClass("form-input-tel__skip_btn");
                }
            }
        });
    });

    //Если пользователь незахотел подтверждать телефон и нажал кнопку пропустить
    $(document).on('click', '.form-input-tel__skip, .form-input-tel__skip_btn', function(e) {
		e.preventDefault();
        $('.error-message').html('').hide();
        $('.phone-step').addClass('block-hide');
        $('.second-step').removeClass('block-hide');
        $('.promocode-wrap').removeClass('block-hide');
    });

    //Пользователь ввел код подтверждения пришедший по sms
    $(document).on('click', '.form-input-tel__btn__confirm__code', function(e) {
        e.preventDefault();

        $('.error-message').html('').hide();
        $('.success-message').html('').hide();

        var data = {
            method: 'setPhone',
            phone: $('input[name="form-by-send-repeat-phone"]').val(),
            code: $('input[name="form-by-send-confirmed-code"]').val(),
            parameters: $('input[name="form-by-send-code-params"]').val(),
            template: $('input[name="form-by-send-code-template-name"]').val(),
            siteId: $('input[name="form-by-send-code-site-id"]').val(),
            sessid: BX.bitrix_sessid()
        };

        $.ajax({
            url: '/bitrix/components/bxmaker/authuserphone.edit/ajax.php',
            type: 'POST',
            dataType: 'json',
            data: data,
            error: function (r) {
                $('.error-message').html('Error connect to server!').show();
            },
            success: function (r) {
                if(!!r.error){
                    $('.error-message').html(r.error.msg).show();
                }else {
                    $('.confirm-sms-code').addClass('block-hide');
                    $('.second-step').removeClass('block-hide');
                    $('.promocode-wrap').removeClass('block-hide');
                }
            }
        });
    });

    function showBuyButton(el) {
        el.each(function () {
            $(this).css('visibility', 'visible');
            $(this).css('opacity', '1');
        });
    }

    var buyMarathonButton = $('.buy-marathon');
    if (buyMarathonButton.length) {
        showBuyButton(buyMarathonButton);
    };

    var bueSertificate = $('.js-buy-certificate');
    if (bueSertificate.length) {
        showBuyButton(bueSertificate);
    };

    // При смене платёжного метода, меняем надписи
    $(document).on('change', 'input[name=paysystem]', function(e) {
        let checkedInput = $('input[name=paysystem]:checked');
        let paysystem = checkedInput.val();

        let price = checkedInput.parents('.second-step').find('span.price').text();



        if (paysystem == 'TINKOFF_CREDIT')
        {
            $('form.pay_form .pay_button').val('Оформить кредит');
            $('form.pay_form .total').addClass('block-hide');
            $('form.pay_form .total-credit').removeClass('block-hide');
        }
        else
        {
            $('form.pay_form .pay_button').val('Оплатить');
            $('form.pay_form .total').removeClass('block-hide');
            $('form.pay_form .total-credit').addClass('block-hide');
        }
    });
});

function IsJsonString(str)
{
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function preloaderStart(elem)
{
    var preloader = $(document).find(".melannett_preloader.main").clone();

    if (!elem.hasClass('js-subscription-future-slide')) {
        elem.after(preloader);
        elem.addClass('hide');
    } else {
        elem.append(preloader);
    }

    preloader.removeClass('main hide');

    return preloader;
}

function preloaderStop(preloader, elem = false)
{
    preloader.remove();

    if (!!elem)
        elem.removeClass('hide');
}