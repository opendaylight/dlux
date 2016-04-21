define([], function() {
    angular.module('app.yangui').controller('typeCtrl', function($scope){

        $scope.valueChanged = function(){
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
