define(['app/yangui/yangui.module'], function(yangui) {

    yangui.register.service('CustomFunctUnsetterService', ['PathUtilsService','DataBackupService', function(PathUtilsService, DataBackupService){

        var cfu = {};

        cfu['YANGUI_CUST_MOUNT_POINTS'] = function(scope){
            DataBackupService.getToScope(['treeApis', 'treeRows', 'apis', 'node', 'selApi', 'selSubApi', 'augmentations'], scope);

            scope.$broadcast('REFRESH_HISTORY_REQUEST_APIS');

            var path = scope.selApi.basePath+scope.selSubApi.buildApiRequestString();
            PathUtilsService.searchNodeByPath(path, scope.treeApis, scope.treeRows);
        };

        cfu.unset = function(custFunct, scope) {
            if(cfu.hasOwnProperty(custFunct.label)) {
                cfu[custFunct.label](scope);
            }
        };

        return cfu;

    }]);

});