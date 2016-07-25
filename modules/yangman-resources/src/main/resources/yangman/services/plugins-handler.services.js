var yangmanPluginsFactories = [
    'ymDisplayMountPoints',
];

var yangmanPluginContollers = [
];

define([
    'common/yangutils/services/custom-funct.services',
].concat(yangmanPluginsFactories.map(function (plugin) {
    'use strict';
    return 'app/yangman/services/plugins/' + plugin + '.services';
})).concat(yangmanPluginContollers.map(function (ctrl) {
    'use strict';
    return 'app/yangman/plugins/cv/' + ctrl + '.controller';
})), function () {
    'use strict';

    angular.module('app.yangman').service('PluginsHandlerService', PluginsHandlerService);

    function PluginsHandlerService($injector, CustomFuncService) {

        var service = {
            addPlugins: addPlugins,
            plugAll: plugAll,
            plugins: [],
        };

        service.addPlugins();

        return service;

        // TODO: add service's description
        function addPlugins() {
            yangmanPluginsFactories.forEach(function (pluginFactFullName) {
                var pluginServiceName = pluginFactFullName.split('/'),
                    pluginName = pluginServiceName[pluginServiceName.length - 1].split('.')[0];

                $injector.invoke([pluginName, function (pluginFact) {
                    service.plugins.push(pluginFact);
                }]);
            });

        }

        /**
         * Method for importing additional plugins
         * @param apis
         */
        function plugAll(apis) {
            service.plugins.forEach(function (plugin) {
                plugin.module.forEach(function (plModule, i){
                    CustomFuncService.createCustomFunctionalityApis(apis, plModule, plugin.revision,
                                                                    plugin.pathString[i], plugin.label,
                                                                    plugin.getCallback, plugin.view,
                                                                    plugin.hideButtonOnSelect);
                });
            });
        }
    }
});
