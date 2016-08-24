define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMTypeEnumCtrl', YMTypeEnumCtrl);

    YMTypeEnumCtrl.$inject = ['$scope'];

    function YMTypeEnumCtrl($scope){
        var yangTypeEnum = this;

        // methods
        yangTypeEnum.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

            $scope.type.setLeafValue(value);
            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
            $scope.buildRootRequest();
        }
    }
});

