define([], function () {
    'use strict';
    angular.module('app.yangui').controller('FilterTypeCtrl', FilterTypeCtrl);

    FilterTypeCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function FilterTypeCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        }

    }

});
