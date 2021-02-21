$(document).ready(function () {
  phoneValidation();
});

var phoneValidation = function () {
  var phoneBlock = $('.js-phone-validation');
  if (phoneBlock.length) {
    var maskList = $.masksSort($.masksLoad(location.origin + "/local/js/vendor/phone-codes.json"), ['#'], /[0-9]|#/, "mask");

    phoneBlock.each(function () {
      var $this = $(this);
      var phoneInput = $this.find('.js-tel');
      var phoneText = $this.find('.phone-validation__text');

      var maskOpts = {
        inputmask: {
          definitions: {
            '#': {
              validator: "[0-9]",
              cardinality: 1
            }
          },
          autoUnmask: true,
          oncomplete: function (e) {
            if (phoneText.html() === 'Россия') {
              // todo: если маска телефона принадлежит России, высылать смс код
            }
          }
        },
        match: /[0-9]/,
        replace: '#',
        list: maskList,
        listKey: "mask",
        onMaskChange: function (maskObj, completed) {
          if (completed) {
            var hint = maskObj.name_ru;
            if (maskObj.desc_ru && maskObj.desc_ru != "") {
              hint += " (" + maskObj.desc_ru + ")";
            }
            phoneText.html(hint);
          } else {
            phoneText.html("");
          }
		  
          if (phoneText.html() === 'Россия')
          {
            $(".phone_confirmation").show();
            $(".button-wrapper-block__save").hide();
            $(".form-input-tel__btn").removeClass("form-input-tel__skip_btn").addClass("form-input-tel__btn__send__code").val("Получить код");
          }
          else
          {
            $(".phone_confirmation").hide();
            $(".button-wrapper-block__save").show();
            $(".form-input-tel__btn").addClass("form-input-tel__skip_btn").removeClass("form-input-tel__btn__send__code").val("Сохранить");
          }

          $(this).attr("placeholder", $(this).inputmask("getemptymask"));
        }
		};

      phoneInput.inputmasks(maskOpts);
    });
  }
}