define([], function() {
    angular.module('app.yangui').controller('typeBitCtrl', function($scope){

        $scope.valueChanged = function(){
            $scope.type.setLeafValue($scope.type.bitsValues);

            if($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }

            $scope.node.checkValueType();
            $scope.node.fill($scope.node.label, $scope.node.value);
        };

    });

});
