define([], function () {
    'use strict';
    angular.module('app.yangui').controller('LeafListCtrl', LeafListCtrl);

    LeafListCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function LeafListCtrl($scope) {

        $scope.addListElem = addListElem;
        $scope.changed = changed;
        $scope.removeListElem = removeListElem;
        $scope.toggleExpanded = toggleExpanded;

        function addListElem() {
            $scope.node.addListElem();
        }

        function removeListElem(elem){
            $scope.node.removeListElem(elem);
        }

        function changed() {
            $scope.preview();
        }

        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

    }

});
