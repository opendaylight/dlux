define(['app/connection_manager/connection_manager.module'], function(connection_manager) {

  connection_manager.register.factory('ConnectionManagerRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("AD_SAL"));
    });
  });

  connection_manager.register.factory('ConnectionManagerSvc', function (ConnectionManagerRestangular) {
    var svc = {
      base: function() {
        return ConnectionManagerRestangular.one('controller/nb/v2');
      },
      data: null
    };

    svc.getAll = function () {
      return svc.base().one('connectionmanager').one('nodes').getList();
    };

    svc.discover = function (nodeId, nodeIp, nodePort) {
      return svc.base().one('connectionmanager').one('node', nodeId).one('address', nodeIp).one('port', nodePort).customPUT();
    };

    return svc;
  });
});
