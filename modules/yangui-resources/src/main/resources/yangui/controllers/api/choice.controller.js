define([], function() {
    angular.module('app.yangui').controller('choiceCtrl', function ($scope, constants) {
        $scope.constants = constants;
        $scope.augModalView = false;


        $scope.toggleExpandedAugModal = function(){
            $scope.augModalView = !$scope.augModalView;
        };

        $scope.toggleExpanded = function() {
            $scope.node.expanded = !$scope.node.expanded;
        };

        $scope.caseShowing = function (node) {
            return !node.augmentationId ? true : $scope.augmentations.getAugmentation(node.parent, node.augmentationId).expanded;
        };
    });

});
