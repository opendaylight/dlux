define(['app/yangman/yangman.module'], function () {
    'use strict';

    angular.module('app.yangman').service('YangmanService', function (){

        var service = {
            hideMainMenu: hideMainMenu,
        };

        return service;

        function hideMainMenu(){
            $('#wrapper').addClass('toggled');
        }
    });

});
