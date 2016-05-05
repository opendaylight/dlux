define(['angular'], function (angular) {
    'use strict';

    angular.module('app.yangui').service('CustomFunctUnsetterService',
        ['PathUtilsService', 'DataBackupService', CustomFunctUnsetterService]);

    function CustomFunctUnsetterService(PathUtilsService, DataBackupService){
        var service = {
            'YANGUI_CUST_MOUNT_POINTS': yanguiCustMountPoints,
            unset: unset,
        };

        return service;

        // TODO: add service's description
        function yanguiCustMountPoints(scope){
            DataBackupService.getToScope(['treeApis', 'treeRows', 'apis', 'node',
                                            'selApi', 'selSubApi', 'augmentations'], scope);

            scope.$broadcast('REFRESH_HISTORY_REQUEST_APIS');

            var path = scope.selApi.basePath + scope.selSubApi.buildApiRequestString();
            PathUtilsService.searchNodeByPath(path, scope.treeApis, scope.treeRows);
        }

        // TODO: add service's description
        function unset(custFunct, scope) {
            if (service.hasOwnProperty(custFunct.label)) {
                service[custFunct.label](scope);
            }
        }

    }

});
