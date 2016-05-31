define([], function () {
    'use strict';
    angular.module('app.yangui').controller('ReqInHistoryCtrl', ReqInHistoryCtrl);

    ReqInHistoryCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function ReqInHistoryCtrl($scope) {

        $scope.rList = null;
        $scope.showData = false;

        $scope.executeRequest = executeRequest;
        $scope.expandHistoryData = expandHistoryData;
        $scope.fillRequest = fillRequest;
        $scope.init = init;
        $scope.showRhistoryData  = showRhistoryData;
        $scope.showShistoryData  = showShistoryData;

        function init(list) {
            $scope.rList = list;
        }

        function showShistoryData(){
            $scope.$broadcast('YANGUI_SHOW_SEND_HISTORY_DATA');
            $scope.expandHistoryData();
        }

        function showRhistoryData(){
            $scope.$broadcast('YANGUI_SHOW_RECEIVED_HISTORY_DATA');
            $scope.expandHistoryData();
        }

        function expandHistoryData(){
            $scope.showData = !$scope.showData;
        }

        function executeRequest(){
            $scope.$broadcast('YANGUI_EXECUTE_REQ');
        }

        function fillRequest(){
            $scope.$broadcast('YANGUI_FILL_REQ');
        }
    }

});
