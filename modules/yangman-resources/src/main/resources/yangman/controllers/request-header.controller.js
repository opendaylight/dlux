define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/params-admin.controller',
], function (yangman, ParamsAdminCtrl) {
    'use strict';

    yangman.register.controller('RequestHeaderCtrl', RequestHeaderCtrl);

    RequestHeaderCtrl.$inject = [
        '$mdDialog', '$scope', '$rootScope', 'ENV', 'YangmanService', 'ParametersService', 'PathUtilsService',
        'RequestsService', '$filter', 'DataBackupService',
    ];

    function RequestHeaderCtrl($mdDialog, $scope, $rootScope, ENV, YangmanService, ParametersService, PathUtilsService,
                               RequestService, $filter, DataBackupService) {
        var requestHeader = this;

        requestHeader.allOperations = ['GET', 'POST', 'PUT', 'DELETE'];
        requestHeader.selectedOperationsList = [];
        requestHeader.selectedOperation = null;
        requestHeader.requestUrl = '';
        requestHeader.selectedPluginsButtons = [];
        requestHeader.selectedPlugin = null;
        requestHeader.statusObj = null;

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

        // watchers
        /**
         * Set selected operations based on data store
         */
        $scope.$on('SET_SEL_OPERATIONS', function (event, operations, setUrl) {
            setAllowedMethods(operations);

            if ( setUrl ) {
                setRequestUrl();
            }
        });

        /**
         * Watching for changes in shown detail data type (radio button)
         */
        $scope.$on('YANGMAN_HEADER_INIT', function (event, args) {
            init();
            setRequestUrl(args.params.path);
            setRequestMethod(args.params.method);
            setJsonView();
            (args.cbk || angular.noop)();
        });

        $scope.$on('YANGMAN_FILL_NODE_FROM_REQ', function (event, args) {
            setNodeDataFromRequestData(args.params.requestUrl, args.params.leftpanel);
            (args.cbk || angular.noop)();
        });

        $scope.$on('YANGMAN_EXECUTE_WITH_DATA', executeWithData);

        init();


        function executeWithData(event, args) {
            executeOperation(args.params.data ? angular.fromJson(args.params.data) : {}, args.cbk);
        }

        function setRequestMethod(method){
            requestHeader.selectedOperation = method;
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
            });
        }

        /**
         * Method for selecting correct json view by selected operation
         */
        function setJsonView(){
            var both = ['PUT', 'POST'];

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
            requestHeader.setRequestUrl();

            // if changing to json, fill codemirror data
            if ( requestHeader.selectedShownDataType === 'req-data' && $scope.node ){
                setJsonView();
                sendRequestData($scope.buildRootRequest(), 'SENT');
            }

            // if changing to form, try to fill node data
            if (requestHeader.selectedShownDataType === 'form') {
                var params = {
                        reqData: null,
                    },
                    reqData = {},
                    dataType = requestHeader.selectedOperation === 'GET' ? 'RECEIVED' : 'SENT';


                $scope.rootBroadcast('YANGMAN_GET_CODEMIRROR_DATA_' + dataType, params);
                reqData = params.reqData ? angular.fromJson(params.reqData) : {};
                setNodeDataFromRequestData(requestHeader.requestUrl);

                if ( $scope.node ) {
                    YangmanService.fillNodeFromResponse($scope.node, reqData);
                    $scope.node.expanded = true;
                }
            }
        }

        /**
         * Send data to codemirror
         * @param data
         */
        function sendRequestData(data, type){
            $scope.rootBroadcast('YANGMAN_SET_CODEMIRROR_DATA_' + type, { data: JSON.stringify(data, null, 4) });
        }

        /**
         * Create empty parameters list, load from local storage and set to $scope
         */
        function initParams(){
            var paramsList = ParametersService.createEmptyParametersList('yangman_parameters');
            paramsList.loadListFromStorage();
            $scope.setParametersList(paramsList);
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

            $scope.rootBroadcast('YANGMAN_GET_API_TREE_DATA', null, function (treeApis) {
                var apisIndexes =
                        PathUtilsService.searchNodeByPath(requestUrl, treeApis, null, true, true);

                if ( apisIndexes ){
                    // set apis
                    $scope.setApi(
                        $scope.apis[apisIndexes.indexApi],
                        $scope.apis[apisIndexes.indexApi].subApis[apisIndexes.indexSubApi]
                    );

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
                }
            });
        }

        function saveRequestToCollection(event) {
            var historyReq = RequestService.createHistoryRequest(null, null, requestHeader.requestUrl,
                    requestHeader.selectedOperation, '', '', ''),
                reqData = {};

            if ( requestHeader.selectedShownDataType === 'req-data' ) {
                var params = { reqData: null };
                $scope.rootBroadcast('YANGMAN_GET_CODEMIRROR_DATA_SENT', params);
                reqData = params.reqData ? angular.fromJson(params.reqData) : {};
            }

            var historyReqData = YangmanService.prepareAllRequestData(
                    $scope.selectedApi,
                    $scope.selectedSubApi,
                    requestHeader.selectedOperation,
                    $scope.node,
                    requestHeader.selectedShownDataType,
                    requestHeader.requestUrl,
                    reqData,
                    $scope.parametersList
                );

            historyReq.setExecutionData(historyReqData.reqData, {}, '');

            $scope.rootBroadcast('YANGMAN_SAVE_REQUEST_TO_COLLECTION', { event: event, reqObj: historyReq });
        }


        /**
         * Execute request operation
         */
        function executeOperation(requestData, executeCbk){
            setRequestUrl(requestHeader.selectedShownDataType === 'req-data' ? requestHeader.requestUrl : null);

            var historyReq = RequestService.createHistoryRequest(null, null, requestHeader.requestUrl,
                requestHeader.selectedOperation, '', '', '');

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

            /**
             * Success callback after executin operation
             * @param reqInfo
             * @param response
             */
            function executeReqSuccCbk(reqInfo, response) {
                var preparedReceivedData = YangmanService.prepareReceivedData(
                    $scope.node,
                    requestHeader.selectedOperation,
                    response.data ? response.data.plain() : {},
                    reqInfo.requestSrcData,
                    requestHeader.selectedShownDataType
                );

                requestHeader.statusObj = reqInfo;

                // create and set history request
                historyReq.setExecutionData(
                    reqInfo.requestSrcData,
                    preparedReceivedData,
                    reqInfo.status
                );

                if (requestHeader.selectedShownDataType === 'req-data'){

                    setNodeDataFromRequestData(requestHeader.requestUrl);
                    sendRequestData(preparedReceivedData, 'RECEIVED');
                    sendRequestData(reqInfo.requestSrcData || {}, 'SENT');
                }
                else {

                    if ($scope.node){

                        YangmanService.fillNodeFromResponse(
                            $scope.node,
                            preparedReceivedData
                        );

                        $scope.node.expanded = true;
                        $scope.rootBroadcast('YANGMAN_DISABLE_ADDING_LIST_ELEMENT');
                        sendRequestData(YangmanService.checkRpcReceivedData(preparedReceivedData, $scope.node), 'RECEIVED');
                    }
                }

                $scope.rootBroadcast('YANGMAN_SAVE_EXECUTED_REQUEST', historyReq);
                (executeCbk || angular.noop)(historyReq);

            }

            /**
             * Error callback after executin operation
             * @param reqInfo
             * @param response
             */
            function executeReqErrCbk(reqInfo, response) {
                requestHeader.statusObj = reqInfo;

                historyReq.setExecutionData(reqInfo.requestSrcData, null, reqInfo.status);
                $scope.rootBroadcast('YANGMAN_SAVE_EXECUTED_REQUEST', historyReq);

                //setNodeDataFromRequestData(requestHeader.requestUrl);

                if (response.data) {
                    // try to fill code mirror editor
                    sendRequestData(response.data, 'RECEIVED');
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
            if ($scope.selectedSubApi && $scope.selectedSubApi.storage === 'config' &&
                $scope.selectedSubApi.pathArray.indexOf(pathElem) === ($scope.selectedSubApi.pathArray.length - 1)) {
                PathUtilsService.fillListNode($scope.node, identifier.label, identifier.value);
            }
        }

        /**
         * Check data before executin operations
         */
        function prepareDataAndExecute(cbk){


            if ( requestHeader.requestUrl.length ) {

                if ( requestHeader.selectedShownDataType === 'req-data' ) {
                    // get json data
                    var params = { reqData: null };
                    $scope.rootBroadcast('YANGMAN_GET_CODEMIRROR_DATA_SENT', params);
                    executeOperation(params.reqData ? angular.fromJson(params.reqData) : {}, cbk);
                } else {
                    executeOperation({}, cbk);
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

            $scope.rootBroadcast('YANGMAN_GET_API_TREE_DATA', null, function (treeApis) {
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
            $scope.rootBroadcast('YANGMAN_SET_API_TREE_DATA', mountPointTreeApis);
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
