define([], function (){
    'use strict';
    angular.module('app.yangui').controller('ChoiceCtrl', ChoiceCtrl);

    ChoiceCtrl.$inject = ['$scope', 'constants'];

    // todo: comment the whole controller
    function ChoiceCtrl($scope, constants) {

        $scope.augModalView = false;
        $scope.constants = constants;

        $scope.caseShowing = caseShowing;
        $scope.toggleExpanded = toggleExpanded;
        $scope.toggleExpandedAugModal = toggleExpandedAugModal;


        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }

        function toggleExpanded(){
            $scope.node.expanded = !$scope.node.expanded;
        }

        function caseShowing(node) {
            return !node.augmentationId ?
                true :
                $scope.augmentations.getAugmentation(node.parent, node.augmentationId).expanded;
        }
    }

});
