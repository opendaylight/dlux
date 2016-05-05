define([], function() {
    angular.module('app.yangui').controller('filterTypeBitCtrl', function($scope){

        $scope.valueChanged = function(){
            $scope.type.setLeafValue($scope.type.bitsValues,true);

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        };
    });

});
