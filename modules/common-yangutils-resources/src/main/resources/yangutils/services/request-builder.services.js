define([], function () {
    'use strict';

    function RequestBuilderService(){
        var transformPropData = function(data) {
            // return data || {};
            return data;
        };

        var builder = {
            createObj: function () {
                return {};
            },
            createList: function () {
                return [];
            },
            insertObjToList: function (list, obj) {
                list.push(obj);
            },
            insertPropertyToObj: function (obj, propName, propData) {
                var data = transformPropData(propData),
                    name = propName;

                obj[name] = data;
            },
            resultToString: function (obj) {
                return JSON.stringify(obj, null, 4);
            }
        };

        return builder;
    }

    RequestBuilderService.$inject=[];

    return RequestBuilderService;

});