define([], function () {
    'use strict';

    function ArrayUtilsService(){
        var service = {
            getFirstElementByCondition: getFirstElementByCondition,
            pushElementsToList: pushElementsToList,
        };

        return service;

        // TODO: add service's description
        function getFirstElementByCondition(list, condition) {
            var selItems = list && condition ? list.filter(function (item) {
                return condition(item);
            }) : [];
            return (selItems.length ? selItems[0] : null);
        }

        // TODO: add service's description
        function pushElementsToList(list, listToAdd) {
            Array.prototype.push.apply(list, listToAdd);
        }

    }

    ArrayUtilsService.$inject = [];

    return ArrayUtilsService;

});
