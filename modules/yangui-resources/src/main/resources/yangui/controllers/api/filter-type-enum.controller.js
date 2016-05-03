define([], function () {
    'use strict';
    // todo: seems to be not used, check
    angular.module('app.yangui').controller('FilterTypeEnumCtrl', FilterTypeEnumCtrl);

    FilterTypeEnumCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function FilterTypeEnumCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

            $scope.type.setLeafValue(value);

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        }

    }

});
