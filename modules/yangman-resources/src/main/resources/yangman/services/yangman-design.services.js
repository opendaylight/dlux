define(['app/yangman/yangman.module'], function () {
    'use strict';

    angular.module('app.yangman').service('YangmanDesignService', YangmanDesignService);

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
