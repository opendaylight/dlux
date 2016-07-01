define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('OutputCtrl', OutputCtrl);

    OutputCtrl.$inject = ['$scope'];

    function OutputCtrl($scope){
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


