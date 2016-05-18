define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/modules-list.controller',
    'app/yangman/controllers/module-detail.controller',
    'app/yangman/services/yangman.services',
], function (yangman) {
    'use strict';

    yangman.register.controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = ['$scope', '$rootScope', 'YangmanService'];

    function YangmanCtrl($scope, $rootScope, YangmanService) {
        var vm = this;

        $rootScope.section_logo = 'assets/images/logo_yangman.png';

        $scope.selectedModule = null;
        $scope.selectedDatastore = null;

        vm.currentPath = 'src/app/yangman/views/';
        vm.leftPanelTab = 0;
        vm.selectedMainTab = 0;

        // methods
        vm.init = init;
        vm.switchedTab = switchedTab;
        vm.toggleLeftPanel = toggleLeftPanel;

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
            vm.selectedMainTab = index;
        }

        /**
         * Switcher between modules list and module detail
         */
        function toggleLeftPanel(){
            vm.leftPanelTab = (vm.leftPanelTab + 1) % 2;
            // console.debug(vm.leftPanelTab);
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
