define([], function () {
    'use strict';

    angular.module('app.yangman').controller('InputCtrl', InputCtrl);

    InputCtrl.$inject = ['$scope'];

    function InputCtrl($scope){
        var yangInput = this;

        // methods
        yangInput.isActionMenu = isActionMenu;
        yangInput.toggleExpanded = toggleExpanded;

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

