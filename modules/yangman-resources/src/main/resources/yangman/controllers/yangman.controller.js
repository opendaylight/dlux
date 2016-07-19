define([
    'app/yangman/yangman.filters',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/controllers/yang-form.controller',
    'app/yangman/controllers/requests-list.controller',
    'app/yangman/controllers/request-header.controller',
    'app/yangman/controllers/request-data.controller',
    'app/yangman/services/yangman.services',
    'app/yangman/services/yangman-design.services',
    'app/yangman/services/requests.services',
    'app/yangman/services/parameters.services',
    'app/yangman/directives/ui-codemirror.directive',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = [
        '$mdDialog', '$scope', '$rootScope', 'YangmanDesignService', 'RequestBuilderService',
        'EventDispatcherService', 'constants', 'PathUtilsService',
    ];

    function YangmanCtrl(
        $mdDialog, $scope, $rootScope, YangmanDesignService, RequestBuilderService,
        EventDispatcherService, constants, PathUtilsService
    ) {
        var main = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';
        $scope.globalViewPath = 'src/app/yangman/views/';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;
        $scope.apis = [];
        $scope.node = null;
        $scope.rightPanelSection = 'req-data';
        $scope.augmentations = {};
        $scope.selectedApi = null;
        $scope.selectedSubApi = null;
        $scope.historyReqsSelected = false;
        $scope.requestToShow = null;
        $scope.requestDataToShow = '';
        $scope.parametersList = null;

        main.selectedMainTab = 0;
        main.leftPanelTab = 0;
        main.jsonView = {
            received: true,
            sent: false,
        };

        // methods
        main.init = init;
        main.switchedTab = switchedTab;
        main.toggleLeftPanel = toggleLeftPanel;

        // scope global methods
        $scope.buildRootRequest = buildRootRequest;
        $scope.broadcastFromRoot = broadcastFromRoot;
        $scope.rootBroadcast = rootBroadcast;
        $scope.setApi = setApi;
        $scope.setDataStore = setDataStore;
        $scope.setGlobalParams = setGlobalParams;
        $scope.setHistoryReqsSelected = setHistoryReqsSelected;
        $scope.setJsonView = setJsonView;
        $scope.setModule = setModule;
        $scope.setNode = setNode;
        $scope.setRequestToShow = setRequestToShow;
        $scope.setRightPanelSection = setRightPanelSection;
        $scope.switchSection = switchSection;
        $scope.setParametersList = setParametersList;

        init();

        /**
         * Set parametersList
         * @param parametersList
         */
        function setParametersList(parametersList) {
            $scope.parametersList = parametersList;
        }

        /**
         * Set if any history requests are selected in history tab
         * @param {boolean} selected
         */
        function setHistoryReqsSelected(selected) {
            $scope.historyReqsSelected = selected;
        }

        /**
         * Broadcast from this main controller to all children ctrls
         * @param eventName
         * @param val
         */
        function broadcastFromRoot(eventName, val) {
            $scope.$broadcast(eventName, val);
        }
        /**
         * Initialization
         */
        function init(){
            YangmanDesignService.hideMainMenu();

            EventDispatcherService.registerHandler(constants.EV_FILL_PATH, fillPathIdentifiersByKey);
            EventDispatcherService.registerHandler(constants.EV_LIST_CHANGED, fillPathIdentifiersByListData);

        }

        /**
         * Method for fill key into request path
         * @param inputs
         */
        function fillPathIdentifiersByKey(inputs) {
            var node = inputs[0],
                value = inputs[1] || '';

            if ($scope.selectedSubApi && node.parent && $scope.selectedSubApi.node.id === node.parent.id) {
                var identifiers =
                    $scope.selectedSubApi.pathArray[$scope.selectedSubApi.pathArray.length - 1].identifiers;

                PathUtilsService.fillIdentifiers(identifiers, node.label, value);
            }
        }

        // TODO :: description
        function fillPathIdentifiersByListData(inputs) {
            var node = inputs[0];

            if ($scope.selectedSubApi && node && $scope.selectedSubApi.node.id === node.id) {
                var identifiers =
                        $scope.selectedSubApi.pathArray[$scope.selectedSubApi.pathArray.length - 1].identifiers,
                    keys = node.refKey;

                keys.forEach(function (key) {
                    PathUtilsService.fillIdentifiers(identifiers, key.label, key.value);
                });
            }
        }

        /**
         * Set switched tab index
         */
        function switchedTab(index){
            main.selectedMainTab = index;
        }

        /**
         * Switcher between modules list and module detail
         */
        function toggleLeftPanel(){
            main.leftPanelTab = (main.leftPanelTab + 1) % 2;
        }

        function setLeftPanel(value) {
            if ( !angular.isUndefined(value) ) {
                main.leftPanelTab = value;
            }
        }

        // TODO :: description
        function switchSection(param, section){
            $scope[param] = section;
        }


        // SETTERS

        /**
         * Set global necessary params
         * @param apis
         */
        function setGlobalParams(apis, augmentations){
            // console.info('INFO :: apis list ', apis);
            // console.info('INFO :: augmentations ', augmentations);
            $scope.apis = apis;
            $scope.augmentations = augmentations;
        }

        /**
         * Set node to global param
         * @param node
         */
        function setNode(node){
            $scope.node = node;

            if ( $scope.node ) {
                $scope.node.clear();
            }
            // console.info('INFO :: selected node ', $scope.node);
            // console.info('INFO :: selected datastore', $scope.selectedDatastore);
        }

        /**
         * Set module to global param
         * @param module
         */
        function setModule(module){
            $scope.selectedModule = module;
        }

        /**
         * Set dataStore to global param && open module detail in left panel
         * @param dataStore
         * @param expand
         */
        function setDataStore(dataStore, expand, leftPanel){
            $scope.selectedDatastore = dataStore;

            if ( expand ) {
                $scope.node = null;
                // toggleLeftPanel(leftPanel);
                setLeftPanel(leftPanel);
                $scope.$broadcast('YANGMAN_MODULE_D_INIT');
            } else {

                if ( $scope.node ) {
                    $scope.node.clear();
                }
            }
        }

        /**
         * Build request json from root node
         */
        function buildRootRequest() {
            var obj = {};
            $scope.node.buildRequest(RequestBuilderService, obj, $scope.node.module);
            return obj;
        }

        /**
         * Set api and sub api to global param
         * @param api
         * @param subApi
         */
        function setApi(api, subApi){
            $scope.selectedApi = api;
            $scope.selectedSubApi = subApi;

            $scope.$broadcast('SET_SEL_OPERATIONS', subApi ? $scope.selectedSubApi.operations : []);
        }

        /**
         * Call broadcast from root to child controllers
         * @param broadcast
         * @param params
         * @param cbk
         */
        function rootBroadcast(broadcast, params, cbk){
            $scope.$broadcast(broadcast, { params: params, cbk: cbk });
        }

        /**
         * Set request from history or collections to show data in code mirror
         * @param reqObj
         * @param {'sentData'|'receivedData'} dataType
         */
        function setRequestToShow(reqObj, dataType) {
            $scope.requestToShow = reqObj;
            $scope.requestDataToShow = dataType;
        }

        /**
         * Set rightPanelSection to display current section in right panel
         * @param section 'form', 'req-data'
         */
        function setRightPanelSection(section) {
            $scope.rightPanelSection = section;
        }

        /**
         * Which codemirror instances will be displayed
         * @param received
         * @param sent
         */
        function setJsonView(received, sent){
            main.jsonView.received = received;
            main.jsonView.sent = sent;
        }

    }

});
