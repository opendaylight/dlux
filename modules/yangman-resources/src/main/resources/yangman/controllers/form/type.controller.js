define([], function () {
    'use strict';

    angular.module('app.yangman').controller('TypeCtrl', TypeCtrl);

    TypeCtrl.$inject = ['$scope'];

    function TypeCtrl($scope){
        var yangType = this;

        // methods
        yangType.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            /*if ($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }*/

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
            $scope.buildRootRequest();
        }
    }
});
