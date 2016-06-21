define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.service('YangmanDesignService', YangmanDesignService);

    function YangmanDesignService(){

        var service = {
            hideMainMenu: hideMainMenu,
            setDraggableLeftPanel: setDraggableLeftPanel,
            setModuleDetailHeight: setModuleDetailHeight,
        };

        return service;

        /**
         * Hide main menu
         */
        function hideMainMenu(){
            $('#wrapper').addClass('toggled');
        }

        /**
         * Sets Draggable Left Side
         * #left-panel
         */
        function setDraggableLeftPanel(){
            if (localStorage.getItem('yangman__left-panel-width') !== null) {
                $('#left-panel').width(localStorage.getItem('yangman__left-panel-width'));
            }

            $('.resizable-e').resizable({
                handles: 'e',
                minWidth: 300,
                stop: function(event, ui) {
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem('yangman__left-panel-width', ui.size.width);
                    }
                },
                resize: function() {
                    setModuleDetailHeight();
                }
            });
        }

        /**
         * Set module detail height
         * .yangmanModule__module-detail .tabs
         */
        function setModuleDetailHeight() {
            var height = 'calc(100% - ' + $('.yangmanModule__module-detail h4').outerHeight(true) + 'px)';
            $('.yangmanModule__module-detail .tabs').css({ height: height });
        }
        
    }
});
