define([], function () {
    'use strict';
    angular.module('app.yangui').controller('InputCtrl', InputCtrl);

    InputCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function InputCtrl($scope) {

        $scope.augModalView = false;

        $scope.toggleExpanded = toggleExpanded;
        $scope.toggleExpandedAugModal = toggleExpandedAugModal;

        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }

        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }
    }

});
