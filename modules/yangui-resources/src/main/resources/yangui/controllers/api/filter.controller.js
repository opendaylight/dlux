define([], function() {
    angular.module('app.yangui').controller('filter', function($scope, ListFilteringService){
        $scope.isFilter = true;

        $scope.getFilterTypeArray = function(type){
            return ListFilteringService.getFilterTypeArray(type);
        };
    });

});
