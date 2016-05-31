define([], function () {
    'use strict';
    angular.module('app.yangui').controller('ParamBoxCtrl', ParamBoxCtrl);

    ParamBoxCtrl.$inject = ['$scope', 'HistoryService', 'EventDispatcherService', 'constants'];

    // todo: comment the whole controller
    function ParamBoxCtrl($scope, HistoryService, EventDispatcherService, constants) {

        $scope.boxView = false;
        $scope.duplicateParam = null;
        $scope.oldParam = null;
        $scope.paramObj = null;

        $scope.hideParamBox = hideParamBox;
        $scope.saveParam = saveParam;

        $scope.$on('HISTORY_INIT_PARAM', historyInitParam);

        EventDispatcherService.registerHandler(constants.EV_PARAM_EDIT_SUCC, addEditSuccessfull);

        function hideParamBox(){
            $scope.boxView = false;
            $scope.paramObj = $scope.createNewParam();
        }

        function addEditSuccessfull() {
            $scope.hideParamBox();
            $scope.parameterList.saveToStorage();
        }

        function saveParam(){
            $scope.duplicateParam = $scope.parameterList.getParamListObjsByName($scope.paramObj.name, null);
            if (!$scope.duplicateParam.length) {
                $scope.saveParamToList($scope.paramObj, $scope.oldParam);
            }
        }

        function historyInitParam(e, obj){
            if ( obj ){
                $scope.paramObj = obj.clone();
                $scope.oldParam = obj;
                $scope.boxView = true;
            }
        }
    }

});

