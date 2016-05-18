define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('ModulesListCtrl', ModulesListCtrl);

    ModulesListCtrl.$inject = ['$scope', '$rootScope', 'YangUtilsService', 'PluginHandlerService'];

    function ModulesListCtrl($scope, $rootScope, YangUtilsService, PluginHandlerService) {
        var vm = this;

        vm.treeApis = [];

        // methods
        vm.setDataStore = setDataStore;
        vm.setModule = setModule;


        /**
         * Initialization
         */
        function init(){
            loadApis();
        }

        init();

        /**
         * Load apis and modules
         */
        function loadApis() {
            vm.apis = [];
            vm.allNodes = [];
            vm.treeApis = [];
            vm.augmentations = {};

            // processingModulesCallback();
            YangUtilsService.generateNodesToApis(function (apis, allNodes, augGroups) {
                vm.apis = apis;
                vm.allNodes = allNodes;
                vm.augmentations = augGroups;
                console.info('INFO :: got data', vm.apis, vm.allNodes, vm.augmentations);
                vm.treeApis = YangUtilsService.generateApiTreeData(apis);
                console.info('INFO :: tree api', vm.treeApis);
                // $scope.processingModulesSuccessCallback();

                PluginHandlerService.plugAll(vm.apis, vm);
                // $scope.$broadcast('LOAD_REQ_DATA');
            }, function (e) {
                // $scope.processingModulesErrorCallback(e);
            });
        }

        /**
         * Set and expand module in tree
         */
        function setModule(module){
            module.expanded = !module.expanded;
            $scope.$emit('YANGMAN_SET_MODULE', module);
        }

        /**
         * Set data store || rpc
         * @param dataStore
         */
        function setDataStore(dataStore, module){
            $scope.$emit('YANGMAN_SET_MODULE', module);
            $scope.$emit('YANGMAN_SET_DATASTORE', dataStore);
        }
    }

});
