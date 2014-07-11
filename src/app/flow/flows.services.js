define(['app/flow/flows.module'], function(flows) {
  
  flows.register.factory('FlowRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://odl.cloudistic.me:8080/restconf');
    });
  });

  flows.register.factory('FlowSvc', function (FlowRestangular) {
    var svc = {
      base: function (container) {
        return FlowRestangular.one('flowprogrammer', container);
      }
    };

    svc.delete = function(flowName, flowID, flowType) {
      return svc.staticFlowUrl('default', flowType, flowID, flowName).remove();
    };

    svc.flowsUrl = function (container) {
      return svc.base(container);
    };

    svc.nodeFlowsUrl = function (container, nodeType, nodeId) {
      return svc.base(container).one('node', nodeType).one(nodeId);
    };

    svc.staticFlowUrl = function (container, nodeType, nodeId, name) {
      return svc.base(container).one('node', nodeType).one(nodeId).one('staticFlow', name);
    };

    svc.getAll = function (container) {
      return svc.flowsUrl(container).getList();
      
    };

    svc.itemData = function (i) {
      return {
        state: 'flow.detail',
        name: i.name,
        params: {nodeId: i.node.id, nodeType: i.node.type, flowName: i.name},
      };
    };

    svc.itemsData = function (data_) {
      var data = [];
      angular.forEach(data_.flowConfig, function (value, key) {
        data.push(svc.itemData(value));
      });
      return data;
    };

    return svc;
  });

  flows.register.factory('SwitchSvc', function (FlowRestangular) {
    var svc = {
      base: function (container) {
        return FlowRestangular.one('switchmanager', container);
      },
      data: null
    };

    svc.delete = function(node) {
    /* console.log(node);
      return svc.nodeUrl('default', node.node.type, node.node.id).remove();*/
    };

    // URL for nodes
    svc.nodesUrl = function (container) {
      return svc.base(container).all('nodes');
    };

    // URL for a node
    svc.nodeUrl = function (container, type, id) {
      return svc.base(container).one('node', type).one(id);
    };

    svc.getAll = function (container) {
      return svc.nodesUrl(container).getList();
    };

    svc.getConnectorProperties = function (container, type, id) {
      return svc.nodeUrl(container, type, id).get();
    };

    svc.itemData = function (i) {
      return {
        state: 'node.detail',
        name: i.properties.description.value !== 'None' ? i.properties.description.value : i.node.type + '/' + i.node.id,
        params: {nodeId: i.node.id, nodeType: i.node.type}
      };
    };

    svc.itemsData = function (data_) {
      var data = [];

      angular.forEach(data_.nodeProperties, function (value, key) {
        data.push(svc.itemData(value));
      });

      return data;
    };

    return svc;
  });
});
