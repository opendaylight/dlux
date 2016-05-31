define([], function () {
    'use strict';
    angular.module('app.yangui').controller('ParamsViewCtrl', ParamsViewCtrl);

    ParamsViewCtrl.$inject = ['$scope', 'PathUtilsService', 'YangUtilsService',
        'RequestDataService', 'ParsingJsonService'];

    // todo: comment the whole controller
    function ParamsViewCtrl($scope, PathUtilsService, YangUtilsService, RequestDataService, ParsingJsonService){

        $scope.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'eclipse',
            readOnly: false,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
            onLoad: function (cmInstance){
                setInstanceEvents(cmInstance);
                cmInstance.data = { parameterListObj: $scope.parameterList };
            },
        };
        $scope.isSentData = false;
        $scope.paramsArray = [];
        $scope.paramsBoxView = false;
        $scope.rDataForView = null;
        $scope.sDataForView = null;

        $scope.clearParametrizedData = clearParametrizedData;
        $scope.fillRequestData = fillRequestData;
        $scope.getDataEditorOptions = getDataEditorOptions;
        $scope.hideParamListBox = hideParamListBox;
        $scope.saveParametrizedData = saveParametrizedData;

        $scope.$on('YANGUI_EXECUTE_REQ', executeCollReq);
        $scope.$on('YANGUI_FILL_REQ', fillApiData);
        $scope.$on('YANGUI_SHOW_RECEIVED_HISTORY_DATA', showReceivedHistoryData);
        $scope.$on('YANGUI_SHOW_SEND_HISTORY_DATA', showSendHistoryData);

        function setInstanceEvents(cmInstance){
            cmInstance.on('changes', function (){
                if (angular.isFunction(cmInstance.showHint)) {
                    cmInstance.showHint();
                }
            });

            cmInstance.on('cursorActivity', function (){
                var lineString = cmInstance.getLine(cmInstance.getCursor().line);
                $scope.paramsArray = RequestDataService.scanDataParams($scope.parameterList, lineString);
                $scope.paramsBoxView = $scope.paramsArray.length > 0;

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        }

        function hideParamListBox(){
            $scope.paramsBoxView = false;
        }

        function clearParametrizedData(){
            $scope.req.clearParametrizedData();
            var dataForViewObj = $scope.req.sentData;

            $scope.sDataForView = dataForViewObj ? $scope.req.setDataForView(true, dataForViewObj) : '';
        }

        function fillRequestData(pathElem, identifier) {
            if ($scope.req.api &&
                $scope.req.api.clonedPathArray.indexOf(pathElem) === ($scope.req.api.clonedPathArray.length - 1)) {
                var data = ParsingJsonService.parseJson($scope.sDataForView);
                PathUtilsService.fillListRequestData(data, pathElem.name, identifier.label, identifier.value);
                var strippedData = YangUtilsService.stripAngularGarbage(data, $scope.req.getLastPathDataElemName());

                angular.copy(strippedData, ParsingJsonService.parseJson($scope.sDataForView));
                $scope.sDataForView = JSON.stringify(strippedData, null, 4);
            }

            $scope.req.parametrizedPath = PathUtilsService.translatePathArray($scope.req.api.clonedPathArray).join('/');
        }

        function getDataEditorOptions(read, theme){
            $scope.dataEditorOptions.readOnly = read;
            $scope.dataEditorOptions.theme = theme;

            return $scope.dataEditorOptions;
        }

        function saveParametrizedData(list){
            var parametrizedPath = $scope.req.api.parent.basePath +
                    PathUtilsService.translatePathArray($scope.req.api.clonedPathArray).join('/'),
                jsonParsingErrorClbk = function (e){
                    $scope.setStatusMessage('danger', 'YANGUI_JSON_PARSING_ERROR', e.message);
                },
                newReq = $scope.req.copyWithParametrizationAsNatural(
                    parametrizedPath,
                    $scope.getApiCallback,
                    $scope.sDataForView,
                    jsonParsingErrorClbk
                );

            if (newReq){
                    var paramResult = $scope.checkParamIsNotInList(newReq);

                    if(!paramResult) {
                $scope.req.clearParametrizedData();

                list.addRequestToList(newReq);
                list.saveToStorage();

                $scope.expandHistoryData();
                $scope.setStatusMessage('success', 'YANGUI_PARAMETRIZED_DATA_SAVED', e.message);
                    }
                    else {
                        $scope.setStatusMessage('danger', 'YANGUI_PARAMETER_MISSING_ERROR', e.message);
                        return false;
                    }
            }
            return true;
        }

        function setSentData(isSentData) {
            $scope.isSentData = isSentData ? isSentData : $scope.isSentData;
        }

        function showSendHistoryData() {
            $scope.sDataForView = $scope.req.setDataForView(true, $scope.req.sentData);
            setSentData(true);
        }


        function showReceivedHistoryData() {
            $scope.rDataForView = $scope.req.setDataForView(false, $scope.req.receivedData);
            setSentData(false);
        }

        function executeCollReq(){
            $scope.executeCollectionRequest($scope.req, $scope.sDataForView, $scope.showData);
        }

        function fillApiData(){
            $scope.fillApiAndData($scope.req, $scope.isSentData ? $scope.sDataForView : $scope.rDataForView );
        }
    }

});
