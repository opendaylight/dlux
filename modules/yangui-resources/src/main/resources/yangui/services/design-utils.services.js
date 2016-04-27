define(['app/yangui/yangui.module'], function (yangui) {
    'use strict';

    yangui.register.service('DesignUtilsService', DesignUtilsService);

    function DesignUtilsService(){

        var service = {
            getHistoryPopUpWidth: getHistoryPopUpWidth,
            setDraggablePopups: setDraggablePopups,
            triggerWindowResize: triggerWindowResize,
        };

        return service;

        // TODO: add service's description
        function setDraggablePopups(){
            $( '.draggablePopup' ).draggable({
                opacity: 0.35,
                containment: '#page-wrapper',
                cancel: 'pre, input, textarea, span, select',
            });

            $(function () {
                $( '.resizable-se' ).resizable({ handles: 'se' });
                $( '.resizable-s' ).resizable({ handles: 's', minHeight: 200 });
            });
        }

        // TODO: add service's description
        function getHistoryPopUpWidth(){

            if ( getWidth() !== null ) {
                $('.topologyContainer.previewContainer.historyPopUp').css({ 'marginLeft': '-' + (getWidth() / 2 ) + 'px' });
            }

            function getWidth(){
                return $('.topologyContainer.previewContainer.historyPopUp').width();
            }
        }

        // TODO: add service's description
        function triggerWindowResize(timeout) {
            var t = timeout ? timeout : 1;

            setTimeout(function (){
                $(window).trigger('resize');
            }, t);
        }

    }

});
