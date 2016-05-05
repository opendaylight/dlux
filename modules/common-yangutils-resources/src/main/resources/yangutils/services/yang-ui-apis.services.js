define([], function () {
    'use strict';

    function YangUiApisService(YangUtilsRestangularService){
        var apis = {};

        apis.getAllModules = function() {
            return YangUtilsRestangularService.one('restconf').one('modules');
        };

        apis.getModuleSchema = function(name, rev) {
            return YangUtilsRestangularService.one('restconf').one('modules').one('module').one(name).one(rev).one('schema');
        };

        apis.getSingleModuleInfo = function(modulePath) {
            return YangUtilsRestangularService.one('restconf').one('modules').one('module').customGET(modulePath);
        };

        apis.getAllApis = function() {
            return YangUtilsRestangularService.one('apidoc').one('apis');
        };

        apis.getSingleApiInfo = function(apiPath) {
            return YangUtilsRestangularService.one('apidoc').one('apis').customGET(apiPath);
        };

        apis.getCustomModules = function(baseApiPath) {
            return YangUtilsRestangularService.one('restconf').one('modules').customGET(baseApiPath);
        };

        apis.getCustomModules = function(baseApiPath) {
            return YangUtilsRestangularService.one('restconf').one('modules').customGET(baseApiPath);
        };

        return apis;
    }

    YangUiApisService.$inject=['YangUtilsRestangularService'];

    return YangUiApisService;

});