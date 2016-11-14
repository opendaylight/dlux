define([
    'app/yangman/models/history-settings.model',
],
    function (HistorySettingsModel) {
        'use strict';

        angular.module('app.yangman').service('HistorySettingsService', HistorySettingsService);

        HistorySettingsService.$inject = ['ParsingJsonService'];

        /**
         * Service for history settings, used for creating HistorySettingsModel and dependency injection
         * @param ParsingJsonService
         * @returns {{}}
         * @constructor
         */
        function HistorySettingsService(ParsingJsonService){

            var service = {};

            service.createHistorySettings = createHistorySettings;

            return service;

            /**
             * Service for creating settings object
             * @param name used as name in local storage
             * @returns {*}
             */
            function createHistorySettings(){
                var result = new HistorySettingsModel(ParsingJsonService, service);
                return result;
            }



        }

    });
