define([], function () {
    'use strict';

    angular.module('app.yangman').controller('LeafListCtrl', LeafListCtrl);

    LeafListCtrl.$inject = ['$scope'];

    function LeafListCtrl($scope){
        var yangLeafList = this;

        // methods
        yangLeafList.addListElem = addListElem;
        yangLeafList.changed = changed;
        yangLeafList.isActionMenu = isActionMenu;
        yangLeafList.removeListElem = removeListElem;
        yangLeafList.toggleExpanded = toggleExpanded;


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
            //$scope.preview();
            $scope.buildRootRequest();
        }

        // TODO :: do method description
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }


        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return true;
        }
    }
});

