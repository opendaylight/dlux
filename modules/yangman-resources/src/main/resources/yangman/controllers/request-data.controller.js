define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RequestDataCtrl', RequestDataCtrl);

    RequestDataCtrl.$inject = ['$filter', '$mdToast', '$scope', 'RequestsService', 'constants'];

    function RequestDataCtrl($filter, $mdToast, $scope, RequestsService, constants) {
        var requestData = this,
            cmData = {
                cmInstance: null,
                cmFontSize: 14,
            };

        requestData.paramsArray = [];
        requestData.data = '';
        requestData.type = null;


        // todo: move all cm staff to directive
        requestData.dataEditorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
            },
            onLoad: function (cmInstance) {

                cmData.cmInstance = cmInstance;

                cmInstance.data = {
                    parameterListObj: $scope.parametersList,
                };

                angular.element(cmInstance.display.wrapper).css('fontSize', cmData.cmFontSize + 'px');

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
                                incCMFontSize();
                                angular.element(cmInstance.display.wrapper).css(
                                    'fontSize',
                                    cmData.cmFontSize + 'px'
                                );
                                break;
                            case '-':
                                decCMFontSize();
                                angular.element(cmInstance.display.wrapper).css(
                                    'fontSize',
                                    cmData.cmFontSize + 'px'
                                );
                                break;
                        }

                    }
                });


            },
        };

        requestData.init = init;
        requestData.enlargeCMFont = enlargeCMFont;
        requestData.reduceCMFont = reduceCMFont;

        function incCMFontSize() {
            if (cmData.cmFontSize < 30) {
                cmData.cmFontSize++;
            }
        }

        function decCMFontSize() {
            if (cmData.cmFontSize > 5) {
                cmData.cmFontSize--;
            }
        }

        function enlargeCMFont() {
            incCMFontSize();
            angular.element(cmData.cmInstance.display.wrapper).css(
                'fontSize',
                cmData.cmFontSize + 'px'
            );
        }

        function reduceCMFont() {
            decCMFontSize();
            angular.element(cmData.cmInstance.display.wrapper).css(
                'fontSize',
                cmData.cmFontSize + 'px'
            );
        }

        /**
         * Set code mirror theme and readonly property considering requestData.type
         */
        function initEditorOptions() {
            requestData.dataEditorOptions.theme = requestData.type === constants.REQUEST_DATA_TYPE_RECEIVED ? 'eclipse-disabled' : 'eclipse';
            requestData.dataEditorOptions.readOnly = requestData.type === constants.REQUEST_DATA_TYPE_RECEIVED;
        }

        /**
         * Initialization
         * @param type
         */
        function init(type){
            requestData.type = type;
            initEditorOptions();

            $scope.$on(constants.YANGMAN_SET_CODEMIRROR_DATA + type, function (event, args){
                requestData.data = args.params.data;
            });

            $scope.$on(constants.YANGMAN_GET_CODEMIRROR_DATA + type, function (event, args){
                args.params.reqData = requestData.data;
            });
        }
    }

});
