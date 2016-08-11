define([], function () {
    'use strict';

    angular.module('app.yangman').controller('AugmentationModalCtrl', AugmentationModalCtrl);

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
