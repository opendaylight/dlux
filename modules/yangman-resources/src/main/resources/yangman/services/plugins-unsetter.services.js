define(['angular', 'app/yangman/yangman.module'], function (angular, yangman) {
    'use strict';

    yangman.register.service('PluginsUnsetterService',
        ['PathUtilsService', 'DataBackupService', PluginsUnsetterService]);

    function PluginsUnsetterService(PathUtilsService, DataBackupService){
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
            scope.$broadcast('YANGMAN_SET_API_TREE_DATA', { params: modulesListObj.treeApis });
            scope.$broadcast('YANGMAN_SET_MODULE_LIST_TITLE', { params: '' });

            if ( scope.selectedDatastore ){
                scope.$broadcast('YANGMAN_MODULE_D_INIT');
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
