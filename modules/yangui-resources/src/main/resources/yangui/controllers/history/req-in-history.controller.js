define([], function() {
    angular.module('app.yangui').controller('reqInHistoryCtrl', ['$scope',

        function ($scope) {

            $scope.rList = null;

            $scope.init = function (list) {
                $scope.rList = list;
            };

            $scope.showData = false;

            $scope.showShistoryData  = function(){
                $scope.$broadcast('YANGUI_SHOW_SEND_HISTORY_DATA');
                $scope.expandHistoryData();
            };

            $scope.showRhistoryData  = function(){
                $scope.$broadcast('YANGUI_SHOW_RECEIVED_HISTORY_DATA');
                $scope.expandHistoryData();
            };

            $scope.expandHistoryData = function(){
                $scope.showData = !$scope.showData;
            };

            $scope.executeRequest = function(){
                $scope.$broadcast('YANGUI_EXECUTE_REQ');
            };

            $scope.fillRequest = function(){
                $scope.$broadcast('YANGUI_FILL_REQ');
            };
        }]);

});
