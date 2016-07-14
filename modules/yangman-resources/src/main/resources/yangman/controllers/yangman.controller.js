define([
    'app/yangman/yangman.filters',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/controllers/yang-form.controller',
    'app/yangman/services/yangman.services',
    'app/yangman/services/yangman-design.services',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = ['$scope', '$rootScope', 'YangmanDesignService', 'RequestBuilderService'];

    function YangmanCtrl($scope, $rootScope, YangmanDesignService, RequestBuilderService) {
        var main = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';
        $scope.globalViewPath = 'src/app/yangman/views/';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;
        $scope.apis = [];
        $scope.node = null;
        $scope.rightPanelSection = 'form';
        $scope.augmentations = {};


        main.selectedMainTab = 0;
        main.leftPanelTab = 0;

        // methods
        main.init = init;
        main.switchedTab = switchedTab;
        main.toggleLeftPanel = toggleLeftPanel;

        // scope global methods
        $scope.buildRootRequest = buildRootRequest;
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
            $scope.node.clear();
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
        function setDataStore(dataStore, expand){
            $scope.selectedDatastore = dataStore;

            if ( expand ) {
                toggleLeftPanel();
                $scope.$broadcast('YANGMAN_MODULE_D_INIT');
            }
        }

        /**
         * Build request json from root node
         */
        function buildRootRequest() {
            var obj = {};
            $scope.node.buildRequest(RequestBuilderService, obj, $scope.node.module);
        }

    }

});
