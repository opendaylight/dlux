define(['app/node/nodes.module'],function(node) {
 
  node.register.factory('nodeConnectorFactory', function() {
    var factory = {};

    factory.getActiveFlow = function(flowTable, index) {
      var flow = flowTable[index];
      var activeFlow = flow['opendaylight-flow-table-statistics:flow-table-statistics']['opendaylight-flow-table-statistics:active-flows'];

      return (activeFlow > 0);
    };
    return factory;
  });
  
  node.register.factory('NodeRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://odl.cloudistic.me:8080/restconf');
    });
  });

  node.register.factory('NodeInventorySvc', function(NodeRestangular) {
    var svc = {
      base: function() {
        return NodeRestangular.one('operational').one('opendaylight-inventory:nodes');
      },
      data : null
    };

    svc.getCurrentData = function() {
      return svc.data;
    };

    svc.getAllNodes = function() {
      svc.data = svc.base().getList();
      return svc.data;
    };

    svc.getNode = function(node) {
      return svc.base().one('node', node).get();
    };

    return svc;
  });

});
