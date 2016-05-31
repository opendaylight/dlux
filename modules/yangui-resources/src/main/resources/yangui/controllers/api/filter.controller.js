define([], function () {
    'use strict';
    angular.module('app.yangui').controller('FilterCtrl', FilterCtrl);

    FilterCtrl.$inject = ['$scope', 'ListFilteringService'];

    // todo: comment the whole controller
    function FilterCtrl($scope, ListFilteringService){

        $scope.isFilter = true;

        $scope.getFilterTypeArray = getFilterTypeArray;

        function getFilterTypeArray(type){
            return ListFilteringService.getFilterTypeArray(type);
        }
    }

});
