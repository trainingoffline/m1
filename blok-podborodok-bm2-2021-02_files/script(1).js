$(document).ready(function() {
    window.QAComponent.get = function(sectionId, elementId) {
        sectionId = sectionId || 0;
        elementId = elementId || 0;

        if (window.QAComponent.ajax_url !== undefined) {
            var overlayHelpNode = $('#help .help-wrap');
            var preloaderNode = overlayHelpNode.find('.preloader-wrap');

            $.ajax({
                type: 'POST',
                url: window.QAComponent.ajax_url,
                data: {
                    section_id: sectionId,
                    element_id: elementId
                },
                beforeSend: function() {
                    preloaderNode.removeClass('hide');
                    overlayHelpNode.find('.help-sidebar').remove();
                    overlayHelpNode.find('.info-wrap').remove();
                },
                success: function(data) {
                    preloaderNode.addClass('hide');
                    overlayHelpNode.append(data);
                },
            });
        }
    }

    $(document).on('click', '.help-icon, #help .close-overlay', function(e) {
        e.preventDefault();

        $('#help').toggleClass('show');
    });

    $(document).on('click', '#help .icon-expand', function(e) {
        e.preventDefault();

        var parentNode = $(this).closest('li');

        parentNode.find('.subnav').first().toggleClass('list-hidden');
        parentNode.find('.icon-expand').first().toggleClass('rotate');
    });

    $(document).on('click', '#help .mobile-button-subnav', function(e) {
        e.preventDefault();
        $(this).find('.icon-expand2').toggleClass('rotate');
        $('#help .mobile-subnav-list').toggleClass('show');
    });

    $(document).on('click', '#help .subnav2', function(e) {
        e.preventDefault();

        var parentNode = $(this).closest('li');

        parentNode.find('.second').first().toggleClass('show');
        $(this).find('.icon-expand3').toggleClass('rotate');
    });

    $(document).on('click', '.help-icon', function(e) {
        window.QAComponent.get();
    });

    $(document).on('click', '#help .nav-item > span', function(e) {
        e.preventDefault();

        var linkNode = $(this).parent();

        window.QAComponent.get(
            linkNode.data('section-id'),
            linkNode.data('element-id'),
        );
    });

    $(document).on('click', '#help .info-block .title', function(e) {
        e.preventDefault();

        var linkNode = $(this);

        window.QAComponent.get(
            linkNode.data('section-id'),
            linkNode.data('element-id'),
        );
    });
});