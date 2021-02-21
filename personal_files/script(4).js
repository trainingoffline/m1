function removeElement(arr, sElement)
{
	var tmp = new Array();
	for (var i = 0; i<arr.length; i++) if (arr[i] != sElement) tmp[tmp.length] = arr[i];
	arr=null;
	arr=new Array();
	for (var i = 0; i<tmp.length; i++) arr[i] = tmp[i];
	tmp = null;
	return arr;
}

function SectionClick(id)
{
	var div = document.getElementById('user_div_'+id);
	if (div.className == "profile-block-hidden")
	{
		opened_sections[opened_sections.length]=id;
	}
	else
	{
		opened_sections = removeElement(opened_sections, id);
	}

	document.cookie = cookie_prefix + "_user_profile_open=" + opened_sections.join(",") + "; expires=Thu, 31 Dec 2020 23:59:59 GMT; path=/;";
	div.className = div.className == 'profile-block-hidden' ? 'profile-block-shown' : 'profile-block-hidden';
}

function changeCalendar()
{
	setTimeout(function(){
		var el = $('[id ^= "calendar_popup_"]'); //найдем div  с календарем
		var links = el.find(".bx-calendar-cell"); //найдем элементы отображающие дни
		//console.log(links);
		$('.bx-calendar-left-arrow').attr({'onclick': 'changeCalendar();',}); //вешаем функцию изменения  календаря на кнопку смещения календаря на месяц назад
		$('.bx-calendar-right-arrow').attr({'onclick': 'changeCalendar();',}); //вешаем функцию изменения  календаря на кнопку смещения календаря на месяц вперед
		$('.bx-calendar-top-month').attr({'onclick': 'changeMonth();',}); //вешаем функцию изменения  календаря на кнопку выбора месяца
		$('.bx-calendar-top-year').attr({'onclick': 'changeYear();',}); //вешаем функцию изменения  календаря на кнопку выбора года
		var date = new Date();
		//console.log(links.length);
		for (var i =0; i < links.length; i++)
		{
			var atrDate = links[i].attributes['data-date'].value;
			var d = date.valueOf();
			var g = links[i].innerHTML;

			if (atrDate >= d) {
				$('[data-date="' + atrDate +'"]').addClass("bx-calendar-date-hidden disabled"); //меняем класс у элемента отображающего день, который меньше по дате чем текущий день
			}
		}
	}, 100);
}

function changeMonth()
{
    var el = $('[id ^= "calendar_popup_month_"]'); //найдем div  с календарем
    var links = el.find(".bx-calendar-month");
    for (var i =0; i < links.length; i++) {
        $(links[i]).attr({'onclick': 'changeCalendar();',}); //повесим событие на выбор месяца
    }
}

function changeYear()
{
    var el = $('[id ^= "calendar_popup_year_"]'); //найдем div  с календарем
    var link = el.find(".bx-calendar-year-input");
	
	$(link).on("keyup", function(e) {changeCalendar();}); //повесим событие на ввод года
	
    var links = el.find(".bx-calendar-year-number");
    for (var i =0; i < links.length; i++)
	{
		$(links[i]).attr({'onclick': 'changeCalendar();',});
    }
}

$(function () {

	$(document).on('click', 'button.uf_place.confirm', function(e){
		e.preventDefault();
		$("form#simple input[type=submit]").click();
	});

	$(document).on('click', 'button.uf_place.change', function(e){
		e.preventDefault();
		$("input#UF_PLACE").val('').focus();
		$('button.uf_place').hide();
	});

	dadataSuggestions();

	function dadataSuggestions()
	{
		$("#UF_PLACE").suggestions({
			token: "9576ca0fe1498e28eeb37c8b824d99f4d4b9a080",
			type: "ADDRESS",
			geoLocation: false,
			constraints: {
				locations: { country: "*", city_type_full: "город" }
			},
			hint: false,
			bounds: "city",
			formatResult: function(value, currentValue, suggestion, options) {
				var newValue = suggestion.data.country + ', ' + suggestion.data.city;
				suggestion.value = newValue;
				return $.Suggestions.prototype.formatResult.call(this, newValue, currentValue, suggestion, options);
			},
			formatSelected: function(suggestion) {
				return suggestion.data.country + ', ' + suggestion.data.city;
			},
			/* Вызывается, когда пользователь выбирает одну из подсказок */
			onSelect: function(suggestion) {
				//console.log(suggestion);
			}
		});
	}
});