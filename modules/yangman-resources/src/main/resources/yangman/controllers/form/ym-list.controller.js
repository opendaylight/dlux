define([], function () {
    'use strict';

    angular.module('app.yangman').controller('YMListCtrl', YMListCtrl);

    YMListCtrl.$inject = ['$scope', 'ListFilteringService', 'NodeWrapperService', 'constants'];

    function YMListCtrl($scope, ListFilteringService, NodeWrapperService, constants){
        var yangList = this;

        $scope.actElement = null;
        $scope.showListFilter = false;
        $scope.filterListHover = 0;
        yangList.constants = constants;
        yangList.currentDisplayIndex = 1;
        yangList.displayOffsets = [-1, 0, 1];

        // methods
        $scope.activeFilter = activeFilter;
        $scope.applyFilter = applyFilter;
        $scope.clearFilterData = clearFilterData;
        $scope.createNewFilter = createNewFilter;
        $scope.getFilterData = getFilterData;
        $scope.showListFilterWin = showListFilterWin;
        $scope.showModalWin = showModalWin;
        $scope.switchFilter = switchFilter;

        yangList.addListElem = addListElem;
        yangList.getListName = getListName;
        yangList.init = init;
        yangList.isActionMenu = isActionMenu;
        yangList.removeListElem = removeListElem;
        yangList.shiftDisplayNext = shiftDisplayNext;
        yangList.shiftDisplayPrev = shiftDisplayPrev;
        yangList.showNextButton = showNextButton;
        yangList.showPrevButton = showPrevButton;
        yangList.toggleExpanded = toggleExpanded;

        // WATCHERS
        $scope.$on(constants.EV_REFRESH_LIST_INDEX, function () {
            yangList.currentDisplayIndex = 1;
        });

        $scope.$on(constants.YANGMAN_DISABLE_ADDING_LIST_ELEMENT, function() {
            yangList.init();
        });

        /**
         * Disable adding more then one element
         */
        function init() {
            yangList.disableAddingListElement = $scope.checkAddingListElement($scope.node);

            if (yangList.disableAddingListElement &&
                !$scope.node.listData.length &&
                $scope.selectedDatastore.label === constants.DATA_STORE_CONFIG) {

                yangList.addListElem();
            }

            if ($scope.node.listData && !$scope.node.listData.length) {
                yangList.currentDisplayIndex = 1;
            }
        }

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
            if ($scope.node.listData.length === 0) {
                $scope.$broadcast('hideInfoBox');
            }
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
    }
});
