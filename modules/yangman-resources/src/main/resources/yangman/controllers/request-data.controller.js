define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('RequestDataCtrl', RequestDataCtrl);

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
        requestData.getDataEditorOptions = getDataEditorOptions;
        requestData.init = init;


        function setCMInstanceEvents(cmInstance){
            cmInstance.on('changes', function (){
                if (angular.isFunction(cmInstance.showHint)){
                    cmInstance.showHint();
                }
                else {
                    console.error('no showhint func');
                }
            });

            //cmInstance.on('cursorActivity', function (){
            //    var lineString = cmInstance.getLine(cmInstance.getCursor().line);
            //    requestData.paramsArray = RequestsService.scanDataParams($scope.parametersList, lineString);
            //    //$scope.paramsBoxView = $scope.paramsArray.length ? true : false;
            //
            //    if (!$scope.$$phase) {
            //        $scope.$apply();
            //    }
            //});
        }

        /**
         * Initialization
         * @param type
         */
        function init(type){
            requestData.type = type;

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

        /**
         *
         * @returns {
         * {mode: string,
         * lineNumbers: boolean,
         * theme: string,
         * readOnly: boolean,
         * lineWrapping: boolean,
         * matchBrackets: boolean,
         * extraKeys: {Ctrl-Space: string},
         * onLoad: Function}|*
         * }
         */
        function getDataEditorOptions(){

            //requestData.dataEditorOptions.onLoad = function (cmInstance){
            //    cmInstance.data = { parameterListObj: $scope.parametersList || { list: [] } };
            //    setCMInstanceEvents(cmInstance);
            //    cmInstance.refresh();
            //};

            requestData.dataEditorOptions.readOnly = requestData.type === 'RECEIVED';
            requestData.dataEditorOptions.theme = requestData.type === 'RECEIVED' ? 'eclipse-disabled': 'eclipse';

            return requestData.dataEditorOptions;
        }

    }

});

