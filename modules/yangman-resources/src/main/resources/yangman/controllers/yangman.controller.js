define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/services/yangman.services',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = ['$scope', '$rootScope', 'YangmanService'];

    function YangmanCtrl($scope, $rootScope, YangmanService) {
        var main = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;

        main.currentPath = 'src/app/yangman/views/';
        main.leftPanelTab = 0;
        main.selectedMainTab = 0;

        // methods
        main.init = init;
        main.switchedTab = switchedTab;
        main.toggleLeftPanel = toggleLeftPanel;

        init();

        /**
         * Initialization
         */
        function init(){
            YangmanService.hideMainMenu();
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
            // console.debug(main.leftPanelTab);
        }

        // WATCHERS

        /**
         * Set selected module
         */
        $scope.$on('YANGMAN_SET_MODULE', function (e, module){
            $scope.selectedModule = module;
            console.log('$scope.selectedModule', $scope.selectedModule.label);
        });

        /**
         * Set datastore || rpc
         */
        $scope.$on('YANGMAN_SET_DATASTORE', function (e, datastore){
            $scope.selectedDatastore = datastore;
            $scope.$broadcast('YANGMAN_MODULE_D_INIT');
            toggleLeftPanel();
        });
    }

});
