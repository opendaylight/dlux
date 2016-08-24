define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMChoiceCtrl', YMChoiceCtrl);

    YMChoiceCtrl.$inject = ['$scope', 'constants'];

    function YMChoiceCtrl($scope, constants){
        var yangChoice = this;

        $scope.constants = constants;

        // methods
        yangChoice.isActionMenu = isActionMenu;
        $scope.caseShowing = caseShowing;
        yangChoice.toggleExpanded = toggleExpanded;

        /**
         * Show hide node
         */
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        // TODO :: do method description
        function caseShowing(node) {
            return !node.augmentationId ? true :
                                    $scope.augmentations.getAugmentation(node.parent, node.augmentationId).expanded;
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

