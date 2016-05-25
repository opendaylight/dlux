define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('TypeEnumCtrl', TypeEnumCtrl);

    TypeEnumCtrl.$inject = ['$scope'];

    function TypeEnumCtrl($scope){
        // methods
        $scope.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

            $scope.type.setLeafValue(value);

            if($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        }
    }
});

