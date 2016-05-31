define([], function () {
    'use strict';
    angular.module('app.yangui').controller('TypeEnumCtrl', TypeEnumCtrl);

    TypeEnumCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function TypeEnumCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

            $scope.type.setLeafValue(value);

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
