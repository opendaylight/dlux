
define(
    [
        'app/yangui/services/yangui.services',
        'app/yangui/services/history.services',
        'app/yangui/services/request-data.services',
        'app/yangui/services/custom-funct-unsetter.services',
        'app/yangui/services/plugin-handler.services',
        'app/yangui/services/mount-points-connector.services',
        'app/yangui/services/design-utils.services',
        'app/yangui/services/handle-file.services',
        'app/yangui/directives/abn_tree.directive',
        'app/yangui/directives/sticky.directive',
        'app/yangui/directives/read_file.directive',
        'app/yangui/directives/ui-codemirror.directive',
        'app/yangui/controllers/api/augmentation-modal.controller',
        'app/yangui/controllers/api/case.controller',
        'app/yangui/controllers/api/coll-box.controller',
        'app/yangui/controllers/api/container.controller',
        'app/yangui/controllers/api/filter.controller',
        'app/yangui/controllers/api/filter-type.controller',
        'app/yangui/controllers/api/filter-type-bit.controller',
        'app/yangui/controllers/api/filter-type-empty.controller',
        'app/yangui/controllers/api/filter-type-enum.controller',
        'app/yangui/controllers/parameters/history-param.controller',
        'app/yangui/controllers/api/choice.controller',
        'app/yangui/controllers/api/input.controller',
        'app/yangui/controllers/api/leaf.controller',
        'app/yangui/controllers/api/leaf-list.controller',
        'app/yangui/controllers/api/list.controller',
        'app/yangui/controllers/api/output.controller',
        'app/yangui/controllers/parameters/param-box.controller',
        'app/yangui/controllers/parameters/params-view.controller',
        'app/yangui/controllers/history/req-in-history.controller',
        'app/yangui/controllers/history/request-history.controller',
        'app/yangui/controllers/api/rpc.controller',
        'app/yangui/controllers/api/type.controller',
        'app/yangui/controllers/api/type-bit.controller',
        'app/yangui/controllers/api/type-empty.controller',
        'app/yangui/controllers/api/type-enum.controller',
    ], function () {
    'use strict';

    angular.module('app.yangui').controller('YanguiCtrl', YanguiCtrl);

    YanguiCtrl.$inject = ['$scope', '$timeout', '$rootScope', '$http', '$filter', 'YangUtilsRestangularService',
        'YangUtilsService', 'RequestBuilderService', 'CustomFuncService', 'PluginHandlerService', 'PathUtilsService',
        'constants', 'NodeWrapperService', 'MountPointsConnectorService', 'DesignUtilsService',
        'EventDispatcherService', 'SyncService', 'CustomFunctUnsetterService', 'HistoryService', 'DataBackupService',
        'ParsingJsonService'];

    // todo: comment the whole controller
    function YanguiCtrl($scope, $timeout, $rootScope, $http, $filter, YangUtilsRestangularService, YangUtilsService,
                        RequestBuilderService, CustomFuncService, PluginHandlerService, PathUtilsService, constants,
                        NodeWrapperService, MountPointsConnectorService, DesignUtilsService, EventDispatcherService,
                        SyncService, CustomFunctUnsetterService, HistoryService, DataBackupService, ParsingJsonService){


        $rootScope.section_logo = 'assets/images/logo_yangui.gif';
        $scope.apiType = '';
        $scope.constants = constants;
        $scope.currentPath = 'src/app/yangui/views/';
        $scope.defaultTreeName = $filter('translate')('YANGUI_ROOT');
        $scope.filterConstants = constants;
        $scope.filterRootNode = null;
        $scope.mainTabs = {
            api: true,
            history: false,
            collection: false,
            parameters: false,
        };
        $scope.mpSynchronizer = SyncService.generateObj();
        $scope.previewDelay = 2000;
        $scope.previewValidity = true;
        $scope.selCustFunct = null;
        $scope.selCustFunctButts = [];
        $scope.status = {
            type: 'noreq',
            msg: null,
        };
        $scope.treeName = $scope.defaultTreeName;

        $scope.__test = {
            loadApis: loadApis,
            processingModulesErrorCallback: $scope.processingModulesErrorCallback,
            requestErrorCallback: requestErrorCallback,
            requestSuccessCallback: requestSuccessCallback,
            requestWorkingCallback: requestWorkingCallback,
            processingModulesCallback: processingModulesCallback,
            processingModulesSuccessCallback: $scope.processingModulesSuccessCallback,
        };

        $scope.buildPreview = buildPreview;
        $scope.buildRoot = buildRoot;
        $scope.changePathInPreview = changePathInPreview;
        $scope.checkAddingListElement = checkAddingListElement;
        $scope.close_popup = close_popup;
        $scope.copyReqPathToClipboard = copyReqPathToClipboard;
        $scope.dismissStatus = dismissStatus;
        $scope.executeCustFunctionality = executeCustFunctionality;
        $scope.executeOperation = executeOperation;
        $scope.fallback = fallback;
        $scope.fillApi = fillApi;
        $scope.fillApiAndData = fillApiAndData;
        $scope.fillApiData = fillApiData;
        $scope.fillMPApi = fillMPApi;
        $scope.fillNodeData = fillNodeData;
        $scope.fillStandardApi = fillStandardApi;
        $scope.getNodeName = getNodeName;
        $scope.hidePreview = hidePreview;
        $scope.initMp = initMp;
        $scope.invalidatePreview = invalidatePreview;
        $scope.isMountPointSelected = isMountPointSelected;
        $scope.isPreviewValid = isPreviewValid;
        $scope.loadController = loadController;
        $scope.parameterizeData = parameterizeData;
        $scope.preview = preview;
        $scope.processingModulesErrorCallback = processingModulesErrorCallback;
        $scope.processingModulesSuccessCallback = processingModulesSuccessCallback;
        $scope.removeMountPointPath = removeMountPointPath;
        $scope.selectMP = selectMP;
        $scope.setApiNode = setApiNode;
        $scope.setNode = setNode;
        $scope.setStatusMessage = setStatusMessage;
        $scope.show_add_data_popup = show_add_data_popup;
        $scope.showCustFunctButton = showCustFunctButton;
        $scope.showCustFunctCancelButton = showCustFunctCancelButton;
        $scope.showModalRequestWin = showModalRequestWin;
        $scope.showPreview = showPreview;
        $scope.showTabs = showTabs;
        $scope.tabs = tabs;
        $scope.unsetCustomFunctionality = unsetCustomFunctionality;
        $scope.validatePreview = validatePreview;

        $scope.$on('SET_SCOPE_TREE_ROWS', setScopeTreeRows);

        var mountPrefix = constants.MPPREFIX;

        EventDispatcherService.registerHandler(constants.EV_SRC_MAIN, statusChangeEvent);
        EventDispatcherService.registerHandler(constants.EV_FILL_PATH, fillPathIdentifiersByKey);
        EventDispatcherService.registerHandler(constants.EV_LIST_CHANGED, fillPathIdentifiersByListData);

        $scope.loadController();

        function showTabs(tabs, tabName){
            for (var prop in tabs){
                tabs[prop] = tabName === prop;
            }

            DesignUtilsService.triggerWindowResize(100);
        }

        function statusChangeEvent(messages) {
            // var newMessage = $scope.status.rawMsg + '\r\n' + messages.join('\r\n');
            processingModulesCallback(messages[0]);
        }

        function fillPathIdentifiersByKey(inputs) {
            var node = inputs[0],
                value = inputs[1] || '';

            // or $scope.node === node.parent?
            if ($scope.selSubApi && node.parent && $scope.selSubApi.node.id === node.parent.id) {
                var identifiers = $scope.selSubApi.pathArray[$scope.selSubApi.pathArray.length - 1].identifiers;
                PathUtilsService.fillIdentifiers(identifiers, node.label, value);
            }
        }

        function fillPathIdentifiersByListData(inputs) {
            var node = inputs[0];

            if ($scope.selSubApi && node && $scope.selSubApi.node.id === node.id) { // or $scope.node === node.parent?
                var identifiers = $scope.selSubApi.pathArray[$scope.selSubApi.pathArray.length - 1].identifiers,
                    keys = node.refKey;

                keys.forEach(function (key) {
                    PathUtilsService.fillIdentifiers(identifiers, key.label, key.value);
                });
            }
        }

        function parameterizeData(path) {
            var parameterList = null;

            $scope.$broadcast('GET_PARAMETER_LIST', function (parameters) {
                parameterList = parameters;
            });

            return HistoryService.parametrizeData(parameterList.list, path);
        }

        function processingModulesCallback(e) {
            $scope.status = {
                isWorking: true,
                type: 'warning',
                msg: 'PROCESSING_MODULES',
                rawMsg: e || '',
            };
        }

        function processingModulesSuccessCallback(e) {
            $scope.status = {
                type: 'success',
                msg: 'PROCESSING_MODULES_SUCCESS',
                rawMsg: e || '',
            };
        }

        function processingModulesErrorCallback(e) {
            $scope.status = {
                type: 'danger',
                msg: 'PROCESSING_MODULES_ERROR',
                rawMsg: e || '',
            };
        }

        function requestWorkingCallback() {
            $scope.status = {
                isWorking: true,
                type: 'warning',
                msg: 'SEND_WAIT',
            };
        }

        function requestSuccessCallback() {
            $scope.status = {
                type: 'success',
                msg: 'SEND_SUCCESS',
            };
        }

        function setStatusMessage(type, msg, e){
            $scope.status = {
                type: type,
                msg: msg,
                rawMsg: e || '',
            };
        }

        function requestErrorCallback(e, resp) {
            var errorMessages = YangUtilsService.errorMessages,
                msg = errorMessages.method[resp.config.method] ?
                    errorMessages.method[resp.config.method][resp.status] ?
                        errorMessages.method[resp.config.method][resp.status] :
                        'SEND_ERROR' :
                    'SEND_ERROR';

            $scope.status = {
                type: 'danger',
                msg: msg,
                rawMsg: e.toString(),
            };
        }

        function setCustFunct(apis) {
            PluginHandlerService.plugAll($scope.apis, $scope);
        }

        function removeMountPointPath(pathArray){
            var mpPathIndex = pathArray.length;

            pathArray.some(function (pathElem, index) {
                var isMPElem = pathElem.name === mountPrefix;
                if (isMPElem) {
                    mpPathIndex = index;
                }

                return isMPElem;
            });

            var pathCopy = pathArray.slice(0, mpPathIndex);
            return pathCopy;
        }

        function invalidatePreview() {
            $scope.previewValidity = false;
        }

        function validatePreview() {
            $scope.previewValidity = true;
        }

        function isPreviewValid() {
            return $scope.previewValidity;
        }

        function preview() {
            if ($scope.isPreviewValid()) {
                $scope.invalidatePreview();

                $timeout(function () {
                    $scope.buildPreview();
                    $scope.validatePreview();
                }, $scope.previewDelay);
            }
        }

        function buildPreview() {
            if ($scope.node) {
                var reqString = $scope.selSubApi.buildApiRequestString(),
                    requestData = {};

                // create request
                $scope.node.buildRequest(RequestBuilderService, requestData, $scope.node.module);
                // update request data (remove envelope from POST request etc.)
                requestData = YangUtilsService.prepareRequestData(
                    requestData,
                    $scope.selectedOperation,
                    reqString,
                    $scope.selSubApi
                );

                var jsonRequestData = requestData ? JSON.stringify(requestData, null, 4) : '';
                // preview data
                $scope.previewValue = $scope.selApi.basePath + reqString;
                $scope.previewValue = $scope.previewValue + '\r\n' + jsonRequestData;
            } else {
                $scope.previewValue = '';
            }
        }

        function getNodeName(localeLabel, label) {
            var localeResult = $filter('translate')(localeLabel);
            return localeResult.indexOf(constants.LOCALE_PREFIX) === 0 ? label : localeResult;
        }

        function showCustFunctButton() {
            return $scope.selCustFunct === null;
        }

        function showCustFunctCancelButton() {
            return $scope.selCustFunct !== null;
        }

        function unsetCustomFunctionality() {
            if ($scope.selCustFunct) {
                CustomFunctUnsetterService.unset($scope.selCustFunct, $scope);
            }
            $scope.selCustFunct = null;
            $scope.treeName = $scope.defaultTreeName;
            $scope.selCustFunctButts = [];
        }

        function loadApis() {
            $scope.apis = [];
            $scope.allNodes = [];
            $scope.treeApis = [];
            $scope.augmentations = {};

            processingModulesCallback();
            YangUtilsService.generateNodesToApis(function (apis, allNodes, augGroups) {
                $scope.apis = apis;
                $scope.allNodes = allNodes;
                $scope.augmentations = augGroups;
                console.info('got data', $scope.apis, $scope.allNodes, $scope.augmentations);
                $scope.treeApis = YangUtilsService.generateApiTreeData(apis);
                console.info('tree api', $scope.treeApis);
                $scope.processingModulesSuccessCallback();

                setCustFunct($scope.apis);
                $scope.$broadcast('LOAD_REQ_DATA');
            }, function (e) {
                $scope.processingModulesErrorCallback(e);
            });
        }

        function isMountPointSelected() {
            return $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS';
        }

        function dismissStatus() {
            $scope.status = {};
        }

        function setNode() {
            $scope.node = $scope.selSubApi.node;
        }

        function setApiNode(indexApi, indexSubApi) {
            $scope.selectedOperation = null;

            if (indexApi !== undefined && indexSubApi !== undefined ) {
                $scope.selApi = $scope.apis[indexApi];
                $scope.selSubApi = $scope.selApi.subApis[indexSubApi];

                $scope.apiType = $scope.selSubApi.pathArray[0].name === 'operational' ? 'operational/' : '';
                $scope.node = $scope.selSubApi.node;
                $scope.filterRootNode = $scope.selSubApi.node;
                $scope.node.clear();

                if ($scope.selSubApi && $scope.selSubApi.operations) {
                    $scope.selectedOperation = $scope.selSubApi.operations[0];
                }

                // TODO: uncomment this broadcast and check why does it cause adding element to list in operational portion twice
                //$scope.$broadcast('EV_DISABLE_ADDING_LIST_ELEMENT');

                $scope.$broadcast('EV_REFRESH_LIST_INDEX');
                DesignUtilsService.triggerWindowResize(100);
            } else {
                $scope.selApi = null;
                $scope.selSubApi = null;
                $scope.node = null;
            }
        }

        /**
         * Checks if the element list should be disabled
         */
        function checkAddingListElement(node) {
            return $scope.node === node && $scope.node.type === 'list' && $scope.node.refKey && $scope.node.refKey.length;
        }

        function loadController() {
            $scope.flows = [];
            $scope.devices = [];
            $scope.apis = [];
            $scope.previewVisible = false;
            $scope.previewValue = '';
            $scope.popupData = { show: false };
            $scope.dataToFill = '';
            $scope.apiToFill = '';

            loadApis();

            $rootScope.$on('$includeContentLoaded', function () {
                DesignUtilsService.setDraggablePopups();
                // DesignUtilsService.getHistoryPopUpWidth();
            });
        }

        function executeOperation(operation, callback, reqPath) {
            var reqString = $scope.selSubApi.buildApiRequestString(),
                requestData = {},
                preparedRequestData = {},
                headers = null;

            reqString = reqPath ? reqPath.slice($scope.selApi.basePath.length, reqPath.length) : reqString;
            var requestPath = $scope.selApi.basePath + reqString;

            operation = YangUtilsService.prepareOperation(operation);

            if (operation !== 'REMOVE'){
                $scope.node.buildRequest(RequestBuilderService, requestData, $scope.node.module);
                angular.copy(requestData, preparedRequestData);

                preparedRequestData = YangUtilsService.prepareRequestData(
                    preparedRequestData,
                    operation,
                    reqString,
                    $scope.selSubApi
                );
            }

            headers = YangUtilsService.prepareHeaders(preparedRequestData);

            requestWorkingCallback();

            YangUtilsRestangularService.one('restconf').customOperation(
                operation.toLowerCase(),
                reqString,
                null,
                headers,
                preparedRequestData
            ).then(
                function (data) {
                    if (operation === 'REMOVE'){
                        $scope.node.clear();
                    }

                    if (data) {
                        $scope.node.clear();
                        var props = Object.getOwnPropertyNames(data);

                        // fill each property - needed for root mountpoint node,
                        // in other cases there should be only one property anyway
                        props.forEach(function (p) {
                            $scope.node.fill(p, data[p]);
                        });
                        $scope.node.expanded = true;
                    }

                    requestSuccessCallback();
                    // TODO after first GET we have set $scope.node with data
                    // so build from the top of this function return requestData
                    if (operation === 'GET'){
                        requestData = {};
                    }
                    $scope.$broadcast('YUI_ADD_TO_HISTORY',
                        'success',
                        data,
                        preparedRequestData,
                        operation,
                        requestPath
                    );

                    if ( angular.isFunction(callback) ) {
                        callback(data);
                    }

                    if ($scope.previewVisible === true){
                        $scope.preview();
                    }

                }, function (resp) {
                    var errorMsg = '';

                    if (resp.data && resp.data.errors && resp.data.errors.error && resp.data.errors.error.length) {
                        errorMsg = ': ' + resp.data.errors.error.map(function (e) {
                                return e['error-message'];
                            }).join(', ');
                    }

                    requestErrorCallback(errorMsg, resp);

                    // TODO after first GET we have set $scope.node with data
                    // so build from the top of this function return requestData
                    if (operation === 'GET'){
                        requestData = {};
                    }
                    $scope.$broadcast(
                        'YUI_ADD_TO_HISTORY',
                        'error',
                        resp.data,
                        preparedRequestData,
                        operation,
                        requestPath
                    );

                    console.info(
                        'error sending request to',
                        $scope.selSubApi.buildApiRequestString(),
                        'reqString',
                        reqString,
                        'got',
                        resp.status,
                        'data',
                        resp.data
                    );
                }
            );
        }

        function executeCustFunctionality(custFunct) {
            custFunct.runCallback($scope);
            $scope.selCustFunct = custFunct;
        }

        function fillNodeData(pathElem, identifier) {
            if ($scope.selSubApi && $scope.selSubApi.storage === 'config' &&
                $scope.selSubApi.pathArray.indexOf(pathElem) === ($scope.selSubApi.pathArray.length - 1)) {
                PathUtilsService.fillListNode($scope.node, identifier.label, identifier.value);
            }
        }

        function showPreview() {
            $scope.previewVisible = true;
            $scope.buildPreview();
        }

        function hidePreview() {
            $scope.previewVisible = false;
        }

        function copyReqPathToClipboard(req){
            var reqPath = req ? req.api.parent.basePath : $scope.selApi.basePath;

            reqPath += req ?
                req.parametrizedPath ?
                    $scope.parameterizeData(req.parametrizedPath) :
                    req.api.buildApiRequestString() :
                $scope.selSubApi.buildApiRequestString();

            return reqPath;
        }

        function fallback(path) {
            window.prompt($filter('translate')('YANGUI_CLIPBOARD_ALERT_MSG'), path);
        }

        function buildRoot() {
            $scope.node.buildRequest(RequestBuilderService, {}, $scope.node.module);
        }

        function changePathInPreview() {
            $scope.preview();
        }

        function fillApiAndData(req, dataForView, fromSetCustApi) {
            var path = req.parametrizedPath ? req.parametrizedPath : req.path,
                rdata = req.receivedData,
                sdata = dataForView ? ParsingJsonService.parseJson(dataForView) : req.sentData;

            if (path) {
                $scope.fillApi(path, fromSetCustApi);

                if ($scope.node && (rdata || sdata)) {
                    if (rdata) {
                        $scope.fillApiData(rdata);
                    }

                    if (sdata) {
                        $scope.fillApiData(sdata);
                    }
                }
            }

            $scope.selectedOperation = req.method;
        }

        function fillStandardApi(searchPath, fillPath, fromSetCustApi) {
            fillPath = fillPath || searchPath;

            var moduleNew = PathUtilsService.getModuleNameFromPath(searchPath),
                moduleOld = $scope.selSubApi &&
                    $scope.selSubApi.pathArray.length > 1 ? $scope.selSubApi.pathArray[1].module : null;

            if (
                (
                    fromSetCustApi && searchPath.indexOf(mountPrefix) === -1 &&
                    $scope.selCustFunct && $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS'
                ) ||
                (
                    fromSetCustApi && searchPath.indexOf(mountPrefix) !== -1 &&
                    $scope.selCustFunct &&
                    $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS' &&
                    moduleNew !== moduleOld
                )
            ){
                $scope.unsetCustomFunctionality();
            }

            var apiIndexes = fromSetCustApi ?
                PathUtilsService.searchNodeByPath(searchPath, $scope.treeApis, $scope.treeRows) :
                PathUtilsService.searchNodeByPath(
                    MountPointsConnectorService.alterMpPath(searchPath),
                    $scope.treeApis,
                    $scope.treeRows
                );

            if (apiIndexes) {
                $scope.setApiNode(apiIndexes.indexApi, apiIndexes.indexSubApi);
                if ($scope.selSubApi) {
                    PathUtilsService.fillPath($scope.selSubApi.pathArray, fillPath);
                }
            }
        }

        function fillApi(path, fromSetCustApi) {
            var parameterizedPath = $scope.parameterizeData(path),
                fillPath = parameterizedPath;

            if (parameterizedPath.indexOf(mountPrefix) !== -1) {
                fillPath = parameterizedPath.replace('restconf/config', 'restconf/operational');
            }

            $scope.fillStandardApi(fillPath, null, fromSetCustApi);

            if (path.indexOf(mountPrefix) !== -1 && $scope.selSubApi) {
                $scope.selSubApi.pathArray = $scope.removeMountPointPath($scope.selSubApi.pathArray);
                $scope.selectMP();

                $scope.mpSynchronizer.waitFor(function () {
                    $scope.fillMPApi(parameterizedPath);
                });
            }
        }

        function selectMP() {
            var mpCF = CustomFuncService.getMPCustFunctionality($scope.selSubApi.custFunct);
            if (mpCF) {
                $scope.executeCustFunctionality(mpCF);
            } else {
                console.warn(
                    'Mountpoint custom functionality for api',
                    $scope.selSubApi.buildApiRequestString(),
                    ' is not set');
            }
        }

        function fillMPApi(path) {
            var mpPath = MountPointsConnectorService.alterMpPath(path),
                apiIndexes = PathUtilsService.searchNodeByPath(mpPath, $scope.treeApis, $scope.treeRows);
            if (apiIndexes) {
                $scope.setApiNode(apiIndexes.indexApi, apiIndexes.indexSubApi);
                if ($scope.selSubApi) {
                    PathUtilsService.fillPath($scope.selSubApi.pathArray, path);
                }
            }
        }

        function fillApiData(data){
            var parametrizedData = $scope.parameterizeData(data),
                obj = null;

            obj = typeof parametrizedData === 'object' ?
                parametrizedData :
                ParsingJsonService.parseJson(parametrizedData);

            if (obj !== null && typeof obj === 'object') {
                var p = Object.keys(obj)[0];
                $scope.node.fill(p, obj[p]);
            }
        }

        function show_add_data_popup(){
            $scope.popupData.show = true;
        }

        function close_popup(popObj){
            popObj.show = false;
        }

        function tabs(event, index){
            var tabDom = $(event.target).closest('.tabs');

            tabDom.find(' > .tab-content').children('.tab-pane')
                .removeClass('active')
                .eq(index).addClass('active');

            tabDom.find('> .nav-tabs').children('li')
                .removeClass('btn-selected')
                .eq(index).addClass('btn-selected');
        }

        function initMp(mountPointStructure, mountPointTreeApis, mountPointApis, augmentations){
            DataBackupService.storeFromScope([
                'treeApis',
                'treeRows',
                'apis',
                'node',
                'selApi',
                'selSubApi',
                'augmentations',
            ], $scope);
            $scope.filterRootNode = null;
            $scope.node = null;
            $scope.treeApis = mountPointTreeApis;
            $scope.apis = mountPointApis;
            $scope.processingModulesSuccessCallback();
            $scope.augmentations = augmentations;
            $scope.$broadcast('REFRESH_HISTORY_REQUEST_APIS');
        }

        function showModalRequestWin(){
            $scope.$broadcast('LOAD_REQ_DATA');
        }

        function setScopeTreeRows(e, rows){
            $scope.treeRows = rows;
        }

    }

    angular.module('app.yangui').filter('onlyConfigStmts', function (NodeUtilsService){
        return function (nodes){

            if (nodes.length) {
                nodes = nodes.filter(function (n){
                    return NodeUtilsService.isOnlyOperationalNode(n);
                });
            }

            return nodes;
        };
    });

});
