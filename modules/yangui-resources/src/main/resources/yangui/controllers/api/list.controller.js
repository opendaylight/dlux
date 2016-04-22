define([], function() {
    angular.module('app.yangui').controller('listCtrl', function ($scope, ListFilteringService, NodeWrapperService) {
        $scope.actElement = null;
        $scope.showModal = false;
        $scope.showListFilter = false;
        $scope.filterListHover = 0;
        $scope.currentDisplayIndex = 1;
        $scope.displayOffsets = [-1, 0, 1];
        $scope.augModalView = false;

        $scope.toggleExpandedAugModal = function(){
            $scope.augModalView = !$scope.augModalView;
        };

        $scope.$on('EV_REFRESH_LIST_INDEX', function(event) {
            $scope.currentDisplayIndex = 1;
        });

        $scope.addListElem = function() {
            $scope.showListFilter = false;
            $scope.showModal = false;
            ListFilteringService.removeEmptyFilters($scope.node);
            $scope.node.addListElem();
        };

        $scope.removeListElem = function(elemIndex,fromFilter) {
            $scope.node.removeListElem(elemIndex,fromFilter);
            $scope.preview();
            $scope.currentDisplayIndex = Math.max(Math.min($scope.currentDisplayIndex, $scope.node.listData.length - 2), 1);
        };

        $scope.toggleExpanded = function() {
            $scope.node.expanded = !$scope.node.expanded;
        };

        $scope.shiftDisplayNext = function(typeListData) {
            $scope.currentDisplayIndex = Math.min($scope.currentDisplayIndex + 3, $scope.node[typeListData].length - 2);
        };

        $scope.shiftDisplayPrev = function() {
            $scope.currentDisplayIndex = Math.max($scope.currentDisplayIndex - 3, 1);
        };

        $scope.showPrevButton = function() {
            return $scope.currentDisplayIndex > 1;
        };

        $scope.showNextButton = function(typeListData) {
            return $scope.node[typeListData] && $scope.currentDisplayIndex < $scope.node[typeListData].length - 2; //node is selected after view is loaded
        };

        $scope.showModalWin = function() {
            $scope.showModal = !$scope.showModal;
            if($scope.showListFilter){
                $scope.showListFilter = !$scope.showListFilter;
            }
        };

        $scope.showListFilterWin = function() {
            $scope.showListFilter = !$scope.showListFilter;
            if($scope.showModal){
                $scope.showModal = !$scope.showModal;
            }
            ListFilteringService.showListFilterWin($scope.filterRootNode,$scope.node);
        };

        $scope.getFilterData = function() {
            ListFilteringService.getFilterData($scope.node);
        };

        $scope.switchFilter = function(showedFilter) {
            ListFilteringService.switchFilter($scope.node,showedFilter);
        };

        $scope.createNewFilter = function() {
            ListFilteringService.createNewFilter($scope.node);
        };

        $scope.applyFilter = function() {
            ListFilteringService.applyFilter($scope.node);
            $scope.showListFilter = !$scope.showListFilter;
            $scope.currentDisplayIndex = 1;
            if($scope.node.filteredListData.length){
                $scope.node.doubleKeyIndexes = NodeWrapperService.checkKeyDuplicity($scope.node.filteredListData,$scope.node.refKey);
            }else{
                $scope.node.doubleKeyIndexes = NodeWrapperService.checkKeyDuplicity($scope.node.listData,$scope.node.refKey);
            }
        };

        $scope.clearFilterData = function(changeAct, filterForClear, removeFilters) {
            ListFilteringService.clearFilterData($scope.node,changeAct,filterForClear,removeFilters);
            if(changeAct){
                $scope.showListFilter = !$scope.showListFilter;
            }
            $scope.node.doubleKeyIndexes = NodeWrapperService.checkKeyDuplicity($scope.node.listData,$scope.node.refKey);
        };

        $scope.activeFilter = function(filter) {
            if(filter.active == 1){
                filter.active = 2;
            }else{
                filter.active = 1;
            }
        };

        $scope.getListName = function(offset, config) {
            var createdListItemName = $scope.node.createListName($scope.currentDisplayIndex + offset);

            if ( createdListItemName.length > 33 ) {
                return {
                    name: createdListItemName.substring(0,30) + '...',
                    tooltip: createdListItemName
                };
            } else {
                return {
                    name: config ? createdListItemName || '[' + ($scope.currentDisplayIndex + offset) + ']' : createdListItemName,
                    tooltip: ''
                };
            }
        };

    });

});
