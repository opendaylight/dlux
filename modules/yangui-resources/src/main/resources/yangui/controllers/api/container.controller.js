define([], function () {
    'use strict';
    angular.module('app.yangui').controller('ContainerCtrl', ContainerCtrl);

    ContainerCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function ContainerCtrl($scope) {

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
