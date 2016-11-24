define([
    'app/yangman/controllers/save-req-dialog.controller',
    'app/yangman/controllers/edit-collection-dialog.controller',
    'app/yangman/controllers/history-settings.controller',
    'app/yangman/services/handle-file.services',
], function (SaveReqDialogCtrl, EditCollectionDialogCtrl, HistorySettingsCtrl) {
    'use strict';

    angular.module('app.yangman').controller('RequestsListCtrl', RequestsListCtrl);

    RequestsListCtrl.$inject = [
        '$filter', '$mdDialog', '$scope', 'YMHandleFileService', 'PathUtilsService', 'RequestsService', 'YangmanService',
        'YangmanDesignService', 'constants',
    ];

    /**
     * Controller for requests lists, means History requests and Collections requests
     * @param $filter
     * @param $mdDialog
     * @param $scope
     * @param YMHandleFileService
     * @param PathUtilsService
     * @param RequestsService
     * @param YangmanService
     * @param YangmanDesignService
     * @constructor
     */
    function RequestsListCtrl($filter, $mdDialog, $scope, YMHandleFileService, PathUtilsService, RequestsService,
                              YangmanService, YangmanDesignService, constants) {
        var vm = this;

        vm.collectionList = null;
        vm.constants = constants;

        vm.requestList = null;
        vm.mainList = null;
        vm.collectionsSortAsc = true;
        vm.search = '';

        vm.clearCollectionList = clearCollectionList;
        vm.clearFilter = clearFilter;
        vm.clearHistoryList = clearHistoryList;
        vm.colMatchingReqsCount = colMatchingReqsCount;
        vm.deselectAllFilteredRequests = deselectAllFilteredReqs;
        vm.downloadCollection = downloadCollection;
        vm.executeRequest = executeRequest;
        vm.fakeFilter = fakeFilter;
        vm.filterCol = filterCol;
        vm.filterColName = filterColName;
        vm.filterReq = filterReq;
        vm.init = init;
        vm.readCollectionFromFile = readCollectionFromFile;
        vm.selectAllFilteredRequests = selectAllFilteredReqs;
        vm.selectRequest = selectRequest;
        vm.showData = showData;
        vm.showDgDeleteCollection = showDgDeleteCollection;
        vm.showDgDeleteRequests = showDgDeleteRequests;
        vm.showDgEditCollection = showDgEditCollection;
        vm.showDgSaveReq = showDgSaveReq;
        vm.showHistorySettings = showHistorySettings;
        vm.showForm = showForm;
        vm.toggleCollectionsSort = toggleCollectionsSort;
        vm.selectOnlyThisRequest = selectOnlyThisRequest;
        vm.deselectAllRequests = deselectAllRequests;
        vm.filterCollReq = filterCollReq;

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

            $mdDialog.show(confirm)
            .then(function (){
                vm.requestList.clear();
                vm.requestList.saveToStorage();
                loadHistoryList();
            })
            .then(YangmanDesignService.enableMdMenuItem(event));
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

            $mdDialog.show(confirm)
            .then(function (){
                vm.collectionList.clear();
                vm.collectionList.saveToStorage();
                $scope.rootBroadcast(constants.YANGMAN_REFRESH_COLLECTIONS);
            })
            .then(YangmanDesignService.enableMdMenuItem(event));
        }

        /**
         * Create history request from other ctrl
         * @param broadcastEvent
         * @param params
         */
        function saveBcstedHistoryRequest(broadcastEvent, params) {
            vm.requestList.addItemToList(params.params);
            vm.requestList.saveToStorage();
            (params.cbk || angular.noop)();
        }

        /**
         * Clear value of input file used to import collection
         */
        function clearFileInputValue(){
            angular.element(document).find('#importCollection').val('');
        }

        /**
         * Importing collection from a file
         * @param $fileContent
         */
        function readCollectionFromFile($fileContent) {
            var data = $fileContent;

            if (data && YangmanService.validateFile(data, constants.COLLECTION_CHECK_ARRAY)){
                try {
                    vm.collectionList.loadListFromFile(data);
                    vm.collectionList.saveToStorage();
                    $scope.rootBroadcast(constants.YANGMAN_REFRESH_COLLECTIONS);
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
            removeButtonBackground();

            function removeButtonBackground() {
                $('#importCollection').next().css({ 'background': 'transparent' });
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

            var cListJSON = vm.collectionList.getCollectionInRawJSON(collection.name);

            YMHandleFileService.downloadFile(collection.name + '.json', cListJSON, 'json', 'charset=utf-8',
                function (){},
                function (e){
                    console.error('ExportCollection error:', e);
                }
            );
        }

        /**
         * Fill request form in right panel with request data
         * @param reqObj
         * @param preventFillingWithReceived
         */
        function showForm(reqObj, preventFillingWithReceived) {
            var data = reqObj.sentData;

            if ($scope.historySettings.data.fillWithReceived && !preventFillingWithReceived) {
                data = reqObj.receivedData;
            }

            $scope.rootBroadcast(
                constants.YANGMAN_SET_CODEMIRROR_DATA_RECEIVED, { data: reqObj.setDataForView(reqObj.receivedData) }
            );
            $scope.rootBroadcast(
                constants.YANGMAN_SET_CODEMIRROR_DATA_SENT, { data: reqObj.setDataForView(reqObj.sentData) }
            );

            $scope.rootBroadcast(constants.YANGMAN_SET_ERROR_DATA,
                reqObj.receivedData && reqObj.receivedData.hasOwnProperty('errors') ? reqObj.receivedData : {});

            $scope.rootBroadcast(constants.YANGMAN_FILL_NODE_FROM_REQ, { requestUrl: reqObj.path, requestData: data },
                function (){
                    $scope.setRightPanelSection(constants.DISPLAY_TYPE_FORM);
                    $scope.rootBroadcast(constants.YANGMAN_HEADER_INIT, {
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
                        if ($scope.node.type === constants.NODE_RPC && $scope.historySettings.data.fillWithReceived) {
                            data = YangmanService.prepareReceivedData(
                                $scope.node,
                                reqObj.method,
                                reqObj.receivedData,
                                reqObj.sentData,
                                constants.DISPLAY_TYPE_FORM
                            );
                        }

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
                showForm(reqObj, true);
            showData(reqObj);
            $scope.rootBroadcast(constants.YANGMAN_EXECUTE_WITH_DATA,{ data: reqObj.sentData });
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
                    constants.YANGMAN_SET_ERROR_DATA,
                    reqObj.receivedData && reqObj.receivedData.hasOwnProperty('errors') ? reqObj.receivedData : {}
                );
            }

            $scope.setRightPanelSection(constants.DISPLAY_TYPE_REQ_DATA);
            $scope.setJsonView(true, reqObj.method !== constants.OPERATION_GET);

            $scope.rootBroadcast(constants.YANGMAN_HEADER_INIT, headerObj);
            $scope.rootBroadcast(constants.YANGMAN_FILL_NODE_FROM_REQ, { requestUrl: reqObj.path });

            $scope.rootBroadcast(
                constants.YANGMAN_SET_CODEMIRROR_DATA_RECEIVED,
                { data: reqObj.setDataForView(reqObj.receivedData) }
            );

            $scope.rootBroadcast(
                constants.YANGMAN_SET_CODEMIRROR_DATA_SENT,
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

            $mdDialog.show(confirm)
            .then(function (){
                    deleteRequestsAndReload(reqObj);
            })
            .then(YangmanDesignService.enableMdMenuItem(event));
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

            $mdDialog.show(confirm)
            .then(function (){
                vm.collectionList.deleteCollection(collObj);
                vm.collectionList.saveToStorage();
                refreshCollectionsWithExpansion();
            })
            .then(YangmanDesignService.enableMdMenuItem(ev));
        }

        /**
         * Check if reqObj matches current search value
         * @param reqObj
         * @returns {boolean}
         */
        function filterReq(reqObj){
            var searchPhrase = vm.search.toLocaleLowerCase();
            return reqObj.path.toLowerCase().indexOf(searchPhrase) > -1 ||
                reqObj.collection.toLowerCase().indexOf(searchPhrase) > -1 ||
                reqObj.method.toLowerCase() === searchPhrase;
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
                    requests: reqObj ? [reqObj] : vm.mainList.getSelectedItems(
                        vm.mainList === vm.collectionList ? filterCollReq : filterReq
                    ),
                    collectionNames: vm.collectionList.getCollectionNames(),
                    duplicate: duplicate || false,
                },
            }).then(saveRequests);
        }

        /**
         * Show popup window for history requests settings
         * @param ev
         */
        function showHistorySettings(ev){

            $mdDialog.show({
                controller: HistorySettingsCtrl,
                controllerAs: 'settingsCtrl',
                templateUrl: $scope.globalViewPath + 'leftpanel/history-settings.tpl.html',
                parent: angular.element('#yangmanModule'),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    settingsObj: $scope.historySettings,
                },
            }).then(function (changedSettings){
                $scope.historySettings.setData(changedSettings.data);
                $scope.rootBroadcast(constants.YANGMAN_RESET_HISTORY_SETTINGS);
            });
        }

        /**
         * Add each request from requests array to collectionList and save
         * @param requests
         */
        function saveRequests(requests){
            requests.forEach(function (reqObj){
                vm.collectionList.addItemToList(RequestsService.clearUnnecessaryProperties(reqObj.clone()));
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

            vm.requestList = RequestsService.createEmptyHistoryList('yangman_requestsList', $scope.historySettings);

            $scope.$on(constants.YANGMAN_RESET_HISTORY_SETTINGS, function () {
                vm.requestList.setSettings($scope.historySettings);
            });

            // if request was selected, deselect requests in all other instances of RequestsListCtrl
            $scope.$on(constants.YANGMAN_DESELECT_REQUESTS, function (event, params) {
                if (params.params.broadcastingCtrl !== vm) {
                    deselectAllRequests();
                }
            });

            $scope.$on(constants.YANGMAN_REFRESH_COLLECTIONS, function (event, params){
                loadCollectionsList();
                (params.cbk || angular.noop)();
            });

            // list type dependend operations
            if (mainList === 'history') {

                vm.mainList = vm.requestList;
                loadHistoryList();

                $scope.$on(constants.YANGMAN_REFRESH_HISTORY, loadHistoryList);
                // saving from request header after execution
                $scope.$on(constants.YANGMAN_SAVE_EXECUTED_REQUEST, saveBcstedHistoryRequest);
                // select newest request
                $scope.$on(constants.YANGMAN_SELECT_THE_NEWEST_REQUEST, selectNewestRequest);
            }
            else {
                vm.mainList = vm.collectionList;
                // saving from request header
                $scope.$on(constants.YANGMAN_SAVE_REQUEST_TO_COLLECTION, saveRequestFromExt);
                // saving collections expanded status on refresh
                $scope.$on(constants.YANGMAN_REFRESH_AND_EXPAND_COLLECTIONS, function(){
                    var expandedColNames = vm.collectionList.getExpandedCollectionNames();
                    $scope.rootBroadcast(constants.YANGMAN_REFRESH_COLLECTIONS, {}, function (){
                        vm.collectionList.expandCollectionByNames(expandedColNames);
                    });
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
            console.debug('selected', requestObj);

            $scope.rootBroadcast(constants.YANGMAN_DESELECT_REQUESTS, { broadcastingCtrl: vm });
            vm.mainList.toggleReqSelection(!event.ctrlKey, requestObj);
            if (!event.ctrlKey){
                if ($scope.rightPanelSection === constants.DISPLAY_TYPE_FORM) {
                    vm.showForm(requestObj);
                }
                else {
                    vm.showData(requestObj, true);
                }
            }
        }

        /**
         * Mark only requestObj in current list as selected
         * Used for example when user clicks on request submenu
         * @param requestObj
         */
        function selectOnlyThisRequest(requestObj){
            vm.mainList.toggleReqSelection(true, requestObj);
        }

        /**
         * Deselect history requests
         */
        function deselectAllFilteredReqs(){
            vm.mainList.deselectAllFilteredItems(vm.mainList === vm.collectionList ? filterCollReq : vm.filterReq);
        }

        function deselectAllRequests() {
            vm.mainList.deselectAllItems();
        }

        /**
         * Select history requests
         */
        function selectAllFilteredReqs(){
            vm.mainList.selectAllFilteredItems(vm.mainList === vm.collectionList ? filterCollReq : vm.filterReq);
        }

        /**
         * Use when selecting filtered requests if they are saved to some collection
         * Additional filter is if the collection of the request is expanded
         * @param request
         * @returns {*|boolean}
         */
        function filterCollReq(request) {
            return vm.collectionList.getCollection(request.collection).expanded && vm.filterReq(request);
        }

        /**
         * Refresh and expand collections
         */
        function refreshCollectionsWithExpansion(){
            $scope.rootBroadcast(constants.YANGMAN_REFRESH_AND_EXPAND_COLLECTIONS);
        }

        function deleteRequestsAndReload(reqObj) {
            if (reqObj){
                vm.mainList.deleteRequestItem(reqObj);
            }
            else {
                vm.mainList.getSelectedItems(
                    vm.mainList === vm.collectionList ? filterCollReq : filterReq
                ).forEach(function (elem){
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
        }
    }

});
