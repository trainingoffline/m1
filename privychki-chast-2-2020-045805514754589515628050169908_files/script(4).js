$(function() {
    var exerciseTrackerPanelSelector = '#exercise_tracker_panel';
    var exerciseTrackerPopupSelector = '#exercise_tracker_popup';

    $('body').append('<div class="popup" id="exercise_tracker_popup"></div>');

    /**
     * обработчик открывает попап со списком упражнений.
     * при открытии подгружается обновлённый контент
     *
     */
    $(document).on('click', '.js-exercise-tracker-open', function(e) {
        e.preventDefault();

        var button = $(this);
        var preloader = preloaderStart(button);

        var id = $(this).data('marathon-id');
        if (!id) {
            id = $(this).data('course-id');
        }

        var exerciseTrackerPopupContainer = $(exerciseTrackerPopupSelector);

        //var url = $(this).closest('form').prop('action');
        var url = '/local/components/magnitmedia/exercise.tracker/ajax.php';
        var formData = [];
        var date = new Date;

        if (window.exerciseTracker[id].type === 'course') {
            formData.push({name: 'course', value: id});
        } else {
            formData.push({name: 'marathon', value: id});
        }

		// Локальное время пользователя в формате d.m.Y H:i:s
		let userDate = ('0' + date.getDate()).slice(-2) + '.' + // добавляем ведущий ноль
			('0' + (date.getMonth()+1)).slice(-2) +	'.' + 		// добавляем ведущий ноль
			date.getFullYear() + ', ' +
			('0' + date.getHours()).slice(-2) + ':' +			// добавляем ведущий ноль
			('0' + date.getMinutes()).slice(-2) + ':' +			// добавляем ведущий ноль
			('0' + date.getSeconds()).slice(-2);				// добавляем ведущий ноль
			
        formData.push({name: 'date_time', value: userDate});
        formData.push({name: 'params', value: window.exerciseTracker[id].params});
        $.get(
            url,
            formData,
            function(_response) {
                exerciseTrackerPopupContainer.html($(_response).filter(exerciseTrackerPopupSelector).html());

                var exerciseTrackerPopup = $(exerciseTrackerPopupSelector);
                exerciseTrackerPopup.show();
            }
        )
            .always(function() {
                preloaderStop(preloader, button);
            });
    });

    /**
     * обработчик закрывает попап со списком упражнений
     *
     */
    $(document).on('click', '#exercise_tracker_popup .popup-close', function() {
        $(this).closest('.popup').hide();
    });

    /**
     * обработчик выполняет отправку данных для добавления/уления трекера
     * и обновляет список упражнений
     *
     */
    $(document).on('change', '.exercise_tracker_form input', function() {
        var input = $(this);
        var form = input.closest('form');
        var popupAutoOpen = form.hasClass('.exercise_tracker_popup');

        var id = form.find('input[name=marathon]').val();
        if (!id) {
            id = form.find('input[name=course]').val();
        }

        var url = form.prop('action');
        var formData = [];
        var date = new Date;
        var action = 'del';
        var exerciseTrackerPanelContainer = $(this).closest(exerciseTrackerPanelSelector);
        var exerciseTrackerPopupContainer = $(exerciseTrackerPopupSelector);

        if (input.prop('checked')) {
            action = 'add';
        }

        formData.push({name: 'action', value: action});

        if (window.exerciseTracker[id].type === 'course') {
            formData.push({name: 'course', value: id});
            formData.push({name: 'exercise_course', value: input.prop('name')});
        } else {
            formData.push({name: 'marathon', value: id});
            formData.push({name: 'exercise', value: input.prop('name')});
        }

		// Локальное время пользователя в формате d.m.Y H:i:s
		let userDate = ('0' + date.getDate()).slice(-2) + '.' + // добавляем ведущий ноль
			('0' + (date.getMonth()+1)).slice(-2) +	'.' + 		// добавляем ведущий ноль
			date.getFullYear() + ', ' +
			('0' + date.getHours()).slice(-2) + ':' +			// добавляем ведущий ноль
			('0' + date.getMinutes()).slice(-2) + ':' +			// добавляем ведущий ноль
			('0' + date.getSeconds()).slice(-2);				// добавляем ведущий ноль
			
        formData.push({name: 'date_time', value: userDate});
        formData.push({name: 'params', value: window.exerciseTracker[id].params});

        var preloader = preloaderStart(input);

        $.get(
            url,
            formData,
            function(_response) {

                exerciseTrackerPopupContainer.find("input#" + id).html($(_response).find("input#" + id).html());
                exerciseTrackerPanelContainer.html($(_response).find(exerciseTrackerPanelSelector).html());

                if (popupAutoOpen) {
                    var exerciseTrackerPopup = $(exerciseTrackerPopupSelector);
                    exerciseTrackerPopup.show();
                }

            }
        )
            .always(function() {
                preloaderStop(preloader, input);
            });

    });
});
