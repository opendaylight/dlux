define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMContainerCtrl', YMContainerCtrl);

    YMContainerCtrl.$inject = ['$scope'];

    function YMContainerCtrl($scope){
        var yangContainer = this;

        // methods
        yangContainer.isActionMenu = isActionMenu;
        yangContainer.toggleExpanded = toggleExpanded;

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

