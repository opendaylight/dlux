define([], function() {
    angular.module('app.yangui').controller('filterTypeEmptyCtrl', function($scope){
        $scope.valueChanged = function(){
            $scope.type.setLeafValue($scope.type.emptyValue);
        };

    });

});
