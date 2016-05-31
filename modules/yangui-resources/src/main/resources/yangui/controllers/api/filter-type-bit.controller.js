define([], function () {
    'use strict';
    angular.module('app.yangui').controller('FilterTypeBitCtrl', FilterTypeBitCtrl);

    FilterTypeBitCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function FilterTypeBitCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            $scope.type.setLeafValue($scope.type.bitsValues, true);
            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        }
    }

});
