define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RequestDataCtrl', RequestDataCtrl);

    RequestDataCtrl.$inject = ['$scope'];

    function RequestDataCtrl($scope) {
        var requestData = this;

        requestData.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'eclipse',
            readOnly: false,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
        };

        requestData.data = '';
        requestData.type = null;

        // methods
        requestData.getDataEditorOptions = getDataEditorOptions;
        requestData.init = init;

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
         * @param read
         * @param theme
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
        function getDataEditorOptions(read, theme){
            requestData.dataEditorOptions.readOnly = read;
            requestData.dataEditorOptions.theme = theme;

            return requestData.dataEditorOptions;
        }

    }

});

