define([], function() {
    angular.module('app.yangui').controller('paramBoxCtrl', ['$scope', 'HistoryService', 'EventDispatcherService', 'constants',
        function ($scope, HistoryService, EventDispatcherService, constants) {
            $scope.paramObj = null;
            $scope.oldParam = null;
            $scope.boxView = false;

            $scope.hideParamBox = function(){
                $scope.boxView = false;
                $scope.paramObj = $scope.createNewParam();
            };

            var addEditSuccessfull = function() {
                $scope.hideParamBox();
                $scope.parameterList.saveToStorage();
            };

            EventDispatcherService.registerHandler(constants.EV_PARAM_EDIT_SUCC, addEditSuccessfull);

            $scope.saveParam = function(){
                $scope.saveParamToList($scope.paramObj, $scope.oldParam);
            };

            $scope.$on('HISTORY_INIT_PARAM', function(e, obj){
                if ( obj ){
                    $scope.paramObj = obj.clone();
                    $scope.oldParam = obj;
                    $scope.boxView = true;
                }
            });
        }
    ]);

});
