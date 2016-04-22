define([], function() {
    angular.module('app.yangui').controller('paramsViewCtrl', ['$scope', 'PathUtilsService', 'YangUtilsService',
                                                                'RequestDataService', 'ParsingJsonService',
        function($scope, PathUtilsService, YangUtilsService, RequestDataService, ParsingJsonService){
            $scope.sDataForView = null;
            $scope.rDataForView = null;
            $scope.isSentData = false;
            $scope.paramsArray = [];
            $scope.paramsBoxView = false;

            setInstanceEvents = function(cmInstance){
                cmInstance.on('changes', function(){
                    if(angular.isFunction(cmInstance.showHint)){
                        cmInstance.showHint();
                    }
                });

                cmInstance.on('cursorActivity', function(){
                    var lineString = cmInstance.getLine(cmInstance.getCursor().line);
                    $scope.paramsArray = RequestDataService.scanDataParams($scope.parameterList, lineString);
                    $scope.paramsBoxView = $scope.paramsArray.length ? true : false;

                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            };

            $scope.dataEditorOptions = {
                mode: 'javascript',
                lineNumbers: true,
                theme:'eclipse',
                readOnly: false,
                lineWrapping : true,
                matchBrackets: true,
                extraKeys: {"Ctrl-Space": "autocomplete"},
                onLoad : function(cmInstance){
                    setInstanceEvents(cmInstance);
                    cmInstance.data = {parameterListObj:$scope.parameterList};
                }
            };

            $scope.hideParamListBox = function(){
                $scope.paramsBoxView = false;
            };

            $scope.clearParametrizedData = function(){
                $scope.req.clearParametrizedData();
                var dataForViewObj = $scope.req.sentData;

                $scope.sDataForView = dataForViewObj ? $scope.req.setDataForView(true, dataForViewObj) : '';
            };

            $scope.fillRequestData = function(pathElem, identifier) {
                if($scope.req.api && $scope.req.api.clonedPathArray.indexOf(pathElem) === ($scope.req.api.clonedPathArray.length - 1)) {
                    var data = ParsingJsonService.parseJson($scope.sDataForView);
                    PathUtilsService.fillListRequestData(data, pathElem.name, identifier.label, identifier.value);
                    var strippedData = YangUtilsService.stripAngularGarbage(data, $scope.req.getLastPathDataElemName());

                    angular.copy(strippedData, ParsingJsonService.parseJson($scope.sDataForView));
                    $scope.sDataForView = JSON.stringify(strippedData, null, 4);
                }

                $scope.req.parametrizedPath = PathUtilsService.translatePathArray($scope.req.api.clonedPathArray).join('/');
            };

            $scope.getDataEditorOptions = function(read, theme){
                $scope.dataEditorOptions.readOnly = read;
                $scope.dataEditorOptions.theme = theme;

                return $scope.dataEditorOptions;
            };

            $scope.saveParametrizedData = function(list){
                var parametrizedPath = $scope.req.api.parent.basePath + PathUtilsService.translatePathArray($scope.req.api.clonedPathArray).join('/'),
                    jsonParsingErrorClbk = function(e){$scope.setStatusMessage('danger', 'YANGUI_JSON_PARSING_ERROR', e.message);},
                    newReq = $scope.req.copyWithParametrizationAsNatural(parametrizedPath, $scope.getApiCallback, $scope.sDataForView, jsonParsingErrorClbk);

                if(newReq){
                    $scope.req.clearParametrizedData();

                    list.addRequestToList(newReq);
                    list.saveToStorage();

                    $scope.expandHistoryData();
                    $scope.setStatusMessage('success', 'YANGUI_PARAMETRIZED_DATA_SAVED', e.message);
                }
                return true;
            };

            var setSentData = function(isSentData) {
                $scope.isSentData = isSentData ? isSentData : $scope.isSentData;
            };

            $scope.$on('YANGUI_SHOW_SEND_HISTORY_DATA', function() {
                $scope.sDataForView = $scope.req.setDataForView(true, $scope.req.sentData);
                setSentData(true);
            });

            $scope.$on('YANGUI_SHOW_RECEIVED_HISTORY_DATA', function() {
                $scope.rDataForView = $scope.req.setDataForView(false, $scope.req.receivedData);
                setSentData(false);
            });

            $scope.$on('YANGUI_EXECUTE_REQ', function(){
                $scope.executeCollectionRequest($scope.req, $scope.sDataForView, $scope.showData);
            });

            $scope.$on('YANGUI_FILL_REQ', function(){
                $scope.fillApiAndData($scope.req, $scope.isSentData ? $scope.sDataForView : $scope.rDataForView );
            });
        }]);

});
