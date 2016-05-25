define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.filter('ymOnlyConfigElem', YmOnlyConfigElemFilter);

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
