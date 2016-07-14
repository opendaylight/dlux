define([], function () {
    'use strict';

    angular.module('app.yangman').controller('ListCtrl', ListCtrl);

    ListCtrl.$inject = ['$scope', 'ListFilteringService', 'NodeWrapperService'];

    function ListCtrl($scope, ListFilteringService, NodeWrapperService){
        var yangList = this;

        $scope.actElement = null;
        $scope.showListFilter = false;
        $scope.filterListHover = 0;
        yangList.currentDisplayIndex = 1;
        yangList.displayOffsets = [-1, 0, 1];

        // methods
        $scope.activeFilter = activeFilter;
        $scope.applyFilter = applyFilter;
        $scope.clearFilterData = clearFilterData;
        $scope.createNewFilter = createNewFilter;
        $scope.getFilterData = getFilterData;
        yangList.getListName = getListName;
        yangList.removeListElem = removeListElem;
        yangList.shiftDisplayNext = shiftDisplayNext;
        yangList.shiftDisplayPrev = shiftDisplayPrev;
        $scope.showListFilterWin = showListFilterWin;
        $scope.showModalWin = showModalWin;
        yangList.showNextButton = showNextButton;
        yangList.showPrevButton = showPrevButton;
        $scope.switchFilter = switchFilter;
        yangList.toggleExpanded = toggleExpanded;
        yangList.addListElem = addListElem;
        yangList.isActionMenu = isActionMenu;
        yangList.isNodeInfo = isNodeInfo;


        /**
         * Add element into list
         */
        function addListElem() {
            $scope.showListFilter = false;
            $scope.showModal = false;
            ListFilteringService.removeEmptyFilters($scope.node);
            $scope.node.addListElem();
        }

        // TODO :: do method description
        function removeListElem(elemIndex, fromFilter) {
            $scope.node.removeListElem(elemIndex, fromFilter);
            // $scope.preview();
            yangList.currentDisplayIndex =
                Math.max(Math.min(yangList.currentDisplayIndex, $scope.node.listData.length - 2), 1);
        }

        // TODO :: do method description
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        // TODO :: do method description
        function shiftDisplayNext(typeListData) {
            yangList.currentDisplayIndex = Math.min(yangList.currentDisplayIndex + 3, $scope.node[typeListData].length - 2);
        }

        // TODO :: do method description
        function shiftDisplayPrev() {
            yangList.currentDisplayIndex = Math.max(yangList.currentDisplayIndex - 3, 1);
        }

        // TODO :: do method description
        function showPrevButton() {
            return yangList.currentDisplayIndex > 1;
        }

        // TODO :: do method description
        function showNextButton(typeListData) {
            // node is selected after view is loaded
            return $scope.node[typeListData] && yangList.currentDisplayIndex < $scope.node[typeListData].length - 2;
        }

        // TODO :: do method description
        function showModalWin() {
            $scope.showModal = !$scope.showModal;
            if ($scope.showListFilter){
                $scope.showListFilter = !$scope.showListFilter;
            }
        }

        // TODO :: do method description
        function showListFilterWin() {
            $scope.showListFilter = !$scope.showListFilter;
            if ($scope.showModal){
                $scope.showModal = !$scope.showModal;
            }
            ListFilteringService.showListFilterWin($scope.filterRootNode,$scope.node);
        }

        // TODO :: do method description
        function getFilterData() {
            ListFilteringService.getFilterData($scope.node);
        }

        // TODO :: do method description
        function switchFilter(showedFilter) {
            ListFilteringService.switchFilter($scope.node, showedFilter);
        }

        // TODO :: do method description
        function createNewFilter() {
            ListFilteringService.createNewFilter($scope.node);
        }

        // TODO :: do method description
        function applyFilter() {
            ListFilteringService.applyFilter($scope.node);
            $scope.showListFilter = !$scope.showListFilter;
            yangList.currentDisplayIndex = 1;
            if ($scope.node.filteredListData.length){
                $scope.node.doubleKeyIndexes =
                    NodeWrapperService.checkKeyDuplicity($scope.node.filteredListData, $scope.node.refKey);
            } else {
                $scope.node.doubleKeyIndexes =
                    NodeWrapperService.checkKeyDuplicity($scope.node.listData, $scope.node.refKey);
            }
        }

        // TODO :: do method description
        function clearFilterData(changeAct, filterForClear, removeFilters) {
            ListFilteringService.clearFilterData($scope.node, changeAct, filterForClear, removeFilters);
            if (changeAct){
                $scope.showListFilter = !$scope.showListFilter;
            }
            $scope.node.doubleKeyIndexes =
                NodeWrapperService.checkKeyDuplicity($scope.node.listData, $scope.node.refKey);
        }

        // TODO :: do method description
        function activeFilter(filter) {
            if (filter.active === 1){
                filter.active = 2;
            } else {
                filter.active = 1;
            }
        }

        // TODO :: do method description
        function getListName(offset, config) {
            var createdListItemName = $scope.node.createListName(yangList.currentDisplayIndex + offset);

            if ( createdListItemName.length > 33 ) {
                return {
                    name: createdListItemName.substring(0, 30) + '...',
                    tooltip: createdListItemName,
                };
            } else {
                return {
                    name: config ? createdListItemName || '[' + (yangList.currentDisplayIndex + offset) + ']' : createdListItemName,
                    tooltip: '',
                };
            }
        }

        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return true;
        }

        /**
         * Show hide node info
         * @returns {*}
         */
        function isNodeInfo(){
            return $scope.node.augmentationId;
        }

        // WATCHERS
        $scope.$on('EV_REFRESH_LIST_INDEX', function () {
            yangList.currentDisplayIndex = 1;
        });
    }
});

