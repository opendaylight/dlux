define([], function () {
    'use strict';

    function YangUiApisService(YangUtilsRestangularService){
        var service = {
            getAllModules: getAllModules,
            getAllApis: getAllApis,
            getCustomModules: getCustomModules,
            getModuleSchema: getModuleSchema,
            getSingleApiInfo: getSingleApiInfo,
            getSingleModuleInfo: getSingleModuleInfo,
        };

        return service;

        // TODO: add service's description
        function getAllModules() {
            return YangUtilsRestangularService.one('restconf').one('modules');
        }

        // ,TODO: add service's description
        function getModuleSchema(name, rev) {
            return YangUtilsRestangularService.one('restconf').one('modules')
                                                .one('module').one(name).one(rev).one('schema');
        }

        // TODO: add service's description
        function getSingleModuleInfo(modulePath) {
            return YangUtilsRestangularService.one('restconf').one('modules').one('module').customGET(modulePath);
        }

        // TODO: add service's description
        function getAllApis() {
            return YangUtilsRestangularService.one('apidoc').one('apis');
        }

        // TODO: add service's description
        function getSingleApiInfo(apiPath) {
            return YangUtilsRestangularService.one('apidoc').one('apis').customGET(apiPath);
        }

        // TODO: add service's description
        function getCustomModules(baseApiPath) {
            return YangUtilsRestangularService.one('restconf').one('modules').customGET(baseApiPath);
        }
    }

    YangUiApisService.$inject = ['YangUtilsRestangularService'];

    return YangUiApisService;

});
