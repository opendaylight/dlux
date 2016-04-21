define([], function() {
    angular.module('app.yangui').controller('filterTypeCtrl', function($scope){

        $scope.valueChanged = function(){
            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        };

    });

});
