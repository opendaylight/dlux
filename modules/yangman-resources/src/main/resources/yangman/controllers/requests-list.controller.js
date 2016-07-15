define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/save-req-dialog.controller',
    'app/yangman/controllers/edit-collection-dialog.controller',
], function (yangman, SaveReqDialogCtrl, EditCollectionDialogCtrl) {
    'use strict';

    yangman.register.controller('RequestsListCtrl', RequestsListCtrl);

    RequestsListCtrl.$inject = [
        '$filter', '$mdDialog', '$scope', 'HandleFileService', 'PathUtilsService', 'RequestsService', 'YangmanService',
        'YangmanDesignService',
    ];

    /**
     * Controller for requests lists, means History requests and Collections requests
     * @param $filter
     * @param $mdDialog
     * @param $scope
     * @param HandleFileService
     * @param PathUtilsService
     * @param RequestsService
     * @param YangmanService
     * @param YangmanDesignService
     * @constructor
     */
    function RequestsListCtrl($filter, $mdDialog, $scope, HandleFileService, PathUtilsService, RequestsService,
                              YangmanService, YangmanDesignService) {
        var vm = this;

        /**
         * List of all collections containing requests, loads even for history controller to use collection names
         * in saving requests dialog
         * @type {*|CollectionList}
         */
        vm.collectionList = null;

        /**
         *
         * @type {*|HistoryList}
         */
        vm.requestList = null;
        vm.mainList = null;
        vm.collectionsSortAsc = true;
        vm.search = '';

        // methods
        vm.clearCollectionList = clearCollectionList;
        vm.clearFilter = clearFilter;
        vm.clearHistoryList = clearHistoryList;
        vm.colMatchingReqsCount = colMatchingReqsCount;
        vm.deselectAllRequests = deselectAllRequests;
        vm.downloadCollection = downloadCollection;
        vm.executeRequest = executeRequest;
        vm.fakeFilter = fakeFilter;
        vm.filterCol = filterCol;
        vm.filterColName = filterColName;
        vm.filterReq = filterReq;
        vm.init = init;
        vm.readCollectionFromFile = readCollectionFromFile;
        vm.selectAllRequests = selectAllRequests;
        vm.selectRequest = selectRequest;
        vm.showData = showData;
        vm.showDgDeleteCollection = showDgDeleteCollection;
        vm.showDgDeleteRequests = showDgDeleteRequests;
        vm.showDgEditCollection = showDgEditCollection;
        vm.showDgSaveReq = showDgSaveReq;
        vm.showForm = showForm;
        vm.toggleCollectionsSort = toggleCollectionsSort;




        /**
         * Save request obje to collection from other controller
         * @param reqObj
         */
        function saveRequestFromExt(event, args) {
            vm.showDgSaveReq(args.params.event, args.params.reqObj, false);
        }


        /**
         * Clear history requests list and save to storage
         */
        function clearHistoryList(event) {

            YangmanDesignService.disableMdMenuItem(event);

            var confirm = $mdDialog.confirm()
                .title($filter('translate')('YANGMAN_DELETE_HISTORY_CONFIRM_TITLE'))
                .textContent($filter('translate')('YANGMAN_DELETE_HISTORY_CONFIRM_TEXT'))
                .ariaLabel($filter('translate')('YANGMAN_DELETE_HISTORY_CONFIRM_TITLE'))
                .targetEvent(event)
                .ok($filter('translate')('YANGMAN_OK'))
                .cancel($filter('translate')('YANGMAN_CANCEL'));

            $mdDialog.show(confirm).then(function (){
                vm.requestList.clear();
                vm.requestList.saveToStorage();
                loadHistoryList();
                YangmanDesignService.enableMdMenuItem(event);
            }, function (){
                YangmanDesignService.enableMdMenuItem(event);
            });
        }

        /**
         * Clear collections requests list and save to storage
         */
        function clearCollectionList(event) {
            var confirm = $mdDialog.confirm()
                .title($filter('translate')('YANGMAN_DELETE_COLLECTION_CONFIRM_TITLE'))
                .textContent($filter('translate')('YANGMAN_DELETE_COLLECTION_CONFIRM_TEXT'))
                .ariaLabel($filter('translate')('YANGMAN_DELETE_COLLECTION_CONFIRM_TITLE'))
                .targetEvent(event)
                .ok($filter('translate')('YANGMAN_OK'))
                .cancel($filter('translate')('YANGMAN_CANCEL'));

            YangmanDesignService.disableMdMenuItem(event);

            $mdDialog.show(confirm).then(function (){
                vm.collectionList.clear();
                vm.collectionList.saveToStorage();
                $scope.rootBroadcast('YANGMAN_REFRESH_COLLECTIONS');
                YangmanDesignService.enableMdMenuItem(event);
            }, function () {
                YangmanDesignService.enableMdMenuItem(event);
            });
        }

        /**
         * Create history request from other ctrl
         * @param broadcastEvent
         * @param params
         */
        function saveBcstedHistoryRequest(broadcastEvent, params) {
            vm.requestList.addRequestToList(params.params);
            vm.requestList.saveToStorage();
            loadHistoryList();
            (params.cbk || angular.noop)();
        }

        /**
         * Clear value of input file used to import collection
         * todo: move to design utils
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
                checkArray = ['sentData', 'receivedData', 'path', 'collection', 'method', 'status', 'name'];

            if (data && YangmanService.validateFile(data, checkArray)){
                try {
                    vm.collectionList.loadListFromFile(data);
                    vm.collectionList.saveToStorage();
                    $scope.rootBroadcast('YANGMAN_REFRESH_COLLECTIONS');
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

            $scope.rootBroadcast('YANGMAN_SET_ERROR_DATA',
                reqObj.receivedData && reqObj.receivedData.hasOwnProperty('errors') ? reqObj.receivedData : {});

            $scope.rootBroadcast('YANGMAN_FILL_NODE_FROM_REQ', { requestUrl: reqObj.path, requestData: data },
                function (){
                    $scope.setRightPanelSection('form');
                    $scope.rootBroadcast('YANGMAN_HEADER_INIT', {
                        path: reqObj.path,
                        method: reqObj.method,
                        statusObj: {
                            status: reqObj.responseStatus,
                            statusText: reqObj.responseStatusText,
                            time: reqObj.responseTime,
                        },
                    });

                    if ( $scope.node ) {
                        // prepare data for filling form
                        data = $scope.node.type === 'rpc' ?
                                YangmanService.prepareReceivedData(
                                    $scope.node,
                                    reqObj.method,
                                    reqObj.receivedData,
                                    reqObj.sentData,
                                    'form'
                                ) : data;

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
            showData(reqObj);
            $scope.rootBroadcast('YANGMAN_EXECUTE_WITH_DATA',{ data: reqObj.sentData });
        }

        /**
         * Method for setup data into CM, Header, find api, subapi, node
         * @param reqObj
         * @param status
         */
        function showData(reqObj, select){
            var headerObj = {
                path: reqObj.path,
                method: reqObj.method,
            };

            // action select request
            if ( select ) {
                headerObj.statusObj = {
                    status: reqObj.responseStatus,
                    statusText: reqObj.responseStatusText,
                    time: reqObj.responseTime,
                };

                $scope.rootBroadcast(
                    'YANGMAN_SET_ERROR_DATA',
                    reqObj.receivedData && reqObj.receivedData.hasOwnProperty('errors') ? reqObj.receivedData : {}
                );
            }

            $scope.setRightPanelSection('req-data');
            $scope.setJsonView(true, reqObj.method !== 'GET');

            $scope.rootBroadcast('YANGMAN_HEADER_INIT', headerObj);
            $scope.rootBroadcast('YANGMAN_FILL_NODE_FROM_REQ', { requestUrl: reqObj.path });

            $scope.rootBroadcast(
                'YANGMAN_SET_CODEMIRROR_DATA_RECEIVED',
                { data: reqObj.setDataForView(reqObj.receivedData) }
            );

            $scope.rootBroadcast(
                'YANGMAN_SET_CODEMIRROR_DATA_SENT',
                { data: reqObj.setDataForView(reqObj.sentData) }
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
         * @param event
         * @param reqObj
         */
        function showDgDeleteRequests(event, reqObj){

            var confirm = $mdDialog.confirm()
                .title($filter('translate')('YANGMAN_DELETE_REQ_CONFIRM_TITLE'))
                .textContent($filter('translate')('YANGMAN_DELETE_REQ_CONFIRM_TEXT'))
                .ariaLabel($filter('translate')('YANGMAN_DELETE_REQ_CONFIRM_TITLE'))
                .targetEvent(event)
                .ok($filter('translate')('YANGMAN_OK'))
                .cancel($filter('translate')('YANGMAN_CANCEL'));

            YangmanDesignService.disableMdMenuItem(event);

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

                if (vm.mainList === vm.requestList) {
                    loadHistoryList();
                }
                else {
                    refreshCollectionsWithExpansion();
                }
            }, function (){
                YangmanDesignService.enableMdMenuItem(event);
            });
        }


        /**
         * Dialog for deleting collection and refreshing collections
         * @param ev
         * @param collObj
         */
        function showDgDeleteCollection(ev, collObj){
            var confirm = $mdDialog.confirm()
                .title($filter('translate')('YANGMAN_DELETE_COL_CONFIRM_TITLE') + ' ' + collObj.name + '?')
                .textContent($filter('translate')('YANGMAN_DELETE_COL_CONFIRM_TEXT'))
                .ariaLabel($filter('translate')('YANGMAN_DELETE_COL_CONFIRM_TITLE'))
                .targetEvent(ev)
                .ok($filter('translate')('YANGMAN_OK'))
                .cancel($filter('translate')('YANGMAN_CANCEL'));

            YangmanDesignService.disableMdMenuItem(ev);

            $mdDialog.show(confirm).then(function (){
                vm.collectionList.deleteCollection(collObj);
                vm.collectionList.saveToStorage();
                refreshCollectionsWithExpansion();
            }, function (){
                YangmanDesignService.enableMdMenuItem(ev);
            });
        }

        /**
         * Check if reqObj matches current search value
         * @param reqObj
         * @returns {boolean}
         */
        function filterReq(reqObj){
            return reqObj.path.toLowerCase().indexOf(vm.search.toLowerCase()) > -1;
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
            return colObj.name.toLowerCase().indexOf(vm.search.toLowerCase()) > -1;
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
                refreshCollectionsWithExpansion();
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
            refreshCollectionsWithExpansion();
        }

        /**
         * Create collection duplicate, save and refresh collections
         * @param {array} names 0. element is old name, 1. element is new name
         */
        function duplicateCollection(names){
            vm.collectionList.duplicateCollection(names[0], names[1]);
            vm.collectionList.saveToStorage();
            refreshCollectionsWithExpansion();
        }


        function selectNewestRequest() {
            vm.mainList.toggleReqSelection(true, vm.mainList.getNewestRequest());
        }

        function loadCollectionsList() {
            vm.collectionList.loadListFromStorage();
        }

        function loadHistoryList() {
            vm.requestList.loadListFromStorage();
        }

        /**
         *
         * @param mainList collectionList or requestList object
         */
        function init(mainList){

            vm.collectionList = RequestsService.createEmptyCollectionList('yangman_collectionsList');
            // collections are loaded for both history and collections tab
            loadCollectionsList();

            vm.requestList = RequestsService.createEmptyHistoryList('yangman_requestsList');

            $scope.$on('YANGMAN_REFRESH_COLLECTIONS', loadCollectionsList);

            // list type dependend operations
            if (mainList === 'history') {

                vm.mainList = vm.requestList;
                loadHistoryList();

                $scope.$on('YANGMAN_REFRESH_HISTORY', loadHistoryList);
                // saving from request header after execution
                $scope.$on('YANGMAN_SAVE_EXECUTED_REQUEST', saveBcstedHistoryRequest);
                // saving from request header
                $scope.$on('YANGMAN_SAVE_REQUEST_TO_COLLECTION', saveRequestFromExt);
                // select newest request
                $scope.$on('YANGMAN_SELECT_THE_NEWEST_REQUEST', selectNewestRequest);
            }
            else {
                vm.mainList = vm.collectionList;

                // saving collections expanded status on refresh
                $scope.$on('YANGMAN_REFRESH_AND_EXPAND_COLLECTIONS', function(event, params){
                    $scope.rootBroadcast('YANGMAN_REFRESH_COLLECTIONS');
                    (params.cbk || angular.noop)();
                });
            }



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
            if (!event.ctrlKey){
                vm.showData(requestObj, true);
            }
        }

        /**
         * Deselect history requests
         */
        function deselectAllRequests(){
            vm.mainList.deselectReqs();
        }

        /**
         * Select history requests
         */
        function selectAllRequests(){
            deselectAllRequests();
            vm.mainList.dateGroups.forEach(function (group){
                vm.mainList.selectReqs(group.requests);
            });
        }

        /**
         * Refresh and expand collections
         */
        function refreshCollectionsWithExpansion(){
            var expandedCollNames = vm.collectionList.getExpandedCollectionNames();
            $scope.rootBroadcast('YANGMAN_REFRESH_AND_EXPAND_COLLECTIONS', null, function (){
                vm.collectionList.expandCollectionByNames(expandedCollNames);
            });
        }

    }

});
