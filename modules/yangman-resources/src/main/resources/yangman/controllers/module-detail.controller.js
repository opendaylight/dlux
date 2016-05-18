define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('ModuleDetailCtrl', ModuleDetailCtrl);

    ModuleDetailCtrl.$inject = ['$scope', '$rootScope'];

    function ModuleDetailCtrl($scope, $rootScope) {
        var vm = this;

        vm.selectedDataStore = 0;

        /**
         * Initialization
         */
        function init(){
            console.warn('ModuleDetailCtrl', $scope.selectedModule.label, $scope.selectedDatastore);
            vm.selectedDataStore = $scope.selectedModule.children.indexOf($scope.selectedDatastore);
        }

        $scope.$on('YANGMAN_MODULE_D_INIT', function (){
            init();
        });
    }

});
