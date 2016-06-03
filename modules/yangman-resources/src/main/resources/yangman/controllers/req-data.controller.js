define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('ReqDataCtrl', ReqDataCtrl);

    ReqDataCtrl.$inject = ['$scope'];

    function ReqDataCtrl($scope) {
        var vm = this;

        vm.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'eclipse',
            readOnly: false,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
        };


        vm.getDataEditorOptions = getDataEditorOptions;

        $scope.$on('YANGMAN_REFRESH_CM_DATA', refreshData);

        refreshData();


        /**
         * Refresh data using history request service
         */
        function refreshData() {
            vm.data = $scope.requestToShow.setDataForView(true, $scope.requestToShow[$scope.requestDataToShow]);
        }

        /**
         *
         * @param read
         * @param theme
         * @returns {{mode: string, lineNumbers: boolean, theme: string, readOnly: boolean, lineWrapping: boolean, matchBrackets: boolean, extraKeys: {Ctrl-Space: string}, onLoad: Function}|*}
         */
        function getDataEditorOptions(read, theme){
            vm.dataEditorOptions.readOnly = read;
            vm.dataEditorOptions.theme = theme;

            return vm.dataEditorOptions;
        }



    }

});

