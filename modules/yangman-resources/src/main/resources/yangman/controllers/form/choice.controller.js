define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('ChoiceCtrl', ChoiceCtrl);

    ChoiceCtrl.$inject = ['$scope', 'constants'];

    function ChoiceCtrl($scope, constants){
        $scope.constants = constants;
        $scope.augModalView = false;

        // methods
        $scope.caseShowing = caseShowing;
        $scope.toggleExpanded = toggleExpanded;
        $scope.toggleExpandedAugModal = toggleExpandedAugModal;

        /**
         * Show hide augment modal box
         */
        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }

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
    }
});

