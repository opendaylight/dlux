define([
    'app/yangman/yangman.module',
], function () {
    'use strict';

    angular.module('app.yangman').controller('ModulesListCtrl', ModulesListCtrl);

    ModulesListCtrl.$inject = ['$scope', '$mdToast', 'YangUtilsService',
                                '$filter'];

    function ModulesListCtrl($scope, $mdToast, YangUtilsService, $filter) {
        var modulesList = this;

        modulesList.treeApis = [];
        modulesList.showLoadingBox = true;

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
            modulesList.allNodes = [];
            modulesList.treeApis = [];
            modulesList.augmentations = {};

            modulesList.showLoadingBox = true;

            YangUtilsService.generateNodesToApis(function (apis, allNodes, augGroups) {
                $scope.setApis(apis);
                modulesList.allNodes = allNodes;
                modulesList.augmentations = augGroups;
                console.info('INFO :: got data', apis, modulesList.allNodes, modulesList.augmentations);
                modulesList.treeApis = YangUtilsService.generateApiTreeData(apis);
                console.info('INFO :: tree api', modulesList.treeApis);
                // $scope.processingModulesSuccessCallback();
                modulesList.showLoadingBox = false;
                showToastInfoBox('YANGMAN_LOADED_MODULES');

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
                $scope.setModule(module);
            }
        }

        /**
         * Set data store || rpc
         * @param dataStore
         * @param module
         */
        function setDataStore(dataStore, module){
            $scope.setModule(module);
            $scope.setDataStore(dataStore, true);
        }

        function showToastInfoBox(text){
            $mdToast.show(
                $mdToast.simple()
                    .textContent($filter('translate')(text))
                    .position('bottom left')
                    .hideDelay(3000)
            );
        }
    }

});
