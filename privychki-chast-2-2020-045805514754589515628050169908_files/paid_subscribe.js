$(function () {

    $('#subscribeclub .tarifs .t-card').click(function () {
        var submitButton = $('#subscribeclub .tarifs input.subscribe_link');

        submitButton.data('id', $(this).data('id'));
        submitButton.removeAttr('disabled');
    });

    // При клике по "Оплатить", "Изменить способ оплаты" выводим попап выбора платёжной системы
    $('a.subscribe_link, a.subscribe_change_link, input.subscribe_link').click(function (e){
        e.preventDefault();

        let payButton = $("a.marafone-popup__button");
        if ($(this).hasClass('subscribe_link'))
        {
            payButton.data('url', '/local/ajax/paid_subscribe.php');
            payButton.data('id', $(this).data('id'));

            let from_popup_subscription_bonus_closed = getAllUrlParams().from_popup_subscription_bonus_closed || '';
            payButton.data('from_popup_subscription_bonus_closed', from_popup_subscription_bonus_closed);

            $(".popup.marafone-popup .refund_notify").addClass("hide");

        } else if ($(this).hasClass('subscribe_change_link')) {
            payButton.data('url', '/local/ajax/paid_subscribe_change_payment.php');
            $(".popup.marafone-popup .refund_notify").removeClass("hide");
        }

        let countPaysystems = $(".popup-choise-paysystem input[name=paysystem]").length;

        // Если платёжных систем больше 1, отображаем попап выбора. Если только 1 платёжная система, то сразу переводим к оплате.
        if (countPaysystems > 1)
            $(".popup.marafone-popup").removeClass("hide");
        else
            $(".popup-choise-paysystem a.marafone-popup__button").click();
    });

    //отписываем в фоне и постим ответ
    $('.send-unsubscribe-reason').click(function (e) {
        e.preventDefault();

        if($('.js-radio-open-collapse').is(':checked') && $('.variable-answer').val()=='')
        {
            alert('Пожалуйста, укажите причину отписки');
            return false;
        }

        $.ajax({
            type: "POST",
            data : $('#unsubscribe-reason').serialize(),
            cache: false,
            url: "/local/ajax/paid_unsubscribe.php",
            success: function(data){
                $('.unsubscribe-submit-button').click();
                return true;
            }
        });
        return false;
    });

    $('a.unsubscribe_link, a.marafone-popup__button').click(function (e) {

        e.preventDefault();

        let current_url = encodeURIComponent(document.location.href);
        let url = '';
        let paySystem = '';
        let postData = {
            backurl: current_url,
            ym_client_id: window.ymClientId
        };

        if ($(this).hasClass('marafone-popup__button')) {

            paySystem = $('.popup-choise-paysystem input[name=paysystem]:checked').val() || '';
            url = $(this).data('url');

            postData.id = $(this).data('id');
            postData.from_popup_subscription_bonus_closed = getAllUrlParams().from_popup_subscription_bonus_closed || '';
            postData.paySystem = paySystem || '';
        } else if ($(this).hasClass('unsubscribe_link')) {
            //показать форму отписки
            $('.popup-unsubscribe').removeClass('hide');
            return false;
            //url = '/local/ajax/paid_unsubscribe.php';
        }

        var button = $(this);
        var preloader = preloaderStart(button);

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            success: function (data) {
                preloaderStop(preloader, button);

                try {
                    let response = JSON.parse(data);
                    let status = response.status;
                    let url = response.url;

                    console.log(paySystem);

                    if (paySystem === "") {
                        window.location.href = url+'#subscribe';
						window.location.reload();
						console.log('unsubscribe');
						
                    }

                    if (paySystem === "YANDEX") {
                        window.location.href = url;
                    }

                    if (paySystem === "CLOUDPAYMENTS") {
                        let widget = new cp.CloudPayments();

                        widget.pay('charge', // или 'charge'
                            response.options,
                            {
                                onSuccess: function (options) { // success
                                    //действие при успешной оплате
                                    window.location.href = response.return_url;
                                },
                                onFail: function (reason, options) { // fail
                                    //действие при неуспешной оплате
                                    if (reason === "User has cancelled") // если пользователь закрыл окошко оплаты Cloudpayments
                                    {
                                        let countPaysystems = $(".popup-choise-paysystem input[name=paysystem]").length;

                                        // Если платёжных систем больше 1, отображаем попап выбора
                                        if (countPaysystems > 1)
                                            $(".popup.marafone-popup").removeClass('hide');
                                    }
                                    else
                                    {
                                        window.location.href = response.return_url;
                                    }
                                },
                                onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
                                    //например вызов вашей аналитики Facebook Pixel
                                    window.location.href = response.return_url;
                                }
                            }
                        );

                        $(".popup.marafone-popup").addClass("hide");
                    }
                } catch (e) {
                    console.log(e);

                    $(".popup_pay .second-step .error-text").text('Оплата не была произведена. Пожалуйста повторите попытку через несколько минут.');
                }
            },
            error: function () {
                preloaderStop(preloader, button);
            }
        });
    });

    $(document).on('click', '.subscribe-trial', function (e) {
        e.preventDefault();

        $.ajax({
            type: 'POST',
            url: '/local/ajax/paid_subscribe_trial.php',
            data: {type: 'getTrial'},
            success: function (data) {
                var response = JSON.parse(data);
                var url = response.url;
                window.location.href = url;
            }
        });
    });

    $(document).on('click', '.subscribe-trial .popup-close', function (e) {
        e.stopPropagation();
        e.preventDefault();

        var that = $(this);

        $.ajax({
            type: 'POST',
            url: '/local/ajax/paid_subscribe_trial.php',
            data: {type: 'stopPopup'},
            success: function (data) {
                that.parents('.popup').addClass('hide');
            }
        });
    });

    $(document).on('click', '.top-notice .close', function (e) {
        e.preventDefault();

        BX.setCookie('dont_show_top_notice', 'Y', {expires: 86400 * 10000, path: '/'});
        $('div.top-notice').hide();
    });

    $(document).on('click', '.js-popup-close', function (e) {
        e.preventDefault();

        $(this).closest('.popup').addClass('hide');
    });

    $(document).on('click', '.unsubscribe_link_leeloo', function (e) {
        e.preventDefault();

        $('.popup.leeloo_unsubscribe').removeClass('hide');
    });
});

function getAllUrlParams(url) {

    // извлекаем строку из URL или объекта window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // объект для хранения параметров
    var obj = {};

    // если есть строка запроса
    if (queryString) {

        // данные после знака # будут опущены
        queryString = queryString.split('#')[0];

        // разделяем параметры
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // разделяем параметр на ключ => значение
            var a = arr[i].split('=');

            // обработка данных вида: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // передача значения параметра ('true' если значение не задано)
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // преобразование регистра
            paramName = paramName.toLowerCase();
            paramValue = paramValue.toLowerCase();

            // если ключ параметра уже задан
            if (obj[paramName]) {
                // преобразуем текущее значение в массив
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // если не задан индекс...
                if (typeof paramNum === 'undefined') {
                    // помещаем значение в конец массива
                    obj[paramName].push(paramValue);
                }
                // если индекс задан...
                else {
                    // размещаем элемент по заданному индексу
                    obj[paramName][paramNum] = paramValue;
                }
            }
            // если параметр не задан, делаем это вручную
            else {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
}