define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.service('YangmanService', YangmanService);

    function YangmanService(){
        var service = {
            getDataStoreIndex: getDataStoreIndex,
        };

        return service;

        function getDataStoreIndex(list, dataStore){
            var rIndex = null,
                result = list.some(function (item, index) {
                    rIndex = index;
                    return item.label === dataStore;
                });

            return result ? rIndex : null;
        }
    }

});
