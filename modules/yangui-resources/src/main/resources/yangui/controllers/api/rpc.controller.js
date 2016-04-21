define([], function() {
    angular.module('app.yangui').controller('rpcCtrl', function ($scope) {
        $scope.toggleExpanded = function() {
            $scope.node.expanded = !$scope.node.expanded;
        };
    });

});
