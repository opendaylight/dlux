define([
    'app/yangman/controllers/params-admin.controller',
    'app/yangman/services/time-tracking.services',
], function (ParamsAdminCtrl) {
    'use strict';

    angular.module('app.yangman').controller('RequestHeaderCtrl', RequestHeaderCtrl);

    RequestHeaderCtrl.$inject = [
        '$timeout', '$mdDialog', '$mdToast', '$scope', '$rootScope', 'ENV', 'YangmanService', 'ParametersService',
        'PathUtilsService', 'RequestsService', '$filter', 'DataBackupService', 'constants', 'TimeTrackingService'
    ];

    function RequestHeaderCtrl($timeout, $mdDialog, $mdToast, $scope, $rootScope, ENV, YangmanService, ParametersService,
                               PathUtilsService, RequestService, $filter, DataBackupService, constants,
                               TimeTrackingService) {
        var requestHeader = this;

        requestHeader.allOperations = [constants.OPERATION_GET, constants.OPERATION_POST, constants.OPERATION_PUT, constants.OPERATION_DELETE];
        requestHeader.constants = constants;
        requestHeader.urlChanged = false;
        requestHeader.executedOperation = null;
        requestHeader.selectedOperationsList = [];
        requestHeader.selectedOperation = null;
        requestHeader.requestUrl = '';
        requestHeader.selectedPluginsButtons = [];
        requestHeader.selectedPlugin = null;
        requestHeader.statusObj = null;
        requestHeader.fillFormWithReceivedData = true;

        // methods
        requestHeader.executeOperation = executeOperation;
        requestHeader.executePluginFunctionality = executePluginFunctionality;
        requestHeader.fillNodeData = fillNodeData;
        requestHeader.changeDataType = changeDataType;
        requestHeader.prepareDataAndExecute = prepareDataAndExecute;
        requestHeader.initMountPoint = initMountPoint;
        requestHeader.setJsonView = setJsonView;
        requestHeader.setRequestUrl = setRequestUrl;
        requestHeader.showParamsAdmin = showParamsAdmin;
        requestHeader.saveRequestToCollection = saveRequestToCollection;
        requestHeader.unsetPluginFunctionality = unsetPluginFunctionality;

        $scope.$on(constants.YANGMAN_CHANGE_TO_JSON, function () {
            sendRequestData($scope.buildRootRequest(), 'SENT');
        });
        /**
         * Set selected operations based on data store
         */
        $scope.$on(constants.SET_SEL_OPERATIONS, function (event, operations, setUrl) {
            setAllowedMethods(operations);

            if ( setUrl ) {
                setRequestUrl();
            }
        });

        /**
         * Watching for changes in shown detail data type (radio button)
         */
        $scope.$on(constants.YANGMAN_HEADER_INIT, function (event, args) {
            init();
            setRequestUrl(args.params.path);
            setRequestMethod(args.params.method);
            setRequestStatus(args.params.statusObj);
            setJsonView();
            (args.cbk || angular.noop)();
        });

        $scope.$on(constants.YANGMAN_FILL_NODE_FROM_REQ, function (event, args) {
            setNodeDataFromRequestData(args.params.requestUrl, args.params.leftpanel);
            (args.cbk || angular.noop)();
        });

        $scope.$on(constants.YANGMAN_EXECUTE_WITH_DATA, function (event, args) {
            executeOperation(args.params.data ? angular.fromJson(args.params.data) : {}, args.cbk);
        });

        init();

        /**
         * Setter for selected operation
         * @param method
         */
        function setRequestMethod(method){
            requestHeader.selectedOperation = method;
        }

        /**
         * Setter for request status
         * @param statusObj
         */
        function setRequestStatus(statusObj){
            requestHeader.statusObj = statusObj;
        }

        /**
         * Show popup for parameters administration
         * @param event
         */
        function showParamsAdmin(event) {
            $mdDialog.show({
                controller: ParamsAdminCtrl,
                controllerAs: 'paramsAdmin',
                templateUrl: $scope.globalViewPath + 'popup/parameters-admin.tpl.html',
                parent: angular.element('#yangmanModule'),
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    parametersList: $scope.parametersList,
                },
            }).then(
                function (){
                    $scope.parametersList.loadListFromStorage();
                },
                function (){
                    $scope.parametersList.loadListFromStorage();
                }
            );
        }

        /**
         * Method for selecting correct json view by selected operation
         */
        function setJsonView(){
            var both = [constants.OPERATION_PUT, constants.OPERATION_POST];

            if ( both.indexOf(requestHeader.selectedOperation) > -1 ){
                $scope.setJsonView(true, true);
            } else {
                $scope.setJsonView(true, false);
            }

            // sendRequestData({}, 'RECEIVED');
        }

        /**
         * Change displayed data type to json or form, after switching set current data to be displayed
         */
        function changeDataType(){
            $scope.switchSection('rightPanelSection', requestHeader.selectedShownDataType);

            if (!$scope.node || requestHeader.urlChanged) {
                requestHeader.setRequestUrl();
                requestHeader.urlChanged = false;
            }

            // if changing to json, fill codemirror data
            if ( requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_REQ_DATA && $scope.node ){
                setJsonView();
                sendRequestData($scope.buildRootRequest(), 'SENT');
            }

            // if changing to form, try to fill node data
            if (requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_FORM) {
                var reqData = {};

                reqData = getDataForForm();
                setNodeDataFromRequestData(requestHeader.requestUrl);

                if ( $scope.node ) {

                    YangmanService.fillNodeFromResponse($scope.node, reqData);
                    $scope.node.expanded = true;
                }
            }
        }

        /**
         * Helper method for building correct json data for form, rpc included
         * @returns {*}
         */
        function getDataForForm(){
            var params = {
                    reqData: null,
                },
                dataTypeFunc = {
                    rpc: function () {
                        var sentData = { reqData: null },
                            allData = { sent: null, received: null };

                        $scope.rootBroadcast(constants.YANGMAN_GET_CODEMIRROR_DATA_RECEIVED, params);
                        $scope.rootBroadcast(constants.YANGMAN_GET_CODEMIRROR_DATA_SENT, sentData);

                        allData.sent = sentData.reqData ? angular.fromJson(sentData.reqData) : {};
                        allData.received = params.reqData ? angular.fromJson(params.reqData) : {};

                        return YangmanService.prepareReceivedData(
                            $scope.node,
                            requestHeader.selectedOperation,
                            allData.received,
                            allData.sent,
                            requestHeader.selectedShownDataType
                        );
                    },
                    default: function (){
                        var dataType;
                        if(requestHeader.executedOperation) {
                            dataType = requestHeader.executedOperation === constants.OPERATION_GET ? constants.REQUEST_DATA_TYPE_RECEIVED : 'SENT';
                        }
                        else {
                            dataType = requestHeader.selectedOperation === constants.OPERATION_GET ? constants.REQUEST_DATA_TYPE_RECEIVED : 'SENT';
                        }

                        $scope.rootBroadcast(constants.YANGMAN_GET_CODEMIRROR_DATA + dataType, params);
                        return params.reqData ? angular.fromJson(params.reqData) : {};
                    },
                };

            return $scope.node ? (dataTypeFunc[$scope.node.type] || dataTypeFunc.default)() : {};
        }

        /**
         * Send data to codemirror
         * @param data
         */
        function sendRequestData(data, type){
            $scope.rootBroadcast(
                constants.YANGMAN_SET_CODEMIRROR_DATA + type,
                { data: data instanceof Object ? JSON.stringify(data, null, 4) : data }
            );
        }

        /**
         * Set error data to be shown in form area
         * @param response
         */
        function sendErrorData(response) {
            $scope.rootBroadcast(constants.YANGMAN_SET_ERROR_DATA, response);
        }

        /**
         * Create empty parameters list, load from local storage and set to $scope
         */
        function initParams(){
            $scope.parametersList.loadListFromStorage();
        }

        /**
         * Initialization
         */
        function init(){
            setAllowedMethods(requestHeader.allOperations);
            initParams();
            requestHeader.selectedShownDataType = $scope.rightPanelSection;
        }

        /**
         * Set allowed operations for request
         * @param operations
         */
        function setAllowedMethods(operations){
            requestHeader.selectedOperationsList = operations.length ? operations : requestHeader.allOperations;
            if (operations.indexOf(requestHeader.selectedOperation) === -1){
                requestHeader.selectedOperation = requestHeader.selectedOperationsList[0];
            }
        }

        /**
         * Set header request url if json selected
         */
        function setRequestUrl(path){
            requestHeader.requestUrl = path || ($scope.selectedSubApi ?
                    ENV.getBaseURL('MD_SAL') + '/restconf/' + $scope.selectedSubApi.buildApiRequestString() : '');
        }


        /**
         * Try to set api, module, dataStore and node, if api indexes for request url available
         * and set (or unset) module detail panel to be displayed
         * @param requestUrl url to try to find
         * @param leftpanel index of main left tabs to be displayed (we dont want to display module detail in all cases)
         */
        function setNodeDataFromRequestData(requestUrl, leftpanel){

            setApiByUrl(requestUrl, function (treeApis) {
                // set module
                $scope.setModule($filter('filter')(treeApis, { label: $scope.selectedApi.module })[0]);

                // set datastore
                $scope.setDataStore(
                    $filter('filter')(
                        $scope.selectedModule.children,
                        { label: $scope.selectedSubApi.storage })[0],
                    true,
                    leftpanel
                );

                // set node
                $scope.setNode($scope.selectedSubApi.node);

                // fill subapi path
                PathUtilsService.fillPath($scope.selectedSubApi.pathArray, requestUrl);
                setRequestUrl();
            });
        }

        /**
         * Try to set current (depending on url) selectedApi and selectedSubApi to $scope if it exists in api tree data
         * @param url
         * @param cbk
         * @param fill
         */
        function setApiByUrl(url, cbk, fill){
            $scope.rootBroadcast(constants.YANGMAN_GET_API_TREE_DATA, null, function (treeApis) {
                var apisIndexes =
                    PathUtilsService.searchNodeByPath(url, treeApis, null, true, true);

                if ( apisIndexes ) {

                    // set apis
                    $scope.setApi(
                        $scope.apis[apisIndexes.indexApi],
                        $scope.apis[apisIndexes.indexApi].subApis[apisIndexes.indexSubApi]
                    );

                    if ( $scope.selectedSubApi && fill ) {
                        var updatedUrl = YangmanService.cutUrl(url);
                        PathUtilsService.fillPath($scope.selectedSubApi.pathArray, updatedUrl);

                    }

                    (cbk || angular.noop)(treeApis);
                }
            });
        }

        function saveRequestToCollection(event) {
            var historyReq = null,
                sentData = { reqData: null },
                receivedData = { reqData: null };

            if (requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_FORM) {
                requestHeader.setRequestUrl();
            }

            historyReq = RequestService.createHistoryRequest(
                null, null, requestHeader.requestUrl, requestHeader.selectedOperation, '', '', ''
            );

            $scope.rootBroadcast(constants.YANGMAN_GET_CODEMIRROR_DATA_SENT, sentData);
            $scope.rootBroadcast(constants.YANGMAN_GET_CODEMIRROR_DATA_RECEIVED, receivedData);

            RequestService.fillRequestByMethod(
                historyReq, sentData, receivedData, requestHeader.selectedOperation, $scope.node,
                requestHeader.selectedShownDataType
            );

            $scope.rootBroadcast(constants.YANGMAN_SAVE_REQUEST_TO_COLLECTION, { event: event, reqObj: historyReq });
        }

        function showRequestProgress(){
            $scope.rootBroadcast(constants.YANGMAN_EXECUTING_REQUEST_PROGRESS_START);
        }


        /**
         * Stop showing progressbar
         * @param message
         */
        function finishRequestProgress (message){
            $scope.rootBroadcast(constants.YANGMAN_EXECUTING_REQUEST_PROGRESS_STOP);
            // $mdToast.show(
            //     $mdToast.simple()
            //         .textContent(message)
            //         .position('bottom right')
            //         .parent(angular.element('.yangmanModule__right-panel__header'))
            //         .hideDelay(1500)
            // );
        }


        /**
         * Execute request operation
         */
        function executeOperation(requestData, executeCbk){
            TimeTrackingService.startTimer();
            var allowExecuteOperation =
                    requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_FORM && $scope.selectedSubApi ?
                        !PathUtilsService.checkEmptyIdentifiers($scope.selectedSubApi.pathArray) : true;


            if ( allowExecuteOperation ) {

                showRequestProgress();
                $scope.rootBroadcast(constants.YANGMAN_SET_ERROR_MESSAGE, '');

                setRequestUrl(
                    requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_REQ_DATA ?
                        requestHeader.requestUrl :
                        null
                );
                if ( requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_REQ_DATA ){
                    setApiByUrl(requestHeader.requestUrl, null, true);
                }

                var historyReq = RequestService.createHistoryRequest(
                    null,
                    null,
                    requestHeader.requestUrl,
                    requestHeader.selectedOperation,
                    '', '', ''
                );

                YangmanService.executeRequestOperation(
                    $scope.selectedApi,
                    $scope.selectedSubApi,
                    requestHeader.selectedOperation,
                    $scope.node,
                    requestHeader.selectedShownDataType,
                    requestHeader.requestUrl,
                    requestData,
                    $scope.parametersList,
                    executeReqSuccCbk,
                    executeReqErrCbk
                );
                requestHeader.executedOperation = requestHeader.selectedOperation;
            } else {
                $scope.rootBroadcast(
                    constants.YANGMAN_SET_ERROR_MESSAGE,
                    $filter('translate')(constants.YANGMAN_ERROR_EMPTY_IDENTIFIERS)
                );
                finishRequestProgress();
            }

            /**
             * Success callback after executin operation
             * @param reqInfo
             * @param response
             */
            function executeReqSuccCbk(reqInfo, response) {

                var preparedReceivedData = {};

                if (requestHeader.fillFormWithReceivedData) {
                    preparedReceivedData = YangmanService.prepareReceivedData(
                        $scope.node,
                        requestHeader.selectedOperation,
                        response.data ? response.data.plain() : {},
                        reqInfo.requestSrcData,
                        requestHeader.selectedShownDataType
                    );
                }

                finishRequestProgress();

                requestHeader.statusObj = reqInfo;

                sendErrorData({});

                if (requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_REQ_DATA){
                    setNodeDataFromRequestData(requestHeader.requestUrl);
                    sendRequestData(preparedReceivedData, constants.REQUEST_DATA_TYPE_RECEIVED);
                    sendRequestData(reqInfo.requestSrcData || {}, 'SENT');
                } else {

                    if ($scope.node && requestHeader.selectedOperation !== constants.OPERATION_DELETE && requestHeader.fillFormWithReceivedData){

                        YangmanService.fillNodeFromResponse($scope.node, preparedReceivedData);
                        YangmanService.handleNodeIdentifier(
                            $scope.parametersList, $scope.selectedSubApi, $scope.node
                        );
                        $scope.node.expanded = true;

                        $scope.rootBroadcast(constants.YANGMAN_DISABLE_ADDING_LIST_ELEMENT);
                        preparedReceivedData = YangmanService.checkRpcReceivedData(preparedReceivedData, $scope.node);
                        sendRequestData(preparedReceivedData, constants.REQUEST_DATA_TYPE_RECEIVED);
                    }
                }

                // create and set history request
                requestHeader.statusObj.time = TimeTrackingService.returnTime();

                historyReq.setExecutionData(
                    reqInfo.requestSrcData,
                    $scope.historySettings.data.saveReceived ? preparedReceivedData : null,
                    $scope.historySettings.data.saveResponseData ? reqInfo.status : '',
                    $scope.historySettings.data.saveResponseData ? reqInfo.status : '',
                    $scope.historySettings.data.saveResponseData ? reqInfo.statusText : '',
                    $scope.historySettings.data.saveResponseData ? requestHeader.statusObj.time : ''
                );

                $scope.rootBroadcast(constants.YANGMAN_SAVE_EXECUTED_REQUEST, historyReq, function (){
                    $scope.rootBroadcast(constants.YANGMAN_SELECT_THE_NEWEST_REQUEST);
                });

                (executeCbk || angular.noop)(historyReq);

            }

            /**
             * Error callback after executin operation
             * @param reqInfo
             * @param response
             */
            function executeReqErrCbk(reqInfo, response) {
                requestHeader.statusObj = reqInfo;

                finishRequestProgress();

                requestHeader.statusObj.time = TimeTrackingService.returnTime();

                historyReq.setExecutionData(
                    reqInfo.requestSrcData,
                    $scope.historySettings.data.saveReceived ? response.data : null,
                    $scope.historySettings.data.saveResponseData ? reqInfo.status : '',
                    $scope.historySettings.data.saveResponseData ? reqInfo.status : '',
                    $scope.historySettings.data.saveResponseData ? reqInfo.statusText : '',
                    $scope.historySettings.data.saveResponseData ? requestHeader.statusObj.time : ''
                );
                $scope.rootBroadcast(constants.YANGMAN_SAVE_EXECUTED_REQUEST, historyReq, function (){
                    $scope.rootBroadcast(constants.YANGMAN_SELECT_THE_NEWEST_REQUEST);
                });

                //setNodeDataFromRequestData(requestHeader.requestUrl);

                if (response.data) {
                    // try to fill code mirror editor
                    sendRequestData(response.data, constants.REQUEST_DATA_TYPE_RECEIVED);
                    sendErrorData(response.data);
                }

                (executeCbk || angular.noop)(historyReq);


            }

        }

        /**
         * TODO :: description
         * @param pathElem
         * @param identifier
         */
        function fillNodeData(pathElem, identifier) {
            if ($scope.selectedSubApi && $scope.selectedSubApi.storage === constants.DATA_STORE_CONFIG &&
                $scope.selectedSubApi.pathArray.indexOf(pathElem) === ($scope.selectedSubApi.pathArray.length - 1)) {
                PathUtilsService.fillListNode($scope.node, identifier.label, identifier.value);
            }

            requestHeader.urlChanged = true;
        }

        /**
         * Check data before executin operations
         */
        function prepareDataAndExecute(cbk){
            if (requestHeader.statusObj) {
                requestHeader.statusObj.statusText = null;
                requestHeader.statusObj.time = null;
            }

            showRequestProgress();

            $timeout(prepareData);

            function prepareData() {
                if ( requestHeader.requestUrl.length ) {
                    if ( requestHeader.selectedShownDataType === constants.DISPLAY_TYPE_REQ_DATA ) {
                        // get json data
                        var params = { reqData: null };
                        $scope.rootBroadcast(constants.YANGMAN_GET_CODEMIRROR_DATA_SENT, params);
                        executeOperation(params.reqData ? angular.fromJson(params.reqData) : {}, cbk);
                    } else {
                        executeOperation({}, cbk);
                    }
                }
            }
        }

        /**
         * Mount point initialization
         * @param mountPointStructure
         * @param mountPointTreeApis
         * @param mountPointApis
         * @param augmentations
         */
        function initMountPoint(mountPointTreeApis, mountPointApis, augmentations, reqObj){
            DataBackupService.storeFromScope(
                [
                    'selectedDatastore', 'node', 'apis',
                    'selectedApi', 'selectedSubApi', 'augmentations', 'selectedModule',
                ],
                $scope,
                'MAIN_SCOPE'
            );

            $scope.rootBroadcast(constants.YANGMAN_GET_API_TREE_DATA, null, function (treeApis) {
                DataBackupService.storeFromScope(
                    ['treeApis'],
                    { treeApis: treeApis },
                    'MODULES_LIST'
                );
            });

            $scope.setNode(null);
            $scope.setModule(null);
            $scope.setGlobalParams(mountPointApis, augmentations);
            $scope.setDataStore(null);
            requestHeader.statusObj = reqObj;
            $scope.rootBroadcast(constants.YANGMAN_SET_API_TREE_DATA, mountPointTreeApis);
        }

        /**
         * Executing custom plugin callback
         * @param customPlugin
         */
        function executePluginFunctionality(customPlugin){
            requestHeader.selectedPlugin = customPlugin;
            customPlugin.runCallback({ scope: $scope, controller: requestHeader });
        }

        /**
         * Unset custom plugin functionality - get back major params from scope
         */
        function unsetPluginFunctionality(){
            if ( requestHeader.selectedPlugin ) {
                $scope.unsetPlugin(requestHeader);
            }

            requestHeader.selectedPlugin = null;
            requestHeader.selectedPluginsButtons = [];
        }

    }

});
