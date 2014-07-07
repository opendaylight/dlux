/*
    Keep API service here

    For information about the NB API please go to:
    https://wiki..org/view/_Controller:REST_Reference_and_Authentication
*/

angular.module('common.nbapi', [])


.factory('NBApiSvc', function (Restangular, ContainerSvc) {
  var svc = {
    base: function(nbName, container) {
      container = container || ContainerSvc.getCurrentName();
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
    current: null,
    data: null
  };

  /*
   * Setup handling of the current container
   *
   * Setters / Getters
   *
   * If no containers it should return 'default'
   */
  svc.setCurrent = function (container) {
    svc.current = container;
  };

  svc.getCurrent = function () {
    return svc.current;
  };

  svc.getCurrentName = function () {
    var current = svc.getCurrent();
    return current ? current.container : 'default';
  };

  svc.containersUrl = function() {
    return svc.base().all('containers');
  };

  svc.containerUrl = function(container) {
    return svc.base().one('container', container);
  };

  svc.delete = function (containerName) {
    return svc.containerUrl(containerName).remove();
  };

  svc.getAll = function() {
    return svc.containersUrl().getList();
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
})


.factory('ConnectionManagerSvc', function (Restangular) {
  var svc = {
    data: null
  };

  svc.getAll = function () {
    return Restangular.one('connectionmanager').one('nodes').getList();
  };

  svc.discover = function (nodeId, nodeIp, nodePort) {
    return Restangular.one('connectionmanager').one('node', nodeId).one('address', nodeIp).one('port', nodePort).customPUT();
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
})

.factory('UserSvc', function(NBApiSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base("usermanager", "users");
    }
  };

  svc.getUsers = function(container) {
    return svc.base(container).get();
  };
  return svc;
})

.factory('StaticRouteSvc', function (NBApiSvc) {
  var svc = {
    base: function (container) {
      return NBApiSvc.base('staticroute', container);
    }
  };

  svc.delete = function(staticRouteName) {
    svc.routeUrl("default", staticRouteName).remove();
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

  svc.delete = function(subnetName) {
    return svc.subnetUrl('default', subnetName).remove();
  };

  svc.subnetPortsUrl = function (container, name) {
    return svc.base(container).one('subnet', name).all('node-ports');
  };

  return svc;
})

.factory('SpanPortSvc', function (Restangular) {
  var svc = {
    base: function(container) {
      return Restangular.one(container);
    }
  };

  svc.getSpanPorts = function() {
    return svc.base("spanPorts").getList();
  };

  svc.getSpanPort = function() {

  };

  svc.addSpanPort = function() {

  };

  svc.updateSpanPort = function() {

  };

  svc.deleteSpanPort = function() {

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
})
.factory('NodeInventorySvc', function(Restangular) {
  var svc = {
    base: function() {
      return Restangular.one('operational').one('opendaylight-inventory:nodes');
    },
    data: null
  };
  svc.getCurrentData = function() {
    return svc.data;  
  };
  svc.getAllNodes = function() {
    svc.data = svc.base().getList();  
    return svc.data;
  };
  svc.getNode = function(node) {
    return svc.base().one("node", node).get();
  };
  return svc;
})
.factory('NetworkTopologySvc', function(Restangular) {
    var svc = {
        base: function() {
            return Restangular.one('operational').one('network-topology:network-topology');
        },
        data: null
    };
    svc.getCurrentData = function() {
        return svc.data;
    };
    svc.getAllNodes = function() {
        svc.data = svc.base().getList();
        return svc.data;
    };
    svc.getNode = function(node,cb) {
        var getNodeIdByText = function getNodeIdByText(inNodes, text) {
            var nodes = inNodes.filter(function(item, index) {
                    return item.label === text;
                }),
                nodeId;

            if(nodes) {
                nodeId = nodes[0].id;
            }

            return nodeId;
        };
        return svc.base().one("topology", node).get().then(function(ntData){

            var nodes = [];
            var links = [];

            if(ntData.topology && ntData.topology[0]){
                angular.forEach(ntData.topology[0].node, function(nodeData) {
                    nodes.push({'id': nodes.length.toString(), 'label': nodeData["node-id"], group: 'switch',value:20,title:'Name: <b>' + nodeData["node-id"] + '</b><br>Type: Switch'});
                });

                angular.forEach(ntData.topology[0].link, function(linkData) {
                    var srcId = getNodeIdByText(nodes, linkData.source["source-node"]),
                        dstId = getNodeIdByText(nodes, linkData.destination["dest-node"]),
                        srcPort = linkData.source["source-tp"],
                        dstPort = linkData.destination["dest-tp"],
                        linkId = links.length.toString();

                    links.push({id: linkId, 'from' : srcId, 'to': dstId, title:'Source Port: <b>' + srcPort + '</b><br>Dest Port: <b>'+dstPort+'</b>'});
                });


            }

            var data = {
                "nodes" : nodes,
                "links" : links
            };
            cb(data);
        });
    };
    return svc;
})
;
