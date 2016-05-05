define([], function() {
    angular.module('app.yangui').controller('containerCtrl', function ($scope) {
        $scope.augModalView = false;

        $scope.toggleExpandedAugModal = function(){
            $scope.augModalView = !$scope.augModalView;
        };

        $scope.toggleExpanded = function() {
            $scope.node.expanded = !$scope.node.expanded;
        };
    });

});
