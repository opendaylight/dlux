define([
    'app/yangman/directives/abn-tree.directive',
], function () {
    'use strict';

    angular.module('app.yangman').controller('ModuleDetailCtrl', ModuleDetailCtrl);

    ModuleDetailCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'YangmanService', 'constants'];

    function ModuleDetailCtrl($scope, $rootScope, $timeout, YangmanService, constants) {
        var moduleDetail = this;

        moduleDetail.treeApis = [];
        moduleDetail.selectedInnerDatastore = null;

        // methods
        moduleDetail.setApiNode = setApiNode;
        moduleDetail.setDataDetailStore = setDataDetailStore;

        // WATCHERS
        $scope.$on(constants.YANGMAN_MODULE_D_INIT, function (){
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

                $scope.setApi($scope.apis[apiIndex], $scope.apis[apiIndex].subApis[subApiIndex], true, true);
                $scope.setNode($scope.selectedSubApi.node);
                $scope.clearCM();
                // let request header ctrl know, that codemirror data should be renewed with data from node
                $scope.rootBroadcast(constants.YANGMAN_CHANGE_TO_JSON);
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
