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
            var data = transformPropData(propData),
                name = propName;

            obj[name] = data;
        }

        // TODO: add service's description
        function resultToString(obj) {
            return JSON.stringify(obj, null, 4);
        }

        // TODO: add function's description
        function transformPropData(data) {
            // return data || {};
            return data;
        }
    }

    RequestBuilderService.$inject = [];

    return RequestBuilderService;

});
