define([
    'app/yangman/services/plugins-handler.services',
], function () {
    'use strict';

    angular.module('app.yangman').controller('ModulesListCtrl', ModulesListCtrl);

    ModulesListCtrl.$inject = ['$scope', '$rootScope', '$mdToast', 'YangUtilsService', 'PluginsHandlerService',
                                '$filter', '$timeout'];

    function ModulesListCtrl($scope, $rootScope, $mdToast, YangUtilsService, PluginsHandlerService, $filter, $timeout) {
        var modulesList = this;

        modulesList.treeApis = [];
        modulesList.showLoadingBox = true;
        modulesList.moduleListTitle = '';
        modulesList.search = '';

        // methods
        modulesList.clearFilter = clearFilter;
        modulesList.customSearch = customSearch;
        modulesList.checkSelectedModule = checkSelectedModule;
        modulesList.setDataStore = setDataStore;
        modulesList.setModule = setModule;

        // watchers
        $scope.$on('YANGMAN_GET_API_TREE_DATA', function (event, args) {
            (args.cbk || angular.noop)(modulesList.treeApis);
        });

        // set tree apis data
        $scope.$on('YANGMAN_SET_API_TREE_DATA', function (event, args) {
            modulesList.treeApis = args.params;
            modulesList.showLoadingBox = false;
            showToastInfoBox('YANGMAN_LOADED_MODULES');
        });

        // show hide loading box
        $scope.$on('YANGMAN_SET_LOADING_BOX', function (event, args){
            modulesList.showLoadingBox = args.params;
            (args.cbk || angular.noop)();
        });

        // show info box with custom title
        $scope.$on('YANGMAN_SHOW_TOAST', function (event, args) {
            showToastInfoBox(args.params);
        });

        $scope.$on('YANGMAN_SET_MODULE_LIST_TITLE', function (event, args) {
            modulesList.moduleListTitle = args.params;
        });

        /**
         * Initialization
         */
        function init(){
            loadApis();
        }

        init();

        /**
         * Check if module and one of it datastore is selected
         * @param module
         * @returns {boolean|*|Function|o}
         */
        function checkSelectedModule(module){
            var haveSelectedDS = [];

            if ( $scope.selectedDatastore && (module === $scope.selectedModule)) {
                haveSelectedDS = $scope.selectedModule.children.filter(function(item){
                   return item === $scope.selectedDatastore;
                });
            }

            return haveSelectedDS.length;
        }

        /**
         * Custom search function for searching by api label
         * @param api
         */
        function customSearch(api){
            return api.label.toLowerCase().indexOf(modulesList.search.toLowerCase()) > -1;
        }

        /**
         * Clear current ctrl search value
         */
        function clearFilter(){
            modulesList.search = '';
        }

        /**
         * Load apis and modules
         */
        function loadApis() {
            modulesList.allNodes = [];
            modulesList.treeApis = [];

            modulesList.showLoadingBox = true;

            YangUtilsService.generateNodesToApis(function (apis, allNodes, augGroups) {
                $scope.setGlobalParams(apis, augGroups);
                modulesList.allNodes = allNodes;
                // console.info('INFO :: got data', apis, modulesList.allNodes, modulesList.augmentations);
                modulesList.treeApis = YangUtilsService.generateApiTreeData(apis);
                 //console.info('INFO :: tree api', modulesList.treeApis);
                // $scope.processingModulesSuccessCallback();
                modulesList.showLoadingBox = false;
                showToastInfoBox('YANGMAN_LOADED_MODULES');

                PluginsHandlerService.plugAll(apis, modulesList);
                // $scope.$broadcast('LOAD_REQ_DATA');
            }, function () {
                showToastInfoBox('YANGMAN_LOADED_MODULES_ERROR');
                modulesList.showLoadingBox = false;
            });
        }

        /**
         * Set and expand module in tree
         */
        function setModule(module, e){
            if ( $(e.target).hasClass('top-element') ) {
                module.expanded = !module.expanded;
                //$scope.setModule(module);
            }
        }

        /**
         * Set data store || rpc
         * @param dataStore
         * @param module
         */
        function setDataStore(dataStore, module){
            $scope.setModule(module);
            $scope.setDataStore(dataStore, true, 1);
        }

        /**
         * Method for showing toast box
         * @param text
         */
        function showToastInfoBox(text){
            $timeout(function(){
                $mdToast.show(
                    $mdToast.simple()
                        .textContent($filter('translate')(text))
                        .position('bottom left')
                        .parent(angular.element('.yangmanModule__left-panel'))
                        .hideDelay(3000)
                );
            }, 500);
        }
    }

});
