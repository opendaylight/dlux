define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMTypeEmptyCtrl', YMTypeEmptyCtrl);

    YMTypeEmptyCtrl.$inject = ['$scope'];

    function YMTypeEmptyCtrl($scope){
        var yangTypeEmpty = this;
        // methods
        yangTypeEmpty.valueChanged = valueChanged;

        /**
         * Methods for checking correct input
         */
        function valueChanged(){
            $scope.buildRootRequest();
        }
    }
});


