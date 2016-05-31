define([], function (){
    'use strict';
    angular.module('app.yangui').controller('CaseCtrl', CaseCtrl);

    CaseCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function CaseCtrl($scope) {

        $scope.augModalView = false;
        $scope.empty = (
            $scope.case.children.length === 0 ||
            (
                $scope.case.children.length === 1 &&
                $scope.case.children[0].children.length === 0
            )
        );

        $scope.toggleExpandedAugModal = toggleExpandedAugModal;

        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }
    }

});
