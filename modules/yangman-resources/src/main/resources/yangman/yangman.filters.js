define([], function () {
    'use strict';

    angular.module('app.yangman').filter('ymOnlyConfigElem', YmOnlyConfigElemFilter);

    YmOnlyConfigElemFilter.$inject = ['NodeUtilsService'];

    function YmOnlyConfigElemFilter(NodeUtilsService){
        return function (nodes){
            if (nodes.length) {
                nodes = nodes.filter(function (n){
                    return NodeUtilsService.isOnlyOperationalNode(n);
                });
            }

            return nodes;
        };
    }

});
