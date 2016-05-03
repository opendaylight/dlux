define([], function () {
    'use strict';
    angular.module('app.yangui').controller('TypeBitCtrl', TypeBitCtrl);

    TypeBitCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function TypeBitCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            $scope.type.setLeafValue($scope.type.bitsValues);

            if ($scope.previewVisible) {
                $scope.preview();
            }
            else {
                $scope.buildRoot();
            }

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        }

    }

});
