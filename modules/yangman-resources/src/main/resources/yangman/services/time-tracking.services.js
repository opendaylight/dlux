define([], function () {
    'use strict';

    angular.module('app.yangman').service('TimeTrackingService', TimeTrackingService);

    function TimeTrackingService(){
        var service = {
                startTimer: startTimer,
                returnTime: returnTime,
            },
            timeStarted = 0;
        return service;

        function startTimer(){
            timeStarted = new Date().getTime();
        }

        function returnTime(){
            return new Date().getTime() - timeStarted;
        }
    }

});
