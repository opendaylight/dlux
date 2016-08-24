define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMTypeBitCtrl', YMTypeBitCtrl);

    YMTypeBitCtrl.$inject = ['$scope'];

    function YMTypeBitCtrl($scope){
        var yangTypeBit = this;

        // methods
        yangTypeBit.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            $scope.type.setLeafValue($scope.type.bitsValues);
            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
            $scope.buildRootRequest();
        }
    }
});

