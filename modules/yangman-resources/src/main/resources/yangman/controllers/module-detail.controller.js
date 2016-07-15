define([
    'app/yangman/yangman.module',
    'app/yangman/directives/abn-tree.directive',
], function (yangman) {
    'use strict';

    yangman.register.controller('ModuleDetailCtrl', ModuleDetailCtrl);

    ModuleDetailCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'YangmanService', 'PathUtilsService'];

    function ModuleDetailCtrl($scope, $rootScope, $timeout, YangmanService, PathUtilsService) {
        var moduleDetail = this;

        moduleDetail.treeApis = [];
        moduleDetail.selectedInnerDatastore = null;

        // methods
        moduleDetail.setApiNode = setApiNode;
        moduleDetail.setDataDetailStore = setDataDetailStore;

        // WATCHERS
        $scope.$on('YANGMAN_MODULE_D_INIT', function (){
            init();
        });

        /**
         * Initialization
         */
        function init(){
            $timeout(function () {
                moduleDetail.selectedDataStoreIndex =
                    YangmanService.getDataStoreIndex($scope.selectedModule.children, $scope.selectedDatastore.label);
                moduleDetail.treeApis = $scope.selectedDatastore.children;
            });
        }

        /**
         * Set global selected yang node
         * @param apiIndex
         * @param subApiIndex
         */
        function setApiNode(apiIndex, subApiIndex){

            if (apiIndex !== undefined && subApiIndex !== undefined ) {

                $scope.setApi($scope.apis[apiIndex], $scope.apis[apiIndex].subApis[subApiIndex], true);
                $scope.setNode($scope.selectedSubApi.node);
                PathUtilsService.clearPath($scope.selectedSubApi.pathArray);
                $scope.clearCM();
            }
        }

        /**
         * Set datastore to global param
         * @param dataStore
         */
        function setDataDetailStore(dataStore){
            $scope.setDataStore(dataStore);
            $scope.setApi($scope.selectedApi, null);
            $scope.setNode(null);
            moduleDetail.treeApis = dataStore.children;
        }
    }

});
