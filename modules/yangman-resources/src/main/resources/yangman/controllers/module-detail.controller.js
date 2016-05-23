define([
    'app/yangman/yangman.module',
    'app/yangman/directives/abn-tree.directive',
], function (yangman) {
    'use strict';

    yangman.controller('ModuleDetailCtrl', ModuleDetailCtrl);

    ModuleDetailCtrl.$inject = ['$scope', '$rootScope'];

    function ModuleDetailCtrl($scope, $rootScope) {
        var moduleDetail = this;

        moduleDetail.selectedDataStore = 0;
        moduleDetail.apis = [];

        // methods
        moduleDetail.setApiNode = setApiNode;

        /**
         * Initialization
         */
        function init(){
            console.warn('ModuleDetailCtrl', $scope.selectedModule.label, $scope.selectedDatastore);
            moduleDetail.selectedDataStore = $scope.selectedModule.children.indexOf($scope.selectedDatastore);
            moduleDetail.apis = $scope.selectedDatastore.children;
        }

        /**
         * Set global selected yang node
         * @param apiIndex
         * @param subApiIndex
         */
        function setApiNode(apiIndex, subApiIndex){
            console.log('apiIndex, subApiIndex', apiIndex, subApiIndex);
        }

        function setSelectedApis(){

        }

        // WATCHERS
        $scope.$on('YANGMAN_MODULE_D_INIT', function (){
            init();
        });
    }

});
