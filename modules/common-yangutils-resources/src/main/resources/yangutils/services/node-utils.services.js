define([], function () {
    'use strict';

    function NodeUtilsService(){

        var service = {
            isRootNode: isRootNode,
            isOnlyOperationalNode: isOnlyOperationalNode,
        };

        return service;

        // TODO: add service's description
        function isRootNode(type) {
            return type === 'container' || type === 'list' || type === 'rpc';
        }

        // TODO: add service's description
        function isOnlyOperationalNode(node) {
            return node.hasOwnProperty('isConfigStm') ? node.isConfigStm !== false : true;
        }
    }

    NodeUtilsService.$inject = [];

    return NodeUtilsService;

});
