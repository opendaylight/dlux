var services = [
    'app/yangui/services/handle-file.services',
];

define([].concat(services), function() {

    angular.module('app.yangui').controller('requestHistoryCtrl', ['$scope', '$rootScope','PathUtilsService','HistoryService',
                                                                    'HandleFileService', 'YangUtilsService', 'constants',
                                                                    'MountPointsConnectorService', '$filter', 'ParsingJsonService',
        function ($scope, $rootScope, PathUtilsService, HistoryService, HandleFileService, YangUtilsService, constants,
                  MountPointsConnectorService, $filter, ParsingJsonService) {

            $scope.collectionBoxView = false;


            var mountPrefix = constants.MPPREFIX;

            $scope.getApiCallback = function(pathString) {
                var snp = PathUtilsService.getStorageAndNormalizedPath(pathString),
                    mpSearchPath = MountPointsConnectorService.alterMpPath(pathString), //if the path is for mountpoint then get the path to treedata structure
                    apiIndexes = PathUtilsService.searchNodeByPath(mpSearchPath, $scope.treeApis, $scope.treeRows),
                    selApi = apiIndexes ? $scope.apis[apiIndexes.indexApi] : null,
                    selSubApi = selApi ? selApi.subApis[apiIndexes.indexSubApi] : null,
                    copiedApi = selSubApi ? selSubApi.clone({ storage: snp.storage, withoutNode: true, clonePathArray: true }) : null;

                if (copiedApi) {
                    copiedApi.pathArray.forEach(function(p){
                        p.hover = false;
                    });

                    PathUtilsService.fillPath(copiedApi.pathArray, snp.normalizedPath);
                }

                var searchedModule = PathUtilsService.getModuleNameFromPath(pathString);

                if(mpSearchPath.indexOf(mountPrefix) !== -1 && copiedApi){
                    copiedApi = $scope.selSubApi && searchedModule === $scope.selSubApi.pathArray[1].module ? copiedApi : null;
                }

                return copiedApi;
            };

            $scope.requestList = HistoryService.createEmptyHistoryList('requestList', $scope.getApiCallback);
            $scope.collectionList = HistoryService.createEmptyCollectionList('collectionList', $scope.getApiCallback);
            $scope.parameterList = HistoryService.createEmptyParamList('parameterList');
            $scope.parameterList.loadListFromStorage();

            $scope.popupHistory = { show: false};

            $scope.$on('REFRESH_HISTORY_REQUEST_APIS', function(event, callback){
                $scope.requestList.refresh();
                $scope.collectionList.refresh();
            });


            $scope.$on('GET_PARAMETER_LIST', function(event, callback){
                callback($scope.parameterList);
            });

            $scope.$on('YUI_ADD_TO_HISTORY', function(event, status, data, requestData, operation, requestPath) {
                $scope.addRequestToList(status, data, requestData, operation, requestPath);
            });

            $scope.addRequestToList = function(status, receivedData, sentData, operation, path) {
                if(typeof(Storage) !== "undefined") {

                    var rList = HistoryService.createEmptyHistoryList(),
                        reqObj = HistoryService.createHistoryRequest(sentData, receivedData, path, null, operation, status, null, null, $scope.getApiCallback);

                    reqObj.refresh($scope.getApiCallback);

                    $scope.requestList.addRequestToList(reqObj);
                    $scope.requestList.saveToStorage();
                }
            };

            $scope.reqHistoryFunc = function(){
                $scope.popupHistory.show = !$scope.popupHistory.show;

                $scope.requestList.loadListFromStorage();
                $scope.collectionList.loadListFromStorage();
                $scope.requestList.show = false;
            };

            $scope.showCollBox = function(req, edit){
                $scope.collectionBoxView = true;
                $scope.$broadcast('COLL_CLEAR_VAL_SET_REQ', req, edit);
            };


            $scope.hideCollBox = function(){
                $scope.collectionBoxView = false;
            };

            $scope.saveElemToList = function(elem) {
                $scope.collectionList.addRequestToList(elem);
                $scope.collectionList.saveToStorage();
            };

            $scope.saveParamToList = function(elem, oldElem) {
                $scope.parameterList.saveRequestToList(elem, oldElem);
            };

            $scope.deleteRequestItem = function(elem, list){
                $scope[list].deleteRequestItem(elem);
                $scope[list].saveToStorage();
            };

            $scope.clearHistoryData = function(list){
                $scope[list].clear();
                $scope[list].saveToStorage();
            };

            var clearFileInputValue = function() {
                var el = document.getElementById("upload-collection");
                el.value = '';
            };

            $scope.exportHistoryData = function() {
                var cListJSON = localStorage.getItem("collectionList");

                HandleFileService.downloadFile('requestCollection.json', cListJSON, 'json', 'charset=utf-8', function(){
                    $scope.setStatusMessage('success', 'EXPORT_COLLECTIONS_SUCCESS');
                },function(e){
                    if(e == -1) {
                        $scope.setStatusMessage('danger', 'EXPORT_COLLECTIONS_ERROR_BROWSER');
                    }
                    else {
                        $scope.setStatusMessage('danger', 'EXPORT_COLLECTIONS_ERROR', e);
                        console.error('ExportCollection error:', e);
                    }
                });
            };

            $scope.readCollectionFromFile = function($fileContent) {
                var data = $fileContent,
                    checkArray = ['sentData','receivedData','path','group','parametrizedPath','method','status','name'];

                if(data && HistoryService.validateFile(data, checkArray)){
                    try {
                        $scope.collectionList.loadListFromFile(data);
                        $scope.collectionList.saveToStorage();
                        $scope.setStatusMessage('success', 'LOAD_COLLECTIONS_SUCCESS');
                        clearFileInputValue();
                    }catch(e) {
                        clearFileInputValue();
                        $scope.setStatusMessage('danger', 'PARSE_JSON_FILE_ERROR', e);
                        console.error('DataStorage error:', e);
                    }
                }else{
                    $scope.setStatusMessage('danger', 'PARSE_JSON_FILE_ERROR');
                    clearFileInputValue();
                }
            };

            $scope.checkParamIsNotInList = function(req) {
                var regexp = /<<([^>]+)>>/g;
                var sParam = angular.toJson(req).match(regexp);

                return sParam && sParam.some(function(parameter) {
                    parameter = parameter.replace(/[<>]/g, '');

                    return $filter('filter')($scope.parameterList.list, {'name': parameter}).length < 1;
                });
            };

            $scope.executeCollectionRequest = function(req, dataForView, showData) {
                var sdata = dataForView ? ParsingJsonService.parseJson(dataForView) : req.sentData,
                    path = req.parametrizedPath && showData ? req.parametrizedPath : req.api.buildApiRequestString(),
                    paramResult = $scope.checkParamIsNotInList(sdata);

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
            };

            $scope.groupView = {};

            $scope.setGroupView = function(key) {
                $scope.groupView[key] = false;
            };

            $scope.toggleExpanded = function(key) {
                $scope.groupView[key] = !$scope.groupView[key];
            };

            $scope.$on('LOAD_REQ_DATA', function(){
                $scope.reqHistoryFunc();
            });

        }]);


});
