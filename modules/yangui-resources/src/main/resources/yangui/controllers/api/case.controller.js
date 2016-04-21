define([], function() {
    angular.module('app.yangui').controller('caseCtrl', function ($scope) {
        $scope.empty = ($scope.case.children.length === 0 || ($scope.case.children.length === 1 && $scope.case.children[0].children.length ===0));

        $scope.augModalView = false;

        $scope.toggleExpandedAugModal = function(){
            $scope.augModalView = !$scope.augModalView;
        };
    });

});
