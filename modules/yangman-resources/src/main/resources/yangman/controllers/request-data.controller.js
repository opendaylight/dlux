define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RequestDataCtrl', RequestDataCtrl);

    RequestDataCtrl.$inject = ['$filter', '$mdToast', '$scope', 'RequestsService'];

    function RequestDataCtrl($filter, $mdToast, $scope, RequestsService) {
        var requestData = this;

        requestData.paramsArray = [];
        requestData.data = '';
        requestData.type = null;

        requestData.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
            },
            onLoad: function (cmInstance) {

                cmInstance.data = {
                    parameterListObj: $scope.parametersList,
                    codeFontSize: 14,
                };

                angular.element(cmInstance.display.wrapper).css('fontSize', cmInstance.data.codeFontSize + 'px');

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

                cmInstance.on('keydown', function (codemirror, event) {
                    if (event.altKey) {
                        switch (event.key){
                            case '+':
                                if (cmInstance.data.codeFontSize < 30) {
                                    cmInstance.data.codeFontSize++;
                                }
                                angular.element(cmInstance.display.wrapper).css(
                                    'fontSize',
                                    cmInstance.data.codeFontSize + 'px'
                                );
                                break;
                            case '-':
                                if (cmInstance.data.codeFontSize > 5) {
                                    cmInstance.data.codeFontSize--;
                                }
                                angular.element(cmInstance.display.wrapper).css(
                                    'fontSize',
                                    cmInstance.data.codeFontSize + 'px'
                                );
                                break;
                        }

                    }
                });


            },
        };

        // methods
        requestData.init = init;
        requestData.showCMHint = showCMHint;

        /**
         * Set code mirror theme and readonly property considering requestData.type
         */
        function initEditorOptions() {
            requestData.dataEditorOptions.theme = requestData.type === 'RECEIVED' ? 'eclipse-disabled' : 'eclipse';
            requestData.dataEditorOptions.readOnly = requestData.type === 'RECEIVED';
        }


        /**
         * Show hints for first codemirror instancesk
         */
        function showCMHint(type) {

            if (!localStorage.getItem('yangman_cm_hint_got_it')){

                $mdToast.show(
                    $mdToast.simple()
                        .textContent($filter('translate')('YANGMAN_CM_FONT_SIZE_HINT'))
                        .action($filter('translate')('YANGMAN_CM_HINT_DONT_SHOW'))
                        .position('top right')
                        .parent(angular.element('.yangmanModule__right-panel__req-data__cm-' + type))
                        .hideDelay(10000)
                ).then(function (response){
                    if (response === 'ok') {
                        localStorage.setItem('yangman_cm_hint_got_it', 1);
                    }
                });
            }
        }

        /**
         * Initialization
         * @param type
         */
        function init(type){
            requestData.type = type;
            initEditorOptions();

            showCMHint(type);

            $scope.$on('YANGMAN_SET_CODEMIRROR_DATA_' + type, function (event, args){
                requestData.data = args.params.data;
                showCMHint(type);
            });

            $scope.$on('YANGMAN_GET_CODEMIRROR_DATA_' + type, function (event, args){
                args.params.reqData = requestData.data;
            });


        }


    }

});

