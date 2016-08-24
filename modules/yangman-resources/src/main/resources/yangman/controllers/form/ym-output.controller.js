define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMOutputCtrl', YMOutputCtrl);

    YMOutputCtrl.$inject = ['$scope'];

    function YMOutputCtrl($scope){
        var yangOutput = this;
        yangOutput.notEditable = true;

        // methods
        yangOutput.isActionMenu = isActionMenu;
        yangOutput.toggleExpanded = toggleExpanded;

        /**
         * Show hide node
         */
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return $scope.node.augmentionGroups && $scope.node.augmentionGroups.length;
        }
    }
});


