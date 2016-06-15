define([], function () {
    'use strict';
    angular.module('app.yangui').controller('HistoryParamCtrl', HistoryParamCtrl);

    HistoryParamCtrl.$inject = ['$scope', 'HistoryService', 'HandleFileService'];

    // todo: comment the whole controller
    function HistoryParamCtrl($scope, HistoryService, HandleFileService){

        $scope.createNewParam = createNewParam;
        $scope.exportParametersData = exportParametersData;
        $scope.readParametersFromFile = readParametersFromFile;
        $scope.showParamBox = showParamBox;

        function showParamBox(param){
            $scope.$broadcast('HISTORY_INIT_PARAM', param);
        }

        function createNewParam(){
            return HistoryService.createParameter('', '');
        }

        function clearFileInputValue() {
            var el = document.getElementById('upload-parameters');
            el.value = '';
        }

        function exportParametersData() {
            var cListJSON = localStorage.getItem('parameterList');

            HandleFileService.downloadFile('parameters.json', cListJSON, 'json', 'charset=utf-8', function (){
                $scope.setStatusMessage('success', 'EXPORT_PARAMETERS_SUCCESS');
            }, function (e){
                    if(e == -1) {
                        $scope.setStatusMessage('danger', 'EXPORT_PARAMETERS_ERROR_BROWSER');
                    }
                    else {
                        $scope.setStatusMessage('danger', 'EXPORT_PARAMETERS_ERROR', e);
                        // console.error('ExportCollection error:', e);
                    }
            });
        }

        function readParametersFromFile($fileContent) {
            var data = $fileContent,
                checkArray = ['name', 'value'];

            if (data && HistoryService.validateFile(data, checkArray)) {
                try {
                    $scope.parameterList.loadListFromFile(data);
                    $scope.parameterList.saveToStorage();
                    $scope.setStatusMessage('success', 'LOAD_PARAMETERS_SUCCESS');
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

    }

});
