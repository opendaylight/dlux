define([], function () {
    'use strict';
    angular.module('app.yangui').controller('AugmentationModalCtrl', AugmentationModalCtrl);

    AugmentationModalCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function AugmentationModalCtrl($scope){
        $scope.init = init;

        function init(node){
            $scope.node = node;
        }
    }

});
