define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('RpcCtrl', RpcCtrl);

    RpcCtrl.$inject = ['$scope'];

    function RpcCtrl($scope){
        // methods
        $scope.toggleExpanded = toggleExpanded;

        /**
         * Show hide node
         */
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }
    }
});

