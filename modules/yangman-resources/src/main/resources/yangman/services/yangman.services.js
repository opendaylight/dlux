define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.service('YangmanService', function (){

        var service = {
            hideMainMenu: hideMainMenu,
        };

        return service;

        function hideMainMenu(){
            $('#wrapper').addClass('toggled');
        }
    });

});
