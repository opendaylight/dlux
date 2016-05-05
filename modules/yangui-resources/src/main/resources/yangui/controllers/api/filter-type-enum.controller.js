define([], function() {
    angular.module('app.yangui').controller('filterTypeEnumCtrl', function($scope){

        $scope.valueChanged = function(){
            var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

            $scope.type.setLeafValue(value);

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        };

    });

});
