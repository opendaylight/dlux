define([], function () {
    'use strict';
    angular.module('app.yangui').controller('FilterTypeEmptyCtrl', FilterTypeEmptyCtrl);

    FilterTypeEmptyCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function FilterTypeEmptyCtrl($scope){
        $scope.valueChanged = valueChanged;

        function valueChanged(){
            $scope.type.setLeafValue($scope.type.emptyValue);
        }

    }

});
