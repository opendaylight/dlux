define([], function () {
    'use strict';
    angular.module('app.yangui').controller('RpcCtrl', RpcCtrl);

    RpcCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function RpcCtrl($scope) {

        $scope.toggleExpanded = toggleExpanded;

        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }
    }

});
