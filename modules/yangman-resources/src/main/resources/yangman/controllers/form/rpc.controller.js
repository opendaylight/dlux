define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RpcCtrl', RpcCtrl);

    RpcCtrl.$inject = ['$scope'];

    function RpcCtrl($scope){
        var yangRpc = this;

        // methods
        yangRpc.toggleExpanded = toggleExpanded;
        yangRpc.isActionMenu = isActionMenu;

        /**
         * Show hide node
         */
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return false;
        }

    }
});

