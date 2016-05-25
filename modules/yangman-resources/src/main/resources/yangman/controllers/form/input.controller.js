define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('InputCtrl', InputCtrl);

    InputCtrl.$inject = ['$scope'];

    function InputCtrl($scope){
        $scope.augModalView = false;

        // methods
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
    }
});

