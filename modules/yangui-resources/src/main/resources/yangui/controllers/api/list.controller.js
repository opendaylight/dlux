define([], function () {
    'use strict';
    angular.module('app.yangui').controller('ListCtrl', ListCtrl);

    ListCtrl.$inject = ['$scope', 'ListFilteringService', 'NodeWrapperService'];

    // todo: comment the whole controller
    function ListCtrl($scope, ListFilteringService, NodeWrapperService) {

        $scope.actElement = null;
        $scope.augModalView = false;
        $scope.currentDisplayIndex = 1;
        $scope.displayOffsets = [-1, 0, 1];
        $scope.filterListHover = 0;
        $scope.showListFilter = false;
        $scope.showModal = false;

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

        $scope.$on('EV_REFRESH_LIST_INDEX', refreshListIndex);

        $scope.$on('EV_DISABLE_ADDING_LIST_ELEMENT', function() {
            $scope.init();
        });

        /**
         * Disable adding more then one element
         */
        $scope.init = function() {
            $scope.disableAddingListElement = $scope.checkAddingListElement($scope.node);

            if($scope.disableAddingListElement) {
                $scope.addListElem();
            }
        };

        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }

        function refreshListIndex() {
            $scope.currentDisplayIndex = 1;
        }

        function addListElem() {
            $scope.showListFilter = false;
            $scope.showModal = false;
            ListFilteringService.removeEmptyFilters($scope.node);
            $scope.node.addListElem();
        }

        function removeListElem(elemIndex, fromFilter) {
            $scope.node.removeListElem(elemIndex, fromFilter);
            $scope.preview();
            $scope.currentDisplayIndex = Math.max(
                Math.min($scope.currentDisplayIndex, $scope.node.listData.length - 2), 1
            );
        }

        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        function shiftDisplayNext(typeListData) {
            $scope.currentDisplayIndex = Math.min($scope.currentDisplayIndex + 3, $scope.node[typeListData].length - 2);
        }

        function shiftDisplayPrev() {
            $scope.currentDisplayIndex = Math.max($scope.currentDisplayIndex - 3, 1);
        }

        function showPrevButton() {
            return $scope.currentDisplayIndex > 1;
        }

        function showNextButton(typeListData) {
            return $scope.node[typeListData] &&
                // node is selected after view is loaded
                $scope.currentDisplayIndex < $scope.node[typeListData].length - 2;
        }

        function showModalWin() {
            $scope.showModal = !$scope.showModal;
            if ($scope.showListFilter){
                $scope.showListFilter = !$scope.showListFilter;
            }
        }

        function showListFilterWin() {
            $scope.showListFilter = !$scope.showListFilter;
            if ($scope.showModal){
                $scope.showModal = !$scope.showModal;
            }
            ListFilteringService.showListFilterWin($scope.filterRootNode, $scope.node);
        }

        function getFilterData() {
            ListFilteringService.getFilterData($scope.node);
        }

        function switchFilter(showedFilter) {
            ListFilteringService.switchFilter($scope.node, showedFilter);
        }

        function createNewFilter() {
            ListFilteringService.createNewFilter($scope.node);
        }

        function applyFilter() {
            ListFilteringService.applyFilter($scope.node);
            $scope.showListFilter = !$scope.showListFilter;
            $scope.currentDisplayIndex = 1;
            if ($scope.node.filteredListData.length){
                $scope.node.doubleKeyIndexes = NodeWrapperService.checkKeyDuplicity($scope.node.filteredListData, $scope.node.refKey);
                $scope.setStatusMessage('success', 'YANGUI_FILTER_MATCH_SUCCESS', e.message);
            }
            else {
                $scope.node.doubleKeyIndexes = NodeWrapperService.checkKeyDuplicity(
                    $scope.node.listData,
                    $scope.node.refKey
                );
                $scope.setStatusMessage('danger', 'YANGUI_FILTER_MATCH_ERROR', e.message);
            }
        }

        function clearFilterData(changeAct, filterForClear, removeFilters) {
            ListFilteringService.clearFilterData($scope.node, changeAct, filterForClear, removeFilters);
            if (changeAct) {
                $scope.showListFilter = !$scope.showListFilter;
            }
            $scope.node.doubleKeyIndexes = NodeWrapperService.checkKeyDuplicity(
                $scope.node.listData,
                $scope.node.refKey
            );
        }

        function activeFilter(filter) {
            if (filter.active === 1) {
                filter.active = 2;
            }
            else {
                filter.active = 1;
            }
        }

        function getListName(offset, config) {
            var createdListItemName = $scope.node.createListName($scope.currentDisplayIndex + offset);

            if ( createdListItemName.length > 33 ) {
                return {
                    name: createdListItemName.substring(0, 30) + '...',
                    tooltip: createdListItemName,
                };
            } else {
                return {
                    name: config ?
                        createdListItemName || '[' + ($scope.currentDisplayIndex + offset) + ']' :
                        createdListItemName,
                    tooltip: '',
                };
            }
        }

    }

});
