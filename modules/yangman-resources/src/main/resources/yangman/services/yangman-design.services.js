define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.service('YangmanDesignService', YangmanDesignService);

    function YangmanDesignService(){

        var service = {
            hideMainMenu: hideMainMenu,
        };

        return service;

        /**
         * Hide main menu
         */
        function hideMainMenu(){
            $('#wrapper').addClass('toggled');
        }
    }
});
