define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('AugmentationModalCtrl', AugmentationModalCtrl);

    AugmentationModalCtrl.$inject = ['$scope'];

    function AugmentationModalCtrl($scope){
        $scope.init = init;

        /**
         * Initialization
         * @param node
         */
        function init(node){
            $scope.node = node;
        }
    }
});
