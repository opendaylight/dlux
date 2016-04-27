var pluginsFactories = [
    'displayTopology',
    'checkFlow',
    'displayMountPoints',
];

var pluginContollers = [
    'cvTopology',
];

define(['app/yangui/yangui.module'].concat(pluginsFactories.map(function (plugin) {
    'use strict';
    return 'app/yangui/cf/' + plugin + '.services';
})).concat(pluginContollers.map(function (ctrl) {
    'use strict';
    return 'app/yangui/cf/cv/' + ctrl + '.controller';
})), function (yangui, yangutils) {
    'use strict';

    yangui.register.service('PluginHandlerService', PluginHandlerService);

    function PluginHandlerService($http, $injector, CustomFuncService, displayTopology, checkFlow) {

        var service = {
            addPlugins: addPlugins,
            plugAll: plugAll,
            plugins: [],
        };

        service.addPlugins();

        return service;

        // TODO: add service's description
        function addPlugins() {
            pluginsFactories.forEach(function (pluginFactFullName) {
                var pluginServiceName = pluginFactFullName.split('/'),
                    pluginName = pluginServiceName[pluginServiceName.length - 1].split('.')[0];

                $injector.invoke([pluginName, function (pluginFact) {
                    service.plugins.push(pluginFact);
                }]);
            });

        }

        // TODO: add service's description
        function plugAll(apis) {
            service.plugins.forEach(function (plugin) {
                console.info('adding plugin', plugin.label);
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
