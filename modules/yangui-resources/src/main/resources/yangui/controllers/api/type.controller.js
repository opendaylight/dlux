define([], function () {
    'use strict';
    angular.module('app.yangui').controller('TypeCtrl', TypeCtrl);

    TypeCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function TypeCtrl($scope){

        $scope.valueChanged = valueChanged;

        function valueChanged(){
            if ($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        }
    }

});
