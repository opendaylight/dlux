define([], function () {
    'use strict';

    function ArrayUtilsService(){
        var arrayUtils = {};

        arrayUtils.getFirstElementByCondition = function(list, condition) {
            var selItems = list && condition ? list.filter(function(item) {
                return condition(item);
            }) : [];
            return (selItems.length ? selItems[0] : null);
        };

        arrayUtils.pushElementsToList = function(list, listToAdd) {
            listToAdd.forEach(function(e) {
                list.push(e);
            });
        };

        return arrayUtils;
    }

    ArrayUtilsService.$inject=[];

    return ArrayUtilsService;

});