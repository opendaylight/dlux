define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('ModulesListCtrl', ModulesListCtrl);

    ModulesListCtrl.$inject = ['$scope', '$rootScope', 'YangUtilsService', 'PluginHandlerService'];

    function ModulesListCtrl($scope, $rootScope, YangUtilsService, PluginHandlerService) {
        var modulesList = this;

        modulesList.treeApis = [];

        // methods
        modulesList.setDataStore = setDataStore;
        modulesList.setModule = setModule;

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
            modulesList.apis = [];
            modulesList.allNodes = [];
            modulesList.treeApis = [];
            modulesList.augmentations = {};

            // processingModulesCallback();
            YangUtilsService.generateNodesToApis(function (apis, allNodes, augGroups) {
                modulesList.apis = apis;
                modulesList.allNodes = allNodes;
                modulesList.augmentations = augGroups;
                console.info('INFO :: got data', modulesList.apis, modulesList.allNodes, modulesList.augmentations);
                modulesList.treeApis = YangUtilsService.generateApiTreeData(apis);
                console.info('INFO :: tree api', modulesList.treeApis);
                // $scope.processingModulesSuccessCallback();

                PluginHandlerService.plugAll(modulesList.apis, modulesList);
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
