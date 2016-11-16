define(['angular'], function (angular) {
    'use strict';

    angular.module('app.yangman').service('PluginsUnsetterService', PluginsUnsetterService);

    PluginsUnsetterService.$inject = ['DataBackupService', 'constants'];

    function PluginsUnsetterService(DataBackupService, constants){
        var service = {
            'YANGMAN_CUST_MOUNT_POINTS': unsetMountPoint,
            unset: unset,
        };

        return service;

        /**
         * Method for unset mount point from application
         * @param scope
         */
        function unsetMountPoint(scope){
            var modulesListObj = {};

            DataBackupService.getToScope(
                [
                    'selectedDatastore', 'node', 'apis',
                    'selectedApi', 'selectedSubApi', 'augmentations', 'selectedModule',
                ],
                scope,
                'MAIN_SCOPE'
            );

            DataBackupService.getToScope(['treeApis'], modulesListObj, 'MODULES_LIST');
            scope.$broadcast(constants.YANGMAN_SET_API_TREE_DATA, { params: modulesListObj.treeApis });
            scope.$broadcast(constants.YANGMAN_SET_MODULE_LIST_TITLE, { params: '' });

            if ( scope.selectedDatastore ){
                scope.$broadcast(constants.YANGMAN_MODULE_D_INIT);
            }
        }

        /**
         * General method for pick correct unset method for plugins
         * @param scope
         * @param controller
         */
        function unset(scope, controller) {
            if (service.hasOwnProperty(controller.selectedPlugin.label)) {
                service[controller.selectedPlugin.label](scope);
            }
        }

    }

});
