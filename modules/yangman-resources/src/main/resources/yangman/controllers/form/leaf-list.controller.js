define([], function() {
    angular.module('app.yangui').controller('LeafListCtrl', function ($scope) {



    });

});

define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('LeafListCtrl', LeafListCtrl);

    LeafListCtrl.$inject = ['$scope'];

    function LeafListCtrl($scope){
        // methods
        $scope.addListElem = addListElem;
        $scope.changed = changed;
        $scope.removeListElem = removeListElem;
        $scope.toggleExpanded = toggleExpanded;


        // TODO :: do method description
        function addListElem() {
            $scope.node.addListElem();
        }

        // TODO :: do method description
        function removeListElem(elem){
            $scope.node.removeListElem(elem);
        }

        // TODO :: do method description
        function changed() {
            $scope.preview();
        }

        // TODO :: do method description
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }
    }
});

