define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMAugmentationModalCtrl', YMAugmentationModalCtrl);

    YMAugmentationModalCtrl.$inject = ['$scope'];

    function YMAugmentationModalCtrl($scope){
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
