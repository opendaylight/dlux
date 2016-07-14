define([], function () {
    'use strict';

    angular.module('app.yangman').controller('TypeBitCtrl', TypeBitCtrl);

    TypeBitCtrl.$inject = ['$scope'];

    function TypeBitCtrl($scope){
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

