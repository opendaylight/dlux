define([], function() {
    angular.module('app.yangui').controller('leafListCtrl', function ($scope) {

        $scope.addListElem = function() {
            $scope.node.addListElem();
        };

        $scope.removeListElem = function(elem){
            $scope.node.removeListElem(elem);
        };

        $scope.changed = function() {
            $scope.preview();
        };

        $scope.toggleExpanded = function() {
            $scope.node.expanded = !$scope.node.expanded;
        };

    });

});
