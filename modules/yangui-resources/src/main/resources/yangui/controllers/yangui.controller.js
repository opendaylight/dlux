var services = [
        'app/yangui/services/yangui.services',
        'app/yangui/services/history.services',
        'app/yangui/services/request-data.services',
        'app/yangui/services/custom-funct-unsetter.services',
        'app/yangui/services/plugin-handler.services',
        'app/yangui/services/mount-points-connector.services',
        'app/yangui/services/design-utils.services',
        'app/yangui/services/handle-file.services'
    ],
    directives = [
        'app/yangui/directives/abn_tree.directive',
        'app/yangui/directives/sticky.directive',
        'app/yangui/directives/read_file.directive',
        'app/yangui/directives/ui-codemirror.directive'
    ],
    controllers = [
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
        'app/yangui/controllers/api/type-enum.controller'
    ];

define(['app/yangui/yangui.module'].concat(services).concat(directives).concat(controllers), function(yangui) {


    yangui.register.controller('yanguiCtrl', ['$scope', '$timeout', '$rootScope', '$http', '$filter', 'YangUtilsRestangularService',
                                                'YangUtilsService', 'RequestBuilderService', 'CustomFuncService', 'PluginHandlerService',
                                                'PathUtilsService', 'constants', 'NodeWrapperService', 'MountPointsConnectorService',
                                                'DesignUtilsService', 'EventDispatcherService', 'SyncService',
                                                'CustomFunctUnsetterService', 'HistoryService', 'DataBackupService', 'ParsingJsonService',

        function ($scope, $timeout, $rootScope, $http, $filter, YangUtilsRestangularService, YangUtilsService, RequestBuilderService,
                  CustomFuncService, PluginHandlerService, PathUtilsService, constants, NodeWrapperService, MountPointsConnectorService,
                  DesignUtilsService, EventDispatcherService, SyncService, CustomFunctUnsetterService, HistoryService,
                  DataBackupService, ParsingJsonService) {


            $rootScope['section_logo'] = 'assets/images/logo_yangui.gif';
            $scope.currentPath = 'src/app/yangui/views/';
            $scope.apiType = '';
            $scope.constants = constants;
            $scope.filterConstants = constants;
            $scope.filterRootNode = null;
            $scope.previewValidity = true;
            $scope.previewDelay = 2000;
            $scope.selCustFunct = null;
            $scope.selCustFunctButts = [];
            $scope.mpSynchronizer = SyncService.generateObj();
            $scope.defaultTreeName = $filter('translate')('YANGUI_ROOT');
            $scope.treeName = $scope.defaultTreeName;

            $scope.status = {
                type: 'noreq',
                msg: null
            };

            $scope.mainTabs = {
                api: true,
                history : false,
                collection : false,
                parameters : false
            };

            $scope.showTabs = function(tabs, tabName){
                for(var prop in tabs){
                    tabs[prop] = tabName === prop;
                }

                DesignUtilsService.triggerWindowResize(100);
            };

            var mountPrefix = constants.MPPREFIX;

            var statusChangeEvent = function(messages) {
                // var newMessage = $scope.status.rawMsg + '\r\n' + messages.join('\r\n');
                processingModulesCallback(messages[0]);
            };

            var fillPathIdentifiersByKey = function(inputs) {
                var node = inputs[0],
                    value = inputs[1] || '';

                if($scope.selSubApi && node.parent && $scope.selSubApi.node.id === node.parent.id) { //or $scope.node === node.parent?
                    var identifiers = $scope.selSubApi.pathArray[$scope.selSubApi.pathArray.length - 1].identifiers;
                    PathUtilsService.fillIdentifiers(identifiers, node.label, value);
                }
            };

            var fillPathIdentifiersByListData = function(inputs) {
                var node = inputs[0];

                if($scope.selSubApi && node && $scope.selSubApi.node.id === node.id) { //or $scope.node === node.parent?
                    var identifiers = $scope.selSubApi.pathArray[$scope.selSubApi.pathArray.length - 1].identifiers,
                        keys = node.refKey;

                    keys.forEach(function(key) {
                        PathUtilsService.fillIdentifiers(identifiers, key.label, key.value);
                    });
                }
            };

            $scope.parameterizeData = function(path) {
                var parameterList = null;

                $scope.$broadcast('GET_PARAMETER_LIST', function(parameters) {
                    parameterList = parameters;
                });

                return HistoryService.parametrizeData(parameterList.list, path);
            };

            EventDispatcherService.registerHandler(constants.EV_SRC_MAIN, statusChangeEvent);
            EventDispatcherService.registerHandler(constants.EV_FILL_PATH, fillPathIdentifiersByKey);
            EventDispatcherService.registerHandler(constants.EV_LIST_CHANGED, fillPathIdentifiersByListData);

            var processingModulesCallback = function(e) {
                $scope.status = {
                    isWorking: true,
                    type: 'warning',
                    msg: 'PROCESSING_MODULES',
                    rawMsg: e || ''
                };
            };

            $scope.processingModulesSuccessCallback = function(e) {
                $scope.status = {
                    type: 'success',
                    msg: 'PROCESSING_MODULES_SUCCESS',
                    rawMsg: e || ''
                };
            };

            $scope.processingModulesErrorCallback = function(e) {
                $scope.status = {
                    type: 'danger',
                    msg: 'PROCESSING_MODULES_ERROR',
                    rawMsg: e || ''
                };
            };

            var requestWorkingCallback = function() {
                $scope.status = {
                    isWorking: true,
                    type: 'warning',
                    msg: 'SEND_WAIT'
                };
            };

            var requestSuccessCallback = function() {
                $scope.status = {
                    type: 'success',
                    msg: 'SEND_SUCCESS'
                };
            };

            $scope.setStatusMessage = function(type, msg, e){
                $scope.status = {
                    type: type,
                    msg: msg,
                    rawMsg: e || ''
                };
            };

            var requestErrorCallback = function(e, resp) {
                var errorMessages = YangUtilsService.errorMessages,
                    msg = errorMessages.method[resp.config.method] ? errorMessages.method[resp.config.method][resp.status] ? errorMessages.method[resp.config.method][resp.status] : 'SEND_ERROR' : 'SEND_ERROR';

                $scope.status = {
                    type: 'danger',
                    msg: msg,
                    rawMsg: e.toString()
                };
            };

            var setCustFunct = function(apis) {
                PluginHandlerService.plugAll($scope.apis, $scope);
            };

            $scope.removeMountPointPath = function(pathArray){
                var mpPathIndex = pathArray.length;

                pathArray.some(function(pathElem, index) {
                    var isMPElem = pathElem.name === mountPrefix;
                    if(isMPElem) {
                        mpPathIndex = index;
                    }

                    return isMPElem;
                });

                var pathCopy = pathArray.slice(0, mpPathIndex);
                return pathCopy;
            };

            $scope.invalidatePreview = function() {
                $scope.previewValidity = false;
            };

            $scope.validatePreview = function() {
                $scope.previewValidity = true;
            };

            $scope.isPreviewValid = function() {
                return $scope.previewValidity;
            };

            $scope.preview = function() {
                if($scope.isPreviewValid()) {
                    $scope.invalidatePreview();

                    $timeout(function () {
                        $scope.buildPreview();
                        $scope.validatePreview();
                    }, $scope.previewDelay);
                }
            };

            $scope.buildPreview = function() {
                if($scope.node) {
                    var reqString = $scope.selSubApi.buildApiRequestString(),
                        requestData = {};

                    // create request
                    $scope.node.buildRequest(RequestBuilderService, requestData, $scope.node.module);
                    // update request data (remove envelope from POST request etc.)
                    requestData = YangUtilsService.prepareRequestData(requestData, $scope.selectedOperation, reqString, $scope.selSubApi);

                    var jsonRequestData = requestData ? JSON.stringify(requestData, null, 4) : '';
                    // preview data
                    $scope.previewValue = $scope.selApi.basePath + reqString;
                    $scope.previewValue = $scope.previewValue + '\r\n' + jsonRequestData;
                } else {
                    $scope.previewValue = '';
                }
            };

            $scope.getNodeName = function(localeLabel, label) {
                var localeResult = $filter('translate')(localeLabel);
                return localeResult.indexOf(constants.LOCALE_PREFIX) === 0 ? label : localeResult;
            };

            $scope.showCustFunctButton = function() {
                return $scope.selCustFunct === null;
            };

            $scope.showCustFunctCancelButton = function() {
                return $scope.selCustFunct !== null;
            };

            $scope.unsetCustomFunctionality = function() {
                if($scope.selCustFunct) {
                    CustomFunctUnsetterService.unset($scope.selCustFunct, $scope);
                }
                $scope.selCustFunct = null;
                $scope.treeName = $scope.defaultTreeName;
                $scope.selCustFunctButts = [];
            };

            var loadApis = function loadApis() {
                $scope.apis = [];
                $scope.allNodes = [];
                $scope.treeApis = [];
                $scope.augmentations = {};

                processingModulesCallback();
                YangUtilsService.generateNodesToApis(function(apis, allNodes, augGroups) {
                    $scope.apis = apis;
                    $scope.allNodes = allNodes;
                    $scope.augmentations = augGroups;
                    console.info('got data', $scope.apis, $scope.allNodes, $scope.augmentations);
                    $scope.treeApis = YangUtilsService.generateApiTreeData(apis);
                    console.info('tree api', $scope.treeApis);
                    $scope.processingModulesSuccessCallback();

                    setCustFunct($scope.apis);
                    $scope.$broadcast('LOAD_REQ_DATA');
                }, function(e) {
                    $scope.processingModulesErrorCallback(e);
                });
            };

            $scope.isMountPointSelected = function() {
                return $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS';
            };

            $scope.dismissStatus = function() {
                $scope.status = {};
            };

            $scope.setNode = function() {
                $scope.node = $scope.selSubApi.node;
            };

            $scope.setApiNode = function(indexApi, indexSubApi) {
                $scope.selectedOperation = null;

                if(indexApi !== undefined && indexSubApi !== undefined ) {
                    $scope.selApi = $scope.apis[indexApi];
                    $scope.selSubApi = $scope.selApi.subApis[indexSubApi];

                    $scope.apiType = $scope.selSubApi.pathArray[0].name === 'operational' ? 'operational/':'';
                    $scope.node = $scope.selSubApi.node;
                    $scope.filterRootNode = $scope.selSubApi.node;
                    $scope.node.clear();

                    if($scope.selSubApi && $scope.selSubApi.operations) {
                        $scope.selectedOperation = $scope.selSubApi.operations[0];
                    }
                    $scope.$broadcast('EV_REFRESH_LIST_INDEX');
                    DesignUtilsService.triggerWindowResize(100);
                } else {
                    $scope.selApi = null;
                    $scope.selSubApi = null;
                    $scope.node = null;
                }
            };

            $scope.loadController = function() {
                $scope.flows = [];
                $scope.devices = [];
                $scope.apis = [];
                $scope.previewVisible = false;
                $scope.previewValue = '';
                $scope.popupData = { show: false};
                $scope.dataToFill = '';
                $scope.apiToFill = '';

                loadApis();

                $rootScope.$on('$includeContentLoaded', function() {
                    DesignUtilsService.setDraggablePopups();
                    //DesignUtilsService.getHistoryPopUpWidth();
                });
            };

            $scope.executeOperation = function(operation, callback, reqPath) {
                var reqString = $scope.selSubApi.buildApiRequestString(),
                    requestData = {},
                    preparedRequestData = {},
                    headers = null;

                reqString = reqPath ? reqPath.slice($scope.selApi.basePath.length, reqPath.length) : reqString;
                var requestPath = $scope.selApi.basePath + reqString;

                if (operation !== 'DELETE'){
                    $scope.node.buildRequest(RequestBuilderService, requestData, $scope.node.module);
                    angular.copy(requestData, preparedRequestData);
                    preparedRequestData = YangUtilsService.prepareRequestData(preparedRequestData, operation, reqString, $scope.selSubApi);
                }

                operation = YangUtilsService.prepareOperation(operation);
                headers = YangUtilsService.prepareHeaders(preparedRequestData);

                requestWorkingCallback();

                YangUtilsRestangularService.one('restconf').customOperation(operation.toLowerCase(), reqString, null, headers, preparedRequestData).then(
                    function(data) {
                        if(operation === 'REMOVE'){
                            $scope.node.clear();
                        }

                        if(data) {
                            $scope.node.clear();
                            var props = Object.getOwnPropertyNames(data);

                            props.forEach(function(p) { //fill each property - needed for root mountpoint node, in other cases there should be only one property anyway
                                $scope.node.fill(p, data[p]);
                            });
                            $scope.node.expanded = true;
                        }

                        requestSuccessCallback();
                        //TODO after first GET we have set $scope.node with data so build from the top of this function return requestData
                        if(operation === 'GET'){
                            requestData = {};
                        }
                        $scope.$broadcast('YUI_ADD_TO_HISTORY', 'success', data, preparedRequestData, operation, requestPath);

                        if ( angular.isFunction(callback) ) {
                            callback(data);
                        }

                        if($scope.previewVisible === true){
                            $scope.preview();
                        }

                    }, function(resp) {
                        var errorMsg = '';

                        if(resp.data && resp.data.errors && resp.data.errors.error && resp.data.errors.error.length) {
                            errorMsg = ': ' + resp.data.errors.error.map(function(e) {
                                    return e['error-message'];
                                }).join(', ');
                        }

                        requestErrorCallback(errorMsg, resp);

                        //TODO after first GET we have set $scope.node with data so build from the top of this function return requestData
                        if(operation === 'GET'){
                            requestData = {};
                        }
                        $scope.$broadcast('YUI_ADD_TO_HISTORY', 'error', resp.data, preparedRequestData, operation, requestPath);

                        console.info('error sending request to',$scope.selSubApi.buildApiRequestString(),'reqString',reqString,'got',resp.status,'data',resp.data);
                    }
                );
            };

            $scope.executeCustFunctionality = function(custFunct) {
                custFunct.runCallback($scope);
                $scope.selCustFunct = custFunct;
            };

            $scope.fillNodeData = function(pathElem, identifier) {
                if($scope.selSubApi && $scope.selSubApi.storage === 'config' &&
                    $scope.selSubApi.pathArray.indexOf(pathElem) === ($scope.selSubApi.pathArray.length - 1)) {
                    PathUtilsService.fillListNode($scope.node, identifier.label, identifier.value);
                }
            };

            $scope.showPreview = function() {
                $scope.previewVisible = true;
                $scope.buildPreview();
            };

            $scope.hidePreview = function() {
                $scope.previewVisible = false;
            };

            $scope.copyReqPathToClipboard = function(req){
                var reqPath = req ? req.api.parent.basePath : $scope.selApi.basePath;

                reqPath += req ? req.parametrizedPath ? $scope.parameterizeData(req.parametrizedPath) : req.api.buildApiRequestString() : $scope.selSubApi.buildApiRequestString();

                return reqPath;
            };

            $scope.fallback = function(path) {
                window.prompt($filter('translate')('YANGUI_CLIPBOARD_ALERT_MSG'), path);
            };

            $scope.buildRoot = function() {
                $scope.node.buildRequest(RequestBuilderService, {}, $scope.node.module);
            };

            $scope.changePathInPreview = function() {
                $scope.preview();
            };

            $scope.fillApiAndData = function(req, dataForView, fromSetCustApi) {
                var path = req.parametrizedPath ? req.parametrizedPath : req.path,
                    rdata = req.receivedData,
                    sdata = dataForView ? ParsingJsonService.parseJson(dataForView) : req.sentData;

                if(path) {
                    $scope.fillApi(path, fromSetCustApi);

                    if($scope.node && (rdata || sdata)) {
                        if(rdata) {
                            $scope.fillApiData(rdata);
                        }

                        if(sdata) {
                            $scope.fillApiData(sdata);
                        }
                    }
                }

                $scope.selectedOperation = req.method;
            };

            $scope.fillStandardApi = function(searchPath, fillPath, fromSetCustApi) {
                fillPath = fillPath || searchPath;

                var moduleNew = PathUtilsService.getModuleNameFromPath(searchPath),
                    moduleOld = $scope.selSubApi && $scope.selSubApi.pathArray.length > 1 ? $scope.selSubApi.pathArray[1].module : null;

                if((fromSetCustApi && searchPath.indexOf(mountPrefix) === -1 && $scope.selCustFunct && $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS') ||
                    (fromSetCustApi && searchPath.indexOf(mountPrefix) !== -1 && $scope.selCustFunct && $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS' && moduleNew !== moduleOld)){
                    $scope.unsetCustomFunctionality();
                }

                var apiIndexes = fromSetCustApi ? PathUtilsService.searchNodeByPath(searchPath, $scope.treeApis, $scope.treeRows) : PathUtilsService.searchNodeByPath(MountPointsConnectorService.alterMpPath(searchPath), $scope.treeApis, $scope.treeRows);

                if(apiIndexes) {
                    $scope.setApiNode(apiIndexes.indexApi, apiIndexes.indexSubApi);
                    if($scope.selSubApi) {
                        PathUtilsService.fillPath($scope.selSubApi.pathArray, fillPath);
                    }
                }
            };

            $scope.fillApi = function(path, fromSetCustApi) {
                var parameterizedPath = $scope.parameterizeData(path);
                fillPath = parameterizedPath;

                if(parameterizedPath.indexOf(mountPrefix) !== -1) {
                    fillPath = parameterizedPath.replace('restconf/config','restconf/operational');
                }

                $scope.fillStandardApi(fillPath, null, fromSetCustApi);

                if(path.indexOf(mountPrefix) !== -1 && $scope.selSubApi) {
                    $scope.selSubApi.pathArray = $scope.removeMountPointPath($scope.selSubApi.pathArray);
                    $scope.selectMP();

                    $scope.mpSynchronizer.waitFor(function () {
                        $scope.fillMPApi(parameterizedPath);
                    });
                }
            };

            $scope.selectMP = function() {
                var mpCF = CustomFuncService.getMPCustFunctionality($scope.selSubApi.custFunct);
                if(mpCF) {
                    $scope.executeCustFunctionality(mpCF);
                } else {
                    console.warn('Mountpoint custom functionality for api', $scope.selSubApi.buildApiRequestString(), ' is not set');
                }
            };

            $scope.fillMPApi = function(path) {
                var mpPath = MountPointsConnectorService.alterMpPath(path),
                    apiIndexes = PathUtilsService.searchNodeByPath(mpPath, $scope.treeApis, $scope.treeRows);
                if(apiIndexes) {
                    $scope.setApiNode(apiIndexes.indexApi, apiIndexes.indexSubApi);
                    if($scope.selSubApi) {
                        PathUtilsService.fillPath($scope.selSubApi.pathArray, path);
                    }
                }
            };

            $scope.fillApiData = function(data){
                var parametrizedData = $scope.parameterizeData(data),
                    obj = null;

                obj = typeof parametrizedData === "object" ? parametrizedData : ParsingJsonService.parseJson(parametrizedData);

                if (obj !== null && typeof obj === "object") {
                    var p = Object.keys(obj)[0];
                    $scope.node.fill(p, obj[p]);
                }
            };

            $scope.show_add_data_popup = function(){
                $scope.popupData.show = true;
            };

            $scope.close_popup = function(popObj){
                popObj.show = false;
            };

            $scope.tabs = function(event, index){
                var tabDom = $(event.target).closest('.tabs');

                tabDom.find(' > .tab-content').children('.tab-pane')
                    .removeClass('active')
                    .eq(index).addClass('active');

                tabDom.find('> .nav-tabs').children('li')
                    .removeClass('btn-selected')
                    .eq(index).addClass('btn-selected');
            };

            $scope.initMp = function(mountPointStructure, mountPointTreeApis, mountPointApis, augmentations){
                DataBackupService.storeFromScope(['treeApis', 'treeRows', 'apis', 'node', 'selApi', 'selSubApi', 'augmentations'], $scope);
                $scope.filterRootNode = null;
                $scope.node = null;
                $scope.treeApis = mountPointTreeApis;
                $scope.apis = mountPointApis;
                $scope.processingModulesSuccessCallback();
                $scope.augmentations = augmentations;
                $scope.$broadcast('REFRESH_HISTORY_REQUEST_APIS');
            };

            $scope.showModalRequestWin = function(){
                $scope.$broadcast('LOAD_REQ_DATA');
            };

            $scope.$on('SET_SCOPE_TREE_ROWS', function(e, rows){
                $scope.treeRows = rows;
            });

            $scope.__test = {
                loadApis: loadApis,
                processingModulesErrorCallback: $scope.processingModulesErrorCallback,
                requestErrorCallback: requestErrorCallback,
                requestSuccessCallback: requestSuccessCallback,
                requestWorkingCallback: requestWorkingCallback,
                processingModulesCallback: processingModulesCallback,
                processingModulesSuccessCallback: $scope.processingModulesSuccessCallback
            };

            $scope.loadController();

        }]);


    yangui.register.filter('onlyConfigStmts', function(NodeUtilsService){
        return function(nodes){

            if(nodes.length) {
                nodes = nodes.filter(function(n){
                    return NodeUtilsService.isOnlyOperationalNode(n);
                });
            }

            return nodes;
        };
    });

});
