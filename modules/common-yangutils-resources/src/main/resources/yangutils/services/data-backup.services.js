define([], function () {
    'use strict';

    function DataBackupService(){

        var service = {
            getToScope: getToScope,
            storedData: {},
            storeFromScope: storeFromScope,
        };

        return service;

        // TODO: add function's description
        function getKey(key) {
            return key || 'DEFAULT';
        }

        /**
         * Method for storing values from scope
         * @param variables
         * @param scope
         * @param key
         */
        function storeFromScope(variables, scope, key) {
            var data = {};
            key = getKey(key);

            variables.forEach(function (k) {
                data[k] = scope[k];
            });
            service.storedData[key] = data;
        }

        /**
         * Method for putting stored values to scope
         * @param variables
         * @param scope
         * @param key
         */
        function getToScope(variables, scope, key) {
            var data = {};

            key = getKey(key);

            if (service.storedData.hasOwnProperty(key)) {
                data = service.storedData[key];

                variables.forEach(function (k) {
                    if (data.hasOwnProperty(k)) {
                        scope[k] = data[k];
                    } else {
                        console.warn('storet data doesn\'t have variable', k);
                    }
                });
            }
        }
    }

    DataBackupService.$inject = [];

    return DataBackupService;

});
