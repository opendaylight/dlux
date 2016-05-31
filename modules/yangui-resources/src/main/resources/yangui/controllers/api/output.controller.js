define([], function () {
    'use strict';
    angular.module('app.yangui').controller('OutputCtrl', OutputCtrl);

    OutputCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function OutputCtrl($scope) {

        $scope.augModalView = false;
        $scope.notEditable = true;

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
