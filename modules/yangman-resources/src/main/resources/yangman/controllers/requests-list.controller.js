define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/save-req-dialog.controller',
    'app/yangman/controllers/edit-collection-dialog.controller',
], function (yangman, SaveReqDialogCtrl, EditCollectionDialogCtrl) {
    'use strict';

    yangman.register.controller('RequestsListCtrl', RequestsListCtrl);

    RequestsListCtrl.$inject = [
        '$filter', '$mdDialog', '$scope', 'HandleFileService', 'PathUtilsService', 'RequestsService', 'YangmanService',
    ];

    function RequestsListCtrl($filter, $mdDialog, $scope, HandleFileService, PathUtilsService, RequestsService,
                              YangmanService) {
        var vm = this;

        vm.collectionList = RequestsService.createEmptyCollectionList('yangman_collectionsList');
        vm.collectionsSortAsc = true;
        vm.mainList = null;
        vm.requestList = RequestsService.createEmptyHistoryList('yangman_requestsList');
        vm.search = '';

        vm.clearFilter = clearFilter;
        vm.clearHistoryList = clearHistoryList;
        vm.colMatchingReqsCount = colMatchingReqsCount;
        vm.downloadCollection = downloadCollection;
        vm.executeRequest = executeRequest;
        vm.fakeFilter = fakeFilter;
        vm.filterCol = filterCol;
        vm.filterColName = filterColName;
        vm.filterReq = filterReq;
        vm.init = init;
        vm.loadRequests = loadRequests;
        vm.readCollectionFromFile = readCollectionFromFile;
        vm.selectRequest = selectRequest;
        vm.showData = showData;
        vm.showDgDeleteCollection = showDgDeleteCollection;
        vm.showDgDeleteRequests = showDgDeleteRequests;
        vm.showDgEditCollection = showDgEditCollection;
        vm.showDgSaveReq = showDgSaveReq;
        vm.toggleCollectionsSort = toggleCollectionsSort;
        vm.showForm = showForm;

        $scope.$on('YANGMAN_REFRESH_COLLECTIONS', loadCollectionRequest);
        $scope.$on('YANGMAN_REFRESH_HISTORY', loadHistoryRequests);

        loadRequests();



        /**
         * Clear history requests list and save to storage
         */
        function clearHistoryList() {
            vm.requestList.clear();
            vm.requestList.saveToStorage();
        }

        /**
         * Create history request from other ctrl
         * @param broadcastEvent
         * @param params
         */
        function saveBcstedHistoryRequest(broadcastEvent, params) {
            vm.requestList.addRequestToList(params.params);
            vm.requestList.groupListByDate();
            vm.requestList.saveToStorage();
            loadHistoryRequests();
        }

        /**
         * Clear value of input file used to import collection
         */
        function clearFileInputValue(){
            angular.element(document).find('#importCollection').val('');
        }

        /**
         * Importing collection from a file
         * todo: error handling - msgs for user
         * @param $fileContent
         */
        function readCollectionFromFile($fileContent) {
            var data = $fileContent,
                checkArray = [
                    'sentData',
                    'receivedData',
                    'path',
                    'collection',
                    'parametrizedPath',
                    'method',
                    'status',
                    'name',
                ];

            if (data && RequestsService.validateFile(data, checkArray)){
                try {
                    vm.collectionList.loadListFromFile(data);
                    vm.collectionList.saveToStorage();
                    clearFileInputValue();
                }
                catch (e) {
                    clearFileInputValue();
                    console.error('DataStorage error:', e);
                }
            }
            else {
                clearFileInputValue();
            }
        }

        function toggleCollectionsSort() {
            vm.collectionsSortAsc = !vm.collectionsSortAsc;
        }

        /**
         * Export collection to json file
         * @param {Collection} collection
         */
        function downloadCollection(collection) {

            var cListJSON = vm.collectionList.getCollectionInJSON(collection.name);

            HandleFileService.downloadFile(collection.name + '.json', cListJSON, 'json', 'charset=utf-8',
                function (){},
                function (e){
                    console.error('ExportCollection error:', e);
                }
            );
        }

        /**
         * Fill request form in right panel with request data
         * @param reqObj
         */
        function showForm(reqObj) {
            var data = reqObj.method === 'GET' ? reqObj.receivedData : reqObj.sentData;

            $scope.rootBroadcast('YANGMAN_FILL_NODE_FROM_REQ', { requestUrl: reqObj.path, requestData: data },
                function (){
                    $scope.setRightPanelSection('form');
                    $scope.rootBroadcast('YANGMAN_HEADER_INIT', { path: reqObj.path, method: reqObj.method });

                    if ( $scope.node ) {
                        // try to fill node
                        YangmanService.fillNodeFromResponse($scope.node, data);
                        $scope.node.expanded = true;
                    }

                }
            );

        }

        /**
         * Force request header to execute request with data from reqObj
         * @param reqObj
         */
        function executeRequest(reqObj) {
            $scope.rootBroadcast(
                'YANGMAN_HEADER_INIT',
                { path: reqObj.path, method: reqObj.method },
                function (){
                    $scope.rootBroadcast(
                        'YANGMAN_EXECUTE_WITH_DATA',
                        { data: reqObj.sentData },
                        function (historyReq){
                            showData(historyReq);
                        }
                    );
                }
            );

        }


        /**
         * Show current reqObj json data in right panel section
         * @param reqObj
         * @param dataType
         */
        function showData(reqObj) {

            $scope.setRightPanelSection('req-data');
            $scope.setJsonView(true, reqObj.method !== 'GET');

            $scope.rootBroadcast('YANGMAN_HEADER_INIT', { path: reqObj.path, method: reqObj.method });

            $scope.rootBroadcast(
                'YANGMAN_SET_CODEMIRROR_DATA_SENT',
                { data: reqObj.setDataForView(reqObj.sentData) }
            );
            $scope.rootBroadcast(
                'YANGMAN_SET_CODEMIRROR_DATA_RECEIVED',
                { data: reqObj.setDataForView(reqObj.receivedData) }
            );

            var data = reqObj.method === 'GET' ? reqObj.receivedData : reqObj.sentData;

            $scope.rootBroadcast('YANGMAN_FILL_NODE_FROM_REQ', { requestUrl: reqObj.path, leftpanel: 0},
                function (){
                    if ( $scope.node ) {
                        // try to fill node
                        YangmanService.fillNodeFromResponse($scope.node, data);
                        $scope.node.expanded = true;
                    }

                }
            );
        }

        /**
         * Clear current ctrl search value
         */
        function clearFilter(){
            vm.search = '';
        }

        /**
         * Dialog for deleting either selected requests or reqObj
         *
         * @param ev
         * @param reqObj
         */
        function showDgDeleteRequests(ev, reqObj){
            var confirm = $mdDialog.confirm()
                .title($filter('translate')('YANGMAN_DELETE_REQ_CONFIRM_TITLE'))
                .textContent($filter('translate')('YANGMAN_DELETE_REQ_CONFIRM_TEXT'))
                .ariaLabel($filter('translate')('YANGMAN_DELETE_REQ_CONFIRM_TITLE'))
                .targetEvent(ev)
                .ok($filter('translate')('YANGMAN_OK'))
                .cancel($filter('translate')('YANGMAN_CANCEL'));

            $mdDialog.show(confirm).then(function (){
                if (reqObj){
                    vm.mainList.deleteRequestItem(reqObj);
                }
                else {
                    vm.mainList.selectedRequests.forEach(function (elem){
                        vm.mainList.deleteRequestItem(elem);
                    });
                }
                vm.mainList.saveToStorage();
                $scope.rootBroadcast('YANGMAN_REFRESH_HISTORY');
            });
        }


        /**
         * Dialog for delete collection
         * @param ev
         * @param collObj
         */
        function showDgDeleteCollection(ev, collObj){
            var confirm = $mdDialog.confirm()
                .title($filter('translate')('YANGMAN_DELETE_COL_CONFIRM_TITLE'))
                .textContent($filter('translate')('YANGMAN_DELETE_COL_CONFIRM_TEXT'))
                .ariaLabel($filter('translate')('YANGMAN_DELETE_COL_CONFIRM_TITLE'))
                .targetEvent(ev)
                .ok($filter('translate')('YANGMAN_OK'))
                .cancel($filter('translate')('YANGMAN_CANCEL'));

            $mdDialog.show(confirm).then(function (){
                vm.collectionList.deleteCollection(collObj);
                vm.collectionList.saveToStorage();
                $scope.broadcastFromRoot('YANGMAN_REFRESH_COLLECTIONS');
            });
        }

        /**
         * Check if reqObj matches current search value
         * @param reqObj
         * @returns {boolean}
         */
        function filterReq(reqObj){
            return reqObj.path.indexOf(vm.search) !== -1;
        }

        /**
         * Check if collection name matches current search value or any collection req matches
         * @param colObj
         */
        function filterCol(colObj){
            return filterColName(colObj) || colObj.data.some(filterReq);
        }

        /**
         * Get count of requests matching filter in collection colObj
         * @param colObj
         * @returns {*}
         */
        function colMatchingReqsCount(colObj){
            return colObj.data.filter(vm.filterReq).length;
        }

        /**
         * Check if collection name matches current filter
         * @param colObj
         * @returns {boolean}
         */
        function filterColName(colObj){
            return colObj.name.indexOf(vm.search) !== -1;
        }

        /**
         * Returns true
         * @returns {boolean}
         */
        function fakeFilter(){
            return true;
        }

        /**
         * Show dialog for saving reqObj to collection (used for duplicate req too)
         * @param ev
         * @param reqObj
         * @param duplicate
         */
        function showDgSaveReq(ev, reqObj, duplicate){

            $mdDialog.show({
                controller: SaveReqDialogCtrl,
                controllerAs: 'dialog',
                templateUrl: $scope.globalViewPath + 'leftpanel/save-req-dialog.tpl.html',
                parent: angular.element('#yangmanModule'),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    requests: reqObj ? [reqObj] : vm.requestList.selectedRequests,
                    collectionNames: vm.collectionList.getCollectionNames(),
                    duplicate: duplicate || false,
                },
            }).then(saveRequests);
        }

        /**
         * Add each request from requests array to collectionList and save
         * @param requests
         */
        function saveRequests(requests){
            requests.forEach(function (reqObj){
                vm.collectionList.addRequestToList(reqObj);
                vm.collectionList.saveToStorage();
                $scope.broadcastFromRoot('YANGMAN_REFRESH_COLLECTIONS');
            });
        }


        /**
         * Dialog for editing collection name (used for duplicating collection too)
         * @param ev
         * @param collection
         * @param {boolean} duplicate
         */
        function showDgEditCollection(ev, collection, duplicate){
            $mdDialog.show({
                controller: EditCollectionDialogCtrl,
                controllerAs: 'dialog',
                templateUrl: $scope.globalViewPath + 'leftpanel/edit-collection-dialog.tpl.html',
                parent: angular.element('#yangmanModule'),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    collection: collection,
                    allCollections: vm.collectionList.collections,
                    duplicate: duplicate,
                },
            }).then(duplicate ? duplicateCollection : changeCollectionName);
        }

        /**
         * Rename collection
         * @param {array} names 0. element is old name, 1. element is new name
         */
        function changeCollectionName(names){
            vm.collectionList.renameCollection(names[0], names[1]);
            vm.collectionList.saveToStorage();
            $scope.broadcastFromRoot('YANGMAN_REFRESH_COLLECTIONS');
        }

        /**
         * Create collection duplicate and save
         * @param {array} names 0. element is old name, 1. element is new name
         */
        function duplicateCollection(names){
            vm.collectionList.duplicateCollection(names[0], names[1]);
            vm.collectionList.saveToStorage();
            $scope.broadcastFromRoot('YANGMAN_REFRESH_COLLECTIONS');
        }



        /**
         *
         * @param list collectionList or requestList object
         */
        function init(list){
            vm.mainList = list;

            if (list === vm.requestList){
                $scope.$on('YANGMAN_SAVE_HISTORY_REQUEST', saveBcstedHistoryRequest);
            }

        }

        /**
         * Loading history request and grouping by date
         */
        function loadHistoryRequests(){
            vm.requestList.loadListFromStorage();
            vm.requestList.groupListByDate();
        }

        /**
         * Loading collections
         */
        function loadCollectionRequest(){
            vm.collectionList.loadListFromStorage();
        }

        /**
         * Loading both history and collections reqs
         */
        function loadRequests(){
            loadHistoryRequests();
            loadCollectionRequest();
        }

        /**
         * Request in list selection
         * For history reqs it is possible multiselect, thats why event.ctrlKey is used
         * @param event
         * @param requestObj
         */
        function selectRequest(event, requestObj){
            vm.mainList.toggleReqSelection(!event.ctrlKey, requestObj);
            $scope.setHistoryReqsSelected(vm.requestList.selectedRequests.length > 0);
        }

    }

});
