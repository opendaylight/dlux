define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('OutputCtrl', OutputCtrl);

    OutputCtrl.$inject = ['$scope'];

    function OutputCtrl($scope){
        $scope.augModalView = false;
        $scope.notEditable = true;

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


