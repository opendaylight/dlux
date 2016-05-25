define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('TypeBitCtrl', TypeBitCtrl);

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

            //if ($scope.previewVisible) {
            //    $scope.preview();
            //} else {
            //    $scope.buildRoot();
            //}

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
            $scope.buildRootRequest();
        }
    }
});

