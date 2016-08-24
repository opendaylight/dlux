define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMTypeCtrl', YMTypeCtrl);

    YMTypeCtrl.$inject = ['$scope'];

    function YMTypeCtrl($scope){
        var yangType = this;

        // methods
        yangType.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
            $scope.buildRootRequest();
        }
    }
});
