$(document).ready(function() {
	
	var templatepath = $(".timer-wrap").data("templatepath");
	
	if (templatepath)
	{
		ion.sound({
			sounds: [
				{name: "snap"},
				{name: "bell_ring"}
			],
			path: templatepath + "/sounds/",
			preload: true,
			volume: 1.0
		});
	}

	
	$('.button.timer.start, .button.timer.pause, .button.timer.resume').click(function(e){
		
		if ($(this).hasClass('start'))
		{
			StartTimer();
		}
		else if ($(this).hasClass('resume'))
		{
			window.timerIsPaused = false; // продолжить таймер
			$(this).removeClass('resume').addClass('pause').val("Пауза");
		}
		else
		{
			window.timerIsPaused = true; // пауза таймера
			$(this).removeClass('pause').addClass('resume').val("Продолжить");
		}			
	});
	
	$('.button.timer.stop').click(function(e){
		window.currentSet = 1;
		timer_numbers.scrollLeft = 0;
		
		$(".timer-progress").css("width", "0");
		TimerReinitialize();
	});
});

function StartTimer()
{
	window.timerIsPaused = false;
	
	// прокрутка к нужному кружку подхода
	var offsetLeft = $("#timer_set_" + window.currentSet).position().left;
	timer_numbers.scrollLeft = offsetLeft - 110;
	//-----------
	
	window.circlebars[0].textFilter(); // запуск таймера
	$('.button.timer.start').removeClass('start').addClass('pause').val("Пауза");
}

function TimerReinitialize()
{
	window.circlebars[0].stopTimer();
	window.currentTimePeriod = 0;
	$('.button.timer.pause, .button.timer.resume').removeClass('pause').removeClass('resume').addClass('start').val("Старт")
	TimersInitialize(window.all_prefs[0]);
	window.circlebars[0].initialise();
}

function TimersInitialize(prefs)
{
	circlebars = [];
	
	$('.circlebar').each(function() {
		prefs.element = $(this);
		window.circlebars.push(new Circlebar(prefs));
	});
	
}

function Circlebar(prefs) {
	this.element = $(prefs.element);
	this.initialized_html = this.element.html();
	this.element.append('<div class="spinner-holder-one animate-0-25-a"><div class="spinner-holder-two animate-0-25-b"><div class="loader-spinner" style=""></div></div></div><div class="spinner-holder-one animate-25-50-a"><div class="spinner-holder-two animate-25-50-b"><div class="loader-spinner"></div></div></div><div class="spinner-holder-one animate-50-75-a"><div class="spinner-holder-two animate-50-75-b"><div class="loader-spinner"></div></div></div><div class="spinner-holder-one animate-75-100-a"><div class="spinner-holder-two animate-75-100-b"><div class="loader-spinner"></div></div></div>');
	this.value, this.setValue, this.maxValue, this.counter, this.dialWidth, this.size, this.fontSize, this.fontColor, this.skin, this.triggerPercentage, this.type, this.timer;
	// var attribs = this.element.find("div")[0].parentNode.dataset;
	var attribs = this.element[0].dataset,
		that = this;
	this.initialise = function() {
		that.value = parseInt(attribs.circleStarttime) || parseInt(prefs.startTime) || 60;
		that.prevTimesSet = parseInt(prefs.prevTimesSet) || 0;
		that.maxValue = parseInt(attribs.circleMaxvalue) || parseInt(prefs.maxValue) || 60;
		that.counter = parseInt(attribs.circleCounter) || parseInt(prefs.counter) || 1000;
		that.dialWidth = parseInt(attribs.circleDialwidth) || parseInt(prefs.dialWidth) || 5;
		that.size = attribs.circleSize || prefs.size || "250px";
		that.fontSize = attribs.circleFontsize || prefs.fontSize || "20px";
		that.fontColor = attribs.circleFontcolor || prefs.fontColor || "#fff";
		that.skin = attribs.circleSkin || prefs.skin || " ";
		that.triggerPercentage = attribs.circleTriggerpercentage || prefs.triggerPercentage || false;
		that.type = attribs.circleType || prefs.type || "timer";
		that.borderColor = attribs.circleBordercolor || prefs.borderColor || "#E9588F";
		that.task_end_audio = new Audio($('#audio_task_end').attr('src'));
		that.finish_audio = new Audio($('#audio_finish').attr('src'));
		that.exercise_name = prefs.exercise_name;


		that.element.addClass(that.skin).addClass('loader');
		that.element.find(".loader-bg").css("border-width", that.dialWidth + "px");
		that.element.find(".loader-bg .exercise-name").text(that.exercise_name);
		that.element.find(".loader-spinner").css("border-width", that.dialWidth + "px").css("border-color", that.borderColor);
		that.element.css({ "width": that.size, "height": that.size });
		that.element.find(".loader-bg .text")
			.css({ "font-size": that.fontSize, "color": that.fontColor });
	};
	this.initialise();
	this.renderProgressSets = function(value) {
		
		var breakTime = 10;
		
		var setWidth = 40;
		var breakWidth = 20;
		
		var widthPx = (window.currentSet - 1) * 60;
		
		// общее прошедшее время = время текущего упражнения + время всех предыдущих упражнений подхода
		var current_time = value + that.prevTimesSet;
		var currentBreakTime = 0;
		
		if (current_time > window.setTime - breakTime)
		{
			currentBreakTime = breakTime - (window.setTime - current_time);
			current_time = window.setTime - breakTime;
		}
		
		widthPx += setWidth * (current_time / (window.setTime - breakTime)) + breakWidth * (currentBreakTime / breakTime);

		//console.log(current_time + " / " + all_time);
		$(".timer-progress").css("width", widthPx + "px");
	}
		
	this.renderProgress = function(progress) {

		progress = Math.floor(progress);
		var angle = 0;
		if (progress == 0) {
			angle = 0;
			that.element.find(".animate-0-25-b, .animate-25-50-b, .animate-50-75-b, .animate-75-100-b").css("transform", "rotate(0deg)");
			that.element.find(".loader-spinner").css("border-color", "#fff");
			if (that.triggerPercentage) {
				that.element.addClass('circle-loaded-0');
			}

		} else if (progress < 25) {
			angle = -90 + (progress / 100) * 360;
			that.element.find(".animate-0-25-b").css("transform", "rotate(" + angle + "deg)");
			if (that.triggerPercentage) {
				that.element.addClass('circle-loaded-0');
			}

		} else if (progress >= 25 && progress < 50) {
			angle = -90 + ((progress - 25) / 100) * 360;
			that.element.find(".animate-0-25-b").css("transform", "rotate(0deg)");
			that.element.find(".animate-25-50-b").css("transform", "rotate(" + angle + "deg)");
			if (that.triggerPercentage) {
				that.element.removeClass('circle-loaded-0').addClass('circle-loaded-25');
			}
		} else if (progress >= 50 && progress < 75) {
			angle = -90 + ((progress - 50) / 100) * 360;
			that.element.find(".animate-25-50-b, .animate-0-25-b").css("transform", "rotate(0deg)");
			that.element.find(".animate-50-75-b").css("transform", "rotate(" + angle + "deg)");
			if (that.triggerPercentage) {
				that.element.removeClass('circle-loaded-25').addClass('circle-loaded-50');
			}
		} else if (progress >= 75 && progress <= 100) {
			angle = -90 + ((progress - 75) / 100) * 360;
			that.element.find(".animate-50-75-b, .animate-25-50-b, .animate-0-25-b")
				.css("transform", "rotate(0deg)");
			that.element.find(".animate-75-100-b").css("transform", "rotate(" + angle + "deg)");
			if (that.triggerPercentage) {
				that.element.removeClass('circle-loaded-50').addClass('circle-loaded-75');
			}
		}
	};
	this.stopTimer = function() {
		clearInterval(that.timer);
		
		that.element.html(that.initialized_html);
	}		
	this.textFilter = function() {
		var percentage = 0,
			date = 0,
			text = that.element.find(".text");
		if (that.type == "timer") {
			that.timer = setInterval(function() {
				
				if (!window.timerIsPaused)
				{
					// если закончилив все подходы (осталась только конечная пауза), сразу заканчиваем
					if (window.currentSet == window.setCount && window.setTime - that.prevTimesSet <= 10)
					{
						$('.button.timer.stop').click();
					}
					else
					{
						that.renderProgressSets((that.maxValue - that.value));
						
						if (that.value > 0) {
							that.value -= parseInt(that.counter / 1000);
							percentage = 100 - (that.value * 100) / that.maxValue;
							that.renderProgress(percentage);
							text[0].dataset.value = that.value;
							date = new Date(null);
							date.setSeconds(that.value); // specify value for seconds here
							text.html(date.toISOString().substr(14, 5));
							
							if (that.value <= 5)
								ion.sound.play("snap");
								//that.task_end_audio.play();
						} else {
							ion.sound.play("bell_ring");
							//that.finish_audio.play();
							that.renderProgress(0);
							clearInterval(that.timer);
							
							// в подходе есть ещё упражнения
							if (++window.currentTimePeriod < window.all_prefs.length)
							{
								that.element.html(that.initialized_html);
								TimersInitialize(window.all_prefs[window.currentTimePeriod]);
								window.timerIsPaused = false;
								window.circlebars[0].textFilter(); // запуск таймера
							}
							else // закончили подход
							{
								TimerReinitialize();
								
								if (++window.currentSet <= window.setCount)
									StartTimer();
								else
									window.currentSet = 1;
							}
						}
					}
				}
			}, (that.counter));
		}
		if (that.type == "progress") {
			function setDeceleratingTimeout(factor, times) {
				var internalCallback = function(counter) {
					return function() {
						if (that.value > 0) {
							that.value -= 1;
							that.renderProgress(that.value);
							text[0].dataset.value = that.value;
							text.html(Math.floor(that.value) + "%");
							setTimeout(internalCallback, ++counter * factor);
						}
					}
				}(times, 0);
				setTimeout(internalCallback, factor);
			};
			setDeceleratingTimeout(0.1, 100);
		}
	}
	//this.textFilter();
	this.setValue = function(val) {
		text = that.element.find(".text");
		that.value = val;
		that.renderProgress(that.value);
		text[0].dataset.value = that.value;
		text.html(that.value);
	}
	this.pauseTimer = function() {
		window.timerIsPaused = true;
	}
}

(function($) {
	$.fn.Circlebar = function(prefs) {
		prefs.element = this.selector;
		new Circlebar(prefs);
	};
})(jQuery);