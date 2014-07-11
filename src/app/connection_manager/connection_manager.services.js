define(['app/connection_manager/connection_manager.module'], function(connection_manager) {
  
  connection_manager.register.factory('ConnectionManagerRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://odl.cloudistic.me:8080/restconf');
    });
  });

  connection_manager.register.factory('ConnectionManagerSvc', function (ConnectionManagerRestangular) {
    var svc = {
      data: null
    };

    svc.getAll = function () {
      return ConnectionManagerRestangular.one('connectionmanager').one('nodes').getList();
    };

    svc.discover = function (nodeId, nodeIp, nodePort) {
      return ConnectionManagerRestangular.one('connectionmanager').one('node', nodeId).one('address', nodeIp).one('port', nodePort).customPUT();
    };

    return svc;
  });
});
