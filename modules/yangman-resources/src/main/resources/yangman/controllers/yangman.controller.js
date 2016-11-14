define([
    'app/yangman/yangman.filters',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/controllers/yang-form.controller',
    'app/yangman/controllers/requests-list.controller',
    'app/yangman/controllers/request-header.controller',
    'app/yangman/controllers/request-data.controller',
    'app/yangman/services/yangman.services',
    'app/yangman/services/handle-file.services',
    'app/yangman/services/yangman-design.services',
    'app/yangman/services/requests.services',
    'app/yangman/services/parameters.services',
    'app/yangman/services/plugins-unsetter.services',
    'app/yangman/services/history-settings.services',
    'app/yangman/directives/ui-codemirror.directive',
    'app/yangman/directives/read_file.directive',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = [
        '$scope', '$rootScope', 'HistorySettingsService', 'YangmanDesignService', 'RequestBuilderService',
        'EventDispatcherService', 'constants', 'ParametersService', 'PathUtilsService', 'PluginsUnsetterService',
        '$timeout',
    ];

    function YangmanCtrl(
        $scope, $rootScope, HistorySettingsService, YangmanDesignService, RequestBuilderService, EventDispatcherService,
        constants, ParametersService, PathUtilsService, PluginsUnsetterService, $timeout
    ) {
        var main = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';
        $scope.globalViewPath = 'src/app/yangman/views/';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;
        $scope.apis = [];
        $scope.node = null;
        $scope.rightPanelSection = constants.DISPLAY_TYPE_REQ_DATA;
        $scope.augmentations = {};
        $scope.selectedApi = null;
        $scope.selectedSubApi = null;
        $scope.historyReqsSelected = false;
        $scope.requestToShow = null;
        $scope.requestDataToShow = '';
        $scope.parametersList = ParametersService.createEmptyParametersList('yangman_parameters');
        $scope.shownCMHint = false;
        $scope.historySettings = HistorySettingsService.createHistorySettings().loadFromStorage();

        main.selectedMainTab = 0;
        main.leftPanelTab = 0;
        main.jsonView = {
            received: true,
            sent: false,
        };
        main.executingRequestProgress = false;
        main.constants = constants;

        main.init = init;
        main.initModuleDetailHeight = initModuleDetailHeight;
        main.switchedTab = switchedTab;
        main.toggleLeftPanel = toggleLeftPanel;
        main.leftPanelShowModule = leftPanelShowModule;
        main.modulesTreeDisplayed = modulesTreeDisplayed;

        // scope global methods
        $scope.buildRootRequest = buildRootRequest;
        $scope.checkAddingListElement = checkAddingListElement;
        $scope.clearCM = clearCM;
        $scope.rootBroadcast = rootBroadcast;
        $scope.setApi = setApi;
        $scope.setDataStore = setDataStore;
        $scope.setGlobalParams = setGlobalParams;
        $scope.setJsonView = setJsonView;
        $scope.setLeftPanel = setLeftPanel;
        $scope.setModule = setModule;
        $scope.setNode = setNode;
        $scope.setRequestToShow = setRequestToShow;
        $scope.setRightPanelSection = setRightPanelSection;
        $scope.switchSection = switchSection;
        $scope.setParametersList = setParametersList;
        $scope.unsetPlugin = unsetPlugin;

        init();


        /**
         * Start showing progressbar in request header view
         */
        function startExecutingRequestProgress() {
            main.executingRequestProgress = true;
        }


        /**
         * Stop showing progressbar in request header view
         */
        function stopExecutingRequestProgress() {
            main.executingRequestProgress = false;
        }

        /**
         * Set parametersList to $scope to be available for all controllers directly
         * @param parametersList
         */
        function setParametersList(parametersList) {
            $scope.parametersList = parametersList;
        }


        /**
         * Initialization
         */
        function init(){
            $scope.$on(constants.YANGMAN_EXECUTING_REQUEST_PROGRESS_START, startExecutingRequestProgress);
            $scope.$on(constants.YANGMAN_EXECUTING_REQUEST_PROGRESS_STOP, stopExecutingRequestProgress);

            YangmanDesignService.hideMainMenu();
            YangmanDesignService.setDraggableLeftPanel();
            YangmanDesignService.setJsonSplitter(forceCMsRefresh);

            EventDispatcherService.registerHandler(constants.EV_FILL_PATH, fillPathIdentifiersByKey);
            EventDispatcherService.registerHandler(constants.EV_LIST_CHANGED, fillPathIdentifiersByListData);
        }

        /**
         * Initialize module detail height, with timeout
         */
        function initModuleDetailHeight(){
            $timeout(function () {
                YangmanDesignService.setModuleDetailHeight();
            }, 1500);
        }

        /**
         * Method for fill key into request path, used by yangutils via event dispatching
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


        /**
         * Method for bulk filling path identifiers, used by yangutils via event dispatching
         * @param inputs
         */
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
         * Check if the main tab containing tree with modules is displayed
         * @returns {boolean}
         */
        function modulesTreeDisplayed() {
            return main.selectedMainTab === 0;
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

        /**
         * Method for opening model detail tab
         */
        function leftPanelShowModule() {
            if ($scope.node) {
                main.leftPanelTab = 1;
            }
        }

        /**
         * General method for switching different section in application
         * @param param
         * @param section
         */
        function switchSection(param, section){
            $scope[param] = section;
        }

        /**
         * Genereal method for clearing code mirror - both sent and received data, needs to be in $scope to be available
         * everywhere
         */
        function clearCM(){
            $scope.rootBroadcast(constants.YANGMAN_SET_CODEMIRROR_DATA_RECEIVED, { data: JSON.stringify({}) });
            $scope.rootBroadcast(constants.YANGMAN_SET_CODEMIRROR_DATA_SENT, { data: JSON.stringify({}) });
        }


        /**
         * Switcher for module detail and module list
         * @param value
         */
        function setLeftPanel(value) {
            if ( !angular.isUndefined(value) ) {
                main.leftPanelTab = value;
            }
        }

        /**
         * Set global necessary params
         * @param apis
         * @param augmentations
         */
        function setGlobalParams(apis, augmentations){
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
                $scope.$broadcast(constants.YANGMAN_DISABLE_ADDING_LIST_ELEMENT);
            }
        }

        /**
         * Set module to global param
         * @param module
         */
        function setModule(module){
            $scope.selectedModule = module;
        }

        /**
         * Set dataStore to global param, open module detail in left panel
         * @param dataStore
         * @param expand
         * @param leftPanel
         */
        function setDataStore(dataStore, expand, leftPanel){
            $scope.selectedDatastore = dataStore;

            if ( expand ) {
                $scope.node = null;
                setLeftPanel(leftPanel);
                $scope.$broadcast(constants.YANGMAN_MODULE_D_INIT);
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
         * @param setUrl
         * @param clearPathArray
         */
        function setApi(api, subApi, setUrl, clearPathArray){
            $scope.selectedApi = api;
            $scope.selectedSubApi = subApi;

            if ( clearPathArray ){
                PathUtilsService.clearPath($scope.selectedSubApi.pathArray);
            }

            $scope.$broadcast(constants.SET_SEL_OPERATIONS, subApi ? $scope.selectedSubApi.operations : [], setUrl);
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
            forceCMsRefresh();
            YangmanDesignService.setJsonSplitter(forceCMsRefresh);
        }

        /**
         * Force refresh of all codemirror instances
         */
        function forceCMsRefresh(){
            var elems = angular.element(document).find('.CodeMirror');
            for (var i = 0; i < elems.length; i++){
                var cmInstance = elems[i].CodeMirror;
                cmInstance._handlers.changes[0](cmInstance);
            }
        }

        /**
         * Global method for unset plugin
         * @param selectedPlugin
         * @param controller
         */
        function unsetPlugin(controller){
            PluginsUnsetterService.unset($scope, controller);
        }

        /**
         * Checks if the element list should be disabled
         */
        function checkAddingListElement(node) {
            return $scope.node === node && $scope.node.type === 'list' &&
                $scope.node.refKey && $scope.node.refKey.length;
        }
    }

});
