define([], function() {
    angular.module('app.yangui').controller('augmentationModalCtrl', ['$scope', function($scope){
        $scope.init = function(node){
            $scope.node = node;
        };
    }]);

});
