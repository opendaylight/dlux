define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RequestDataCtrl', RequestDataCtrl);

    RequestDataCtrl.$inject = ['$scope', 'RequestsService'];

    function RequestDataCtrl($scope, RequestsService) {
        var requestData = this;

        requestData.paramsArray = [];

        requestData.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'eclipse',
            readOnly: requestData.type === 'RECEIVED',
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
        };

        requestData.data = '';
        requestData.type = null;

        // methods
        requestData.init = init;


        function initCMOpts() {
            requestData.dataEditorOptions.readOnly = requestData.type === 'RECEIVED';
            requestData.dataEditorOptions.theme = requestData.type === 'RECEIVED' ? 'eclipse-disabled' : 'eclipse';

            if (requestData.type === 'SENT') {
                requestData.dataEditorOptions.onLoad = function (cmInstance){
                    cmInstance.data = { parameterListObj: $scope.parametersList || { list: [] } };

                    cmInstance.on('changes', function (){
                        if (angular.isFunction(cmInstance.showHint)){
                            cmInstance.showHint();
                        }
                    });

                    cmInstance.on('cursorActivity', function (){
                        var lineString = cmInstance.getLine(cmInstance.getCursor().line);
                        requestData.paramsArray = RequestsService.scanDataParams($scope.parametersList, lineString);

                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });

                    cmInstance.refresh();
                };
            }
        }

        /**
         * Initialization
         * @param type
         */
        function init(type){
            requestData.type = type;
            initCMOpts();


            // watchers
            $scope.$on('YANGMAN_REFRESH_CM_DATA_' + type, refreshData);

            $scope.$on('YANGMAN_SET_CODEMIRROR_DATA_' + type, function (event, args){
                requestData.data = args.params.data;
            });

            $scope.$on('YANGMAN_GET_CODEMIRROR_DATA_' + type, function (event, args){
                args.params.reqData = requestData.data;
            });

        }

        /**
         * Refresh data using history request service
         */
        function refreshData() {
            requestData.data =
                $scope.requestToShow.setDataForView(true, $scope.requestToShow[$scope.requestDataToShow]);
        }

    }

});

