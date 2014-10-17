define(['app/flow/flows.module'], function(flows) {

  flows.register.factory('FlowRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("AD_SAL"));
    });
  });

  flows.register.factory('FlowSvc', function (FlowRestangular) {
    var svc = {
      base: function (container) {
        container = container || 'default';
        return FlowRestangular.one('controller/nb/v2').one('flowprogrammer', container);
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

});
