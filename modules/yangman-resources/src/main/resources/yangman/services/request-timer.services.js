define([], function () {
    'use strict';

    angular.module('app.yangman').service('RequestTimerService', RequestTimerService);

    RequestTimerService.$inject = [];

    function RequestTimerService(){
        var service = {
                setStartTime: setStartTime,
                returnTime: returnTime,
            },
            timeStarted = 0;
        return service;

        function setStartTime(){
            timeStarted = new Date().getTime();
        }

        function returnTime(){
            return new Date().getTime() - timeStarted;
        }
    }

});
