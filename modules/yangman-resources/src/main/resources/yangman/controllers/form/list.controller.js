define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('ListCtrl', ListCtrl);

    ListCtrl.$inject = ['$scope', 'ListFilteringService', 'NodeWrapperService'];

    function ListCtrl($scope, ListFilteringService, NodeWrapperService){
        $scope.actElement = null;
        $scope.showModal = false;
        $scope.showListFilter = false;
        $scope.filterListHover = 0;
        $scope.currentDisplayIndex = 1;
        $scope.displayOffsets = [-1, 0, 1];
        $scope.augModalView = false;

        // methods
        $scope.activeFilter = activeFilter;
        $scope.addListElem = addListElem;
        $scope.applyFilter = applyFilter;
        $scope.clearFilterData = clearFilterData;
        $scope.createNewFilter = createNewFilter;
        $scope.getFilterData = getFilterData;
        $scope.getListName = getListName;
        $scope.removeListElem = removeListElem;
        $scope.shiftDisplayNext = shiftDisplayNext;
        $scope.shiftDisplayPrev = shiftDisplayPrev;
        $scope.showListFilterWin = showListFilterWin;
        $scope.showModalWin = showModalWin;
        $scope.showNextButton = showNextButton;
        $scope.showPrevButton = showPrevButton;
        $scope.switchFilter = switchFilter;
        $scope.toggleExpanded = toggleExpanded;
        $scope.toggleExpandedAugModal = toggleExpandedAugModal;


        // TODO :: do method description
        function addListElem() {
            $scope.showListFilter = false;
            $scope.showModal = false;
            ListFilteringService.removeEmptyFilters($scope.node);
            $scope.node.addListElem();
        }

        // TODO :: do method description
        function removeListElem(elemIndex, fromFilter) {
            $scope.node.removeListElem(elemIndex, fromFilter);
            $scope.preview();
            $scope.currentDisplayIndex =
                Math.max(Math.min($scope.currentDisplayIndex, $scope.node.listData.length - 2), 1);
        }

        // TODO :: do method description
        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }

        // TODO :: do method description
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        // TODO :: do method description
        function shiftDisplayNext(typeListData) {
            $scope.currentDisplayIndex = Math.min($scope.currentDisplayIndex + 3, $scope.node[typeListData].length - 2);
        }

        // TODO :: do method description
        function shiftDisplayPrev() {
            $scope.currentDisplayIndex = Math.max($scope.currentDisplayIndex - 3, 1);
        }

        // TODO :: do method description
        function showPrevButton() {
            return $scope.currentDisplayIndex > 1;
        }

        // TODO :: do method description
        function showNextButton(typeListData) {
            // node is selected after view is loaded
            return $scope.node[typeListData] && $scope.currentDisplayIndex < $scope.node[typeListData].length - 2;
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
            $scope.currentDisplayIndex = 1;
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
            var createdListItemName = $scope.node.createListName($scope.currentDisplayIndex + offset);

            if ( createdListItemName.length > 33 ) {
                return {
                    name: createdListItemName.substring(0, 30) + '...',
                    tooltip: createdListItemName,
                };
            } else {
                return {
                    name: config ? createdListItemName || '[' + ($scope.currentDisplayIndex + offset) + ']' : createdListItemName,
                    tooltip: '',
                };
            }
        }

        // WATCHERS
        $scope.$on('EV_REFRESH_LIST_INDEX', function () {
            $scope.currentDisplayIndex = 1;
        });
    }
});

