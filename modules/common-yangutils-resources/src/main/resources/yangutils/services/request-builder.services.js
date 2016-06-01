define([], function () {
    'use strict';

    function RequestBuilderService(){

        var service = {
            createList: createList,
            createObj: createObj,
            insertPropertyToObj: insertPropertyToObj,
            insertObjToList: insertObjToList,
            resultToString: resultToString,
        };

        return service;

        // TODO: add service's description
        function createObj() {
            return {};
        }

        // TODO: add service's description
        function createList() {
            return [];
        }

        // TODO: add service's description
        function insertObjToList(list, obj) {
            list.push(obj);
        }

        // TODO: add service's description
        function insertPropertyToObj(obj, propName, propData) {
            obj[propName] = propData;
        }

        // TODO: add service's description
        function resultToString(obj) {
            return angular.toJson(obj, true);
        }
    }

    RequestBuilderService.$inject = [];

    return RequestBuilderService;

});
