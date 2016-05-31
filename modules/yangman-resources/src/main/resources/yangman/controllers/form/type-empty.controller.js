define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('TypeEmptyCtrl', TypeEmptyCtrl);

    TypeEmptyCtrl.$inject = ['$scope'];

    function TypeEmptyCtrl($scope){
        var yangTypeEmpty = this;
        // methods
        yangTypeEmpty.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            /*$scope.type.setLeafValue($scope.type.emptyValue);

            if ($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }*/

            $scope.buildRootRequest();
        }
    }
});


