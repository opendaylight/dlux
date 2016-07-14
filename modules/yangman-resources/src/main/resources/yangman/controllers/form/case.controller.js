define([], function () {
    'use strict';

    angular.module('app.yangman').controller('CaseCtrl', CaseCtrl);

    CaseCtrl.$inject = ['$scope'];

    function CaseCtrl($scope){
        var yangCase = this;

        yangCase.empty = ($scope.case.children.length === 0 ||
                        ($scope.case.children.length === 1 && $scope.case.children[0].children.length === 0));

    }
});

