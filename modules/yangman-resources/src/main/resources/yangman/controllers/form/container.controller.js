define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('ContainerCtrl', ContainerCtrl);

    ContainerCtrl.$inject = ['$scope'];

    function ContainerCtrl($scope){
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

