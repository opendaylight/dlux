define([], function() {
    angular.module('app.yangui').controller('typeEmptyCtrl', function($scope){
        $scope.valueChanged = function(){
            $scope.type.setLeafValue($scope.type.emptyValue);

            if($scope.previewVisible) {
                $scope.preview();
            } else {
                $scope.buildRoot();
            }
        };

    });

});
