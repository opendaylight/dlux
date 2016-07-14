define([
    'app/yangman/yangman.filters',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/controllers/yang-form.controller',
    'app/yangman/controllers/request-header.controller',
    'app/yangman/services/yangman.services',
    'app/yangman/services/yangman-design.services',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = [
        '$scope', '$rootScope', 'YangmanDesignService', 'RequestBuilderService', 'EventDispatcherService', 'constants',
        'PathUtilsService',
    ];

    function YangmanCtrl(
        $scope, $rootScope, YangmanDesignService, RequestBuilderService, EventDispatcherService, constants,
        PathUtilsService
    ) {
        var main = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';
        $scope.globalViewPath = 'src/app/yangman/views/';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;
        $scope.apis = [];
        $scope.node = null;
        $scope.rightPanelSection = 'form';
        $scope.augmentations = {};
        $scope.selectedApi = null;
        $scope.selectedSubApi = null;

        main.selectedMainTab = 0;
        main.leftPanelTab = 0;

        // methods
        main.init = init;
        main.switchedTab = switchedTab;
        main.toggleLeftPanel = toggleLeftPanel;

        // scope global methods
        $scope.buildRootRequest = buildRootRequest;
        $scope.rootBroadcast = rootBroadcast;
        $scope.setApi = setApi;
        $scope.setGlobalParams = setGlobalParams;
        $scope.setNode = setNode;
        $scope.setModule = setModule;
        $scope.setDataStore = setDataStore;
        $scope.switchSection = switchSection;

        init();

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
        function toggleLeftPanel(value){
            main.leftPanelTab = value || (main.leftPanelTab + 1) % 2;
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
                toggleLeftPanel(leftPanel);
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

    }

});
