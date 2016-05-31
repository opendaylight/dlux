define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('ChoiceCtrl', ChoiceCtrl);

    ChoiceCtrl.$inject = ['$scope', 'constants'];

    function ChoiceCtrl($scope, constants){
        var yangChoice = this;

        $scope.constants = constants;

        // methods
        yangChoice.isActionMenu = isActionMenu;
        yangChoice.isNodeInfo = isNodeInfo;
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
            return $scope.node.getChildren('description', null, null, 'label').length > 0 ||
                ($scope.node.augmentionGroups && $scope.node.augmentionGroups.length);
        }

        /**
         * Show hide node info
         * @returns {*}
         */
        function isNodeInfo(){
            return $scope.node.augmentationId;
        }
    }
});

