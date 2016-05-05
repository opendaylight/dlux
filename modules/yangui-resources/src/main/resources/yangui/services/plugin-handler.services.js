var pluginsFactories = [
    'displayTopology',
    'checkFlow',
    'displayMountPoints'
];

var pluginContollers = [
    'cvTopology'
];

define(['app/yangui/yangui.module'].concat(pluginsFactories.map(function(plugin) {
    return 'app/yangui/cf/'+plugin+'.services';
})).concat(pluginContollers.map(function(ctrl) {
    return 'app/yangui/cf/cv/'+ctrl+'.controller';
})), function(yangui, yangutils) {

    yangui.register.service('PluginHandlerService', function($http, $injector, CustomFuncService, displayTopology, checkFlow) {

        var pluginHandler = {
            plugins: [],
            addPlugins: function() {
                var self = this;

                pluginsFactories.forEach(function(pluginFactFullName) {
                    var pluginServiceName = pluginFactFullName.split('/');
                    pluginName = pluginServiceName[pluginServiceName.length - 1].split('.')[0];

                    $injector.invoke([pluginName, function(pluginFact) {
                        self.plugins.push(pluginFact);
                    }]);
                });

            },
            plugAll: function(apis) {
                this.plugins.forEach(function(plugin) {
                    console.info('adding plugin',plugin.label);
                    plugin.module.forEach(function(plModule, i){
                        CustomFuncService.createCustomFunctionalityApis(apis, plModule, plugin.revision, plugin.pathString[i], plugin.label, plugin.getCallback, plugin.view, plugin.hideButtonOnSelect);
                    });
                });
            }
        };

        pluginHandler.addPlugins();

        return pluginHandler;
    });

});