define([], function () {
    'use strict';

    function NodeUtilsService(){
        var nu = {};

        nu.isRootNode = function (type) {
            return type === 'container' || type === 'list' || type === 'rpc';
        };

        nu.isOnlyOperationalNode = function (node) {
            return node.hasOwnProperty('isConfigStm') ? node.isConfigStm !== false : true;
        };

        return nu;
    }

    NodeUtilsService.$inject=[];

    return NodeUtilsService;

});