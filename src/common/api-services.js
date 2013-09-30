/*
    Keep API service here

    For information about the NB API please go to:
    https://wiki..org/view/_Controller:REST_Reference_and_Authentication
*/

angular.module('dlux.nbapi', [])


.factory('NBApiSvc', function (Restangular) {
  var svc = {
    base: function(nbName, container) {
      container = container || 'default';
      return Restangular.one(nbName, container);
    },
    rest: Restangular
  };

  return svc;
})

.factory('ContainerSvc', function(Restangular) {
  var svc = {
    base: function() {
      return Restangular.one('containermanager');
    },
    data: null
  };

  svc.containersUrl = function() {
    return svc.base().all('containers');
  };

  svc.containerUrl = function(container) {
    return svc.base().one('container', container);
  };

  svc.getAll = function() {
    svc.containersUrl().getList().then(function (data) {
      svc.data = data;
    });
  };

  svc.itemData = function (i) {
    return {
      state: 'container.detail',
      params: {container: i.container},
      name: i.container
    };
  };

  svc.itemsData = function (data_) {
    return data_['container-config'].map(svc.itemData);
  };

  return svc;
})


.factory('FlowSvc', function (NBApiSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base('flowprogrammer', container);
    }
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
    svc.flowsUrl(container).getList().then(function (data) {
      svc.data = data;
    });
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
})


.factory('SwitchSvc', function (NBApiSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base('switchmanager', container);
    },
    data: null
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
    svc.nodesUrl(container).getList().then(function (data) {
      svc.data = data;
    });
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
})


.factory('StaticRouteSvc', function (NBApiSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base('staticroute', container);
    }
  };

  svc.routesUrl = function (container) {
    return svc.base(container).all('routes');
  };

  svc.routeUrl = function (container, name) {
    return svc.base(container).one('route', name);
  };

  return svc;
})


.factory('SubnetSvc', function (NBApiSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base('subnetservice', container);
    }
  };

  svc.subnetsUrl = function (container) {
    return svc.base(container).all('subnets');
  };

  svc.subnetUrl = function (container, name) {
    return svc.base(container).one('subnet', name);
  };

  svc.subnetPortsUrl = function (container, name) {
    return svc.base(container).one('subnet', name).all('node-ports');
  };

  return svc;
})


.factory('TopologySvc', function (NBApiSvc, SwitchSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base('topology', container);
    }
  };

  svc.topologyUrl = function (container) {
    return svc.base(container);
  };

  svc.userLinksUrl = function (container) {
    return svc.base(container).all('user-link');
  };

  svc.userLinkUrl = function (container, linkName) {
    return svc.base(container).one('user-link', linkName);
  };

  // Fetch the data needed
  svc.getTopologyData = function (container, cb, eb) {
    var nodes = [];

    var data = {
      directed: false, multigraph: false, graph: [], nodes: [], links: []
    };

    SwitchSvc.nodesUrl().getList().then(function(npData) {
      angular.forEach(npData.nodeProperties, function(value, key){
        nodes[key] = value.node.id;
        data.nodes[key] = {id: value.node.id};
      });

      // TODO: Howto handle if a indexOf becomes -1? That would mean there's a diff between the nodes data and the topology data!?
      svc.topologyUrl().getList().then(function(tData) {
        angular.forEach(tData.edgeProperties, function(ep) {
          var edgeId = nodes.indexOf(ep.edge.headNodeConnector.node.id);
          var tailId = nodes.indexOf(ep.edge.tailNodeConnector.node.id);

          // TODO: Possible place to call errback?
          if (edgeId == -1 || tailId == -1) {
            console.log("WARNING - couldn't the id with -1: " + edgeId + ' ' + tailId);
          }

          data.links.push({"source": edgeId, "target": tailId});
        });

        // All done, let's feed the data to the upper function
        cb(data);
      });
    });
  };

  return svc;
});
