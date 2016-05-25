define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('CaseCtrl', CaseCtrl);

    CaseCtrl.$inject = ['$scope'];

    function CaseCtrl($scope){

        $scope.augModalView = false;
        $scope.empty = ($scope.case.children.length === 0 ||
                        ($scope.case.children.length === 1 && $scope.case.children[0].children.length === 0));

        // methods
        $scope.toggleExpandedAugModal = toggleExpandedAugModal;

        /**
         * Show hide augment modal box
         */
        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }
    }
});

