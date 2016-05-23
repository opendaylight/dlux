define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/services/yangman.services',
    'app/yangman/services/yangman-design.services',
], function (yangman) {
    'use strict';

    yangman.register.controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = ['$scope', '$rootScope', 'YangmanDesignService'];

    function YangmanCtrl($scope, $rootScope, YangmanDesignService) {
        var main = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;
        $scope.apis = [];
        $scope.node = null;

        main.currentPath = 'src/app/yangman/views/';
        main.selectedMainTab = 0;
        main.leftPanelTab = 0;

        // methods
        main.init = init;
        main.switchedTab = switchedTab;
        main.toggleLeftPanel = toggleLeftPanel;

        // scope global methods
        $scope.setApis = setApis;
        $scope.setNode = setNode;
        $scope.setModule = setModule;
        $scope.setDataStore = setDataStore;

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


        // SETTERS

        /**
         * Set Apis to global param
         * @param apis
         */
        function setApis(apis){
            console.info('INFO :: apis list ', apis);
            $scope.apis = apis;
        }

        /**
         * Set node to global param
         * @param node
         */
        function setNode(node){
            $scope.node = node;
            $scope.node.clear();
            console.info('INFO :: selected node ', $scope.node);
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

    }

});
