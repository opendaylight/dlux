define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMTypeBooleanCtrl', YMTypeBooleanCtrl);

    YMTypeBooleanCtrl.$inject = ['$scope'];

    function YMTypeBooleanCtrl($scope){
        var yangTypeBolean = this;

        $scope.$watch('node.value', function(){
            if ( typeof $scope.node.value !== 'boolean' && $scope.node.value.length) {
                $scope.node.value = $scope.node.value === 'true';
            }
        });
    }
});

