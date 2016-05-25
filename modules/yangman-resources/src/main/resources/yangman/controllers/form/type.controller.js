define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('TypeCtrl', TypeCtrl);

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
        }
    }
});
