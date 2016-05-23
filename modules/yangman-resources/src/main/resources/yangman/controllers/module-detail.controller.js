define([
    'app/yangman/yangman.module',
    'app/yangman/directives/abn-tree.directive',
], function (yangman) {
    'use strict';

    yangman.register.controller('ModuleDetailCtrl', ModuleDetailCtrl);

    ModuleDetailCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'YangmanService'];

    function ModuleDetailCtrl($scope, $rootScope, $timeout, YangmanService) {
        var moduleDetail = this;

        moduleDetail.treeApis = [];
        moduleDetail.selectedApi = null;
        moduleDetail.selectedSubApi = null;
        moduleDetail.selectedInnerDatastore = null;

        // methods
        moduleDetail.setApiNode = setApiNode;
        moduleDetail.setDataDetailStore = setDataDetailStore;

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
            // $scope.selectedOperation = null;

            if (apiIndex !== undefined && subApiIndex !== undefined ) {
                moduleDetail.selectedApi = $scope.apis[apiIndex];
                moduleDetail.selectedSubApi = moduleDetail.selectedApi.subApis[subApiIndex];
                $scope.setNode(moduleDetail.selectedSubApi.node);


                // $scope.selApi = $scope.apis[indexApi];
                // $scope.selSubApi = $scope.selApi.subApis[indexSubApi];

                // $scope.apiType = $scope.selSubApi.pathArray[0].name === 'operational' ? 'operational/':'';
                // $scope.node = $scope.selSubApi.node;
                // $scope.filterRootNode = $scope.selSubApi.node;
                // $scope.node.clear();

                // if($scope.selSubApi && $scope.selSubApi.operations) {
                //    $scope.selectedOperation = $scope.selSubApi.operations[0];
                // }
                // $scope.$broadcast('EV_REFRESH_LIST_INDEX');
                // DesignUtilsService.triggerWindowResize(100);
            } else {
                // $scope.selApi = null;
                // $scope.selSubApi = null;
                // $scope.node = null;
            }
        }

        /**
         * Set datastore to global param
         * @param dataStore
         */
        function setDataDetailStore(dataStore){
            $scope.setDataStore(dataStore);
            moduleDetail.treeApis = dataStore.children;
        }

        // WATCHERS
        $scope.$on('YANGMAN_MODULE_D_INIT', function (){
            init();
        });
    }

});
