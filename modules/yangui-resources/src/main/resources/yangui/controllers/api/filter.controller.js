define([], function() {
    angular.module('app.yangui').controller('filter', function($scope, listFiltering){
        $scope.isFilter = true;

        $scope.getFilterTypeArray = function(type){
            return listFiltering.getFilterTypeArray(type);
        };
    });

});
