define(['app/yangui/services/handle-file.services'], function () {
    'use strict';

    angular.module('app.yangui').controller('RequestHistoryCtrl', RequestHistoryCtrl);

    RequestHistoryCtrl.$inject = ['$filter', '$scope', '$rootScope', 'PathUtilsService', 'HistoryService',
        'HandleFileService', 'YangUtilsService', 'constants',
        'MountPointsConnectorService', 'ParsingJsonService',
    ];

    // todo: comment the whole controller
    function RequestHistoryCtrl($filter, $scope, $rootScope, PathUtilsService, HistoryService, HandleFileService,
                                YangUtilsService, constants, MountPointsConnectorService, ParsingJsonService) {

        $scope.collectionBoxView = false;
        $scope.collectionList = HistoryService.createEmptyCollectionList('collectionList', $scope.getApiCallback);
        $scope.groupView = {};
        $scope.parameterList = HistoryService.createEmptyParamList('parameterList');
        $scope.parameterList.loadListFromStorage();
        $scope.popupHistory = { show: false };
        $scope.requestList = HistoryService.createEmptyHistoryList('requestList', $scope.getApiCallback);

        $scope.addRequestToList = addRequestToList;
        $scope.clearHistoryData = clearHistoryData;
        $scope.checkParamIsNotInList = checkParamIsNotInList;
        $scope.deleteRequestItem = deleteRequestItem;
        $scope.executeCollectionRequest = executeCollectionRequest;
        $scope.exportHistoryData = exportHistoryData;
        $scope.getApiCallback = getApiCallback;
        $scope.hideCollBox = hideCollBox;
        $scope.readCollectionFromFile = readCollectionFromFile;
        $scope.reqHistoryFunc = reqHistoryFunc;
        $scope.saveElemToList = saveElemToList;
        $scope.saveParamToList = saveParamToList;
        $scope.setGroupView = setGroupView;
        $scope.showCollBox = showCollBox;
        $scope.toggleExpanded = toggleExpanded;

        $scope.$on('GET_PARAMETER_LIST', getParametersList);
        $scope.$on('LOAD_REQ_DATA', loadReqData);
        $scope.$on('REFRESH_HISTORY_REQUEST_APIS', refreshHistoryApis);
        $scope.$on('YUI_ADD_TO_HISTORY', addToHistory);

        var mountPrefix = constants.MPPREFIX;


        function getApiCallback(pathString) {
            var snp = PathUtilsService.getStorageAndNormalizedPath(pathString),
                // if the path is for mountpoint then get the path to treedata structure
                mpSearchPath = MountPointsConnectorService.alterMpPath(pathString),
                apiIndexes = PathUtilsService.searchNodeByPath(mpSearchPath, $scope.treeApis, $scope.treeRows),
                selApi = apiIndexes ? $scope.apis[apiIndexes.indexApi] : null,
                selSubApi = selApi ? selApi.subApis[apiIndexes.indexSubApi] : null,
                copiedApi = selSubApi ?
                    selSubApi.clone({ storage: snp.storage, withoutNode: true, clonePathArray: true }) :
                    null;

            if (copiedApi) {
                copiedApi.pathArray.forEach(function (p) {
                    p.hover = false;
                });

                PathUtilsService.fillPath(copiedApi.pathArray, snp.normalizedPath);
            }

            var searchedModule = PathUtilsService.getModuleNameFromPath(pathString);

            if (mpSearchPath.indexOf(mountPrefix) !== -1 && copiedApi){
                copiedApi = $scope.selSubApi &&
                    searchedModule === $scope.selSubApi.pathArray[1].module ?
                        copiedApi :
                        null;
            }

            return copiedApi;
        }

        function refreshHistoryApis(event){
            $scope.requestList.refresh();
            $scope.collectionList.refresh();
        }

        function getParametersList(event, callback){
            callback($scope.parameterList);
        }

        function addToHistory(event, status, data, requestData, operation, requestPath) {
            $scope.addRequestToList(status, data, requestData, operation, requestPath);
        }

        function addRequestToList(status, receivedData, sentData, operation, path) {
            if (typeof (Storage) !== 'undefined') {

                var rList = HistoryService.createEmptyHistoryList(),
                    reqObj = HistoryService.createHistoryRequest(sentData, receivedData, path, null, operation,
                        status, null, null, $scope.getApiCallback);

                reqObj.refresh($scope.getApiCallback);

                $scope.requestList.addRequestToList(reqObj);
                $scope.requestList.saveToStorage();
            }
        }

        function reqHistoryFunc(){
            $scope.popupHistory.show = !$scope.popupHistory.show;

            $scope.requestList.loadListFromStorage();
            $scope.collectionList.loadListFromStorage();
            $scope.requestList.show = false;
        }

        function showCollBox(req, edit){
            $scope.collectionBoxView = true;
            $scope.$broadcast('COLL_CLEAR_VAL_SET_REQ', req, edit);
        }

        function hideCollBox(){
            $scope.collectionBoxView = false;
        }

        function saveElemToList(elem) {
            $scope.collectionList.addRequestToList(elem);
            $scope.collectionList.saveToStorage();
        }

        function saveParamToList(elem, oldElem) {
            $scope.parameterList.saveRequestToList(elem, oldElem);
        }

        function deleteRequestItem(elem, list){
            $scope[list].deleteRequestItem(elem);
            $scope[list].saveToStorage();
        }

        function clearHistoryData(list){
            $scope[list].clear();
            $scope[list].saveToStorage();
        }

        function clearFileInputValue() {
            var el = document.getElementById('upload-collection');
            el.value = '';
        }

        function exportHistoryData() {
            var cListJSON = localStorage.getItem('collectionList');

            HandleFileService.downloadFile('requestCollection.json', cListJSON, 'json', 'charset=utf-8', function () {
                $scope.setStatusMessage('success', 'EXPORT_COLLECTIONS_SUCCESS');
            }, function (e){
                    if(e == -1) {
                        $scope.setStatusMessage('danger', 'EXPORT_COLLECTIONS_ERROR_BROWSER');
                    }
                    else {
                        $scope.setStatusMessage('danger', 'EXPORT_COLLECTIONS_ERROR', e);
                        // console.error('ExportCollection error:', e);
                    }
            });
        }

        function readCollectionFromFile($fileContent) {
            var data = $fileContent,
                checkArray = [
                    'sentData',
                    'receivedData',
                    'path',
                    'group',
                    'parametrizedPath',
                    'method',
                    'status',
                    'name',
                ];

            if (data && HistoryService.validateFile(data, checkArray)){
                try {
                    $scope.collectionList.loadListFromFile(data);
                    $scope.collectionList.saveToStorage();
                    $scope.setStatusMessage('success', 'LOAD_COLLECTIONS_SUCCESS');
                    clearFileInputValue();
                }
                catch (e) {
                    clearFileInputValue();
                    $scope.setStatusMessage('danger', 'PARSE_JSON_FILE_ERROR', e);
                    // console.error('DataStorage error:', e);
                }
            }
            else {
                $scope.setStatusMessage('danger', 'PARSE_JSON_FILE_ERROR');
                clearFileInputValue();
            }
        }

        function checkParamIsNotInList(req) {
            var regexp = /<<([^>]+)>>/g;
            var sParam = angular.toJson(req).match(regexp);

            return sParam && sParam.some(function(parameter) {
                parameter = parameter.replace(/[<>]/g, '');

                return $filter('filter')($scope.parameterList.list, {'name': parameter}).length < 1;
            });
        }

        function executeCollectionRequest(req, dataForView, showData) {
            var sdata = dataForView ? ParsingJsonService.parseJson(dataForView) : req.sentData,
                    path = req.parametrizedPath && showData ? req.parametrizedPath : req.api.buildApiRequestString(),
                    paramResult = checkParamIsNotInList(sdata);

            path = $scope.parameterizeData(path);
            $scope.fillStandardApi(path, req.path);

            if(sdata && !paramResult) {
                $scope.fillApiData(sdata);
            }

            var requestPath = req.api.parent.basePath + path;

            if(!paramResult) {
                $scope.executeOperation(req.method, function(data){
                    if ( !data &&  req.receivedData ){
                        $scope.node.fill($scope.node.label,req.receivedData[$scope.node.label]);
                    }
                }, requestPath);
            }
            else {
                $scope.setStatusMessage('danger', 'YANGUI_PARAMETER_MISSING_ERROR', e.message);
            }
        }

        function setGroupView(key) {
            $scope.groupView[key] = false;
        }

        function toggleExpanded(key) {
            $scope.groupView[key] = !$scope.groupView[key];
        }

        function loadReqData(){
            $scope.reqHistoryFunc();
        }

    }

});
