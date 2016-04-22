define([], function () {
    'use strict';

    function DataBackupService(){
        var bck = {};

        bck.storedData = {};

        var getKey = function(key) {
            return key || 'DEFAULT';
        };

        bck.storeFromScope = function(variables, scope, key) {
            var data = {};
            key = getKey(key);

            variables.forEach(function(k) {
                if(scope.hasOwnProperty(k)) {
                    data[k] = scope[k];
                } else {
                    console.warn('scope doesn\'t have variable',k);
                }
            });
            bck.storedData[key] = data;
        };

        bck.getToScope = function(variables, scope, key) {
            var data = {};

            key = getKey(key);
            if(bck.storedData.hasOwnProperty(key)) {
                data = bck.storedData[key];

                variables.forEach(function(k) {
                    if(data.hasOwnProperty(k)) {
                        scope[k] = data[k];
                    } else {
                        console.warn('storet data doesn\'t have variable',k);
                    }
                });
            }
        };

        return bck;
    }

    DataBackupService.$inject=[];

    return DataBackupService;

});