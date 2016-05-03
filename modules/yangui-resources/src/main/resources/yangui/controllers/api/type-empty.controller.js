define([], function () {
    'use strict';
    angular.module('app.yangui').controller('TypeEmptyCtrl', TypeEmptyCtrl);

    TypeEmptyCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function TypeEmptyCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            $scope.type.setLeafValue($scope.type.emptyValue);

            if ($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }
        }

    }

});
