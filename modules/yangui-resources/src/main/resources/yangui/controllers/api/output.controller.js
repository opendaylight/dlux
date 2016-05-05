define([], function() {
    angular.module('app.yangui').controller('outputCtrl', function ($scope) {
        $scope.augModalView = false;
        $scope.notEditable = true;

        $scope.toggleExpandedAugModal = function(){
            $scope.augModalView = !$scope.augModalView;
        };

        $scope.toggleExpanded = function() {
            $scope.node.expanded = !$scope.node.expanded;
        };
    });

});
