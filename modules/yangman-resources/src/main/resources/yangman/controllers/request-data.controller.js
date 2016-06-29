define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RequestDataCtrl', RequestDataCtrl);

    RequestDataCtrl.$inject = ['$scope', 'RequestsService'];

    function RequestDataCtrl($scope, RequestsService) {
        var requestData = this;

        requestData.paramsArray = [];
        requestData.data = '';
        requestData.type = null;

        requestData.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
            onLoad: function (cmInstance) {

                cmInstance.on('changes', function () {
                    if (angular.isFunction(cmInstance.showHint)) {
                        cmInstance.showHint();
                    }
                });

                cmInstance.on('cursorActivity', function () {
                    var lineString = cmInstance.getLine(cmInstance.getCursor().line);
                    requestData.paramsArray = RequestsService.scanDataParams($scope.parametersList, lineString);

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });

                cmInstance.data = { parameterListObj: $scope.parametersList };

            },
        };

        // methods
        requestData.init = init;

        /**
         * Set code mirror theme and readonly property considering requestData.type
         */
        function initEditorOptions() {
            requestData.dataEditorOptions.theme = requestData.type === 'RECEIVED' ? 'eclipse-disabled' : 'eclipse';
            requestData.dataEditorOptions.readOnly = requestData.type === 'RECEIVED';
        }



        /**
         * Initialization
         * @param type
         */
        function init(type){
            requestData.type = type;
            initEditorOptions();

            $scope.$on('YANGMAN_SET_CODEMIRROR_DATA_' + type, function (event, args){
                requestData.data = args.params.data;
            });

            $scope.$on('YANGMAN_GET_CODEMIRROR_DATA_' + type, function (event, args){
                args.params.reqData = requestData.data;
            });


        }


    }

});

