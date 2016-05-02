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

        // TODO: add service's description
        function storeFromScope(variables, scope, key) {
            var data = {};
            key = getKey(key);

            variables.forEach(function (k) {
                if (scope.hasOwnProperty(k)) {
                    data[k] = scope[k];
                } else {
                    console.warn('scope doesn\'t have variable', k);
                }
            });
            service.storedData[key] = data;
        }

        // TODO: add service's description
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
