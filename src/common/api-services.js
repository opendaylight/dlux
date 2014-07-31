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
        data: null,
        TOPOLOGY_CONST: {
            HT_SERVICE_ID:"host-tracker-service:id",
            HT_SERVICE_ADDS:"host-tracker-service:addresses",
            HT_SERVICE_IP:"host-tracker-service:ip",
            HT_SERVICE_ATTPOINTS:"host-tracker-service:attachment-points",
            HT_SERVICE_TPID:"host-tracker-service:tp-id",
            NODE_ID:"node-id",
            SOURCE_NODE:"source-node",
            DEST_NODE:"dest-node",
            SOURCE_TP:"source-tp",
            DEST_TP:"dest-tp"
        }
    };
    svc.getCurrentData = function() {
        return svc.data;
    };
    svc.getAllNodes = function() {
        svc.data = svc.base().getList();
        return svc.data;
    };
    svc.getNode = function(node,cb) {
        //Determines the node id from the nodes array corresponding to the text passed
        var getNodeIdByText = function getNodeIdByText(inNodes, text) {
            var nodes = inNodes.filter(function(item, index) {
                    return item.label === text;
                }),
                nodeId;

            if(nodes && nodes[0]) {
                nodeId = nodes[0].id;
            }else{
                return null;
            }

            return nodeId;
        };
        //Checks if the edge is present in the links map or not so we show single edge link between switches
        var isEdgePresent = function(inLinks,srcId,dstId){
            if( inLinks[srcId+":"+dstId] === undefined && inLinks[dstId+":"+srcId] === undefined) {
                return false;
            }
            else {
                return true;
            }
        };
        //Determines the switch id from the host tracker service attach point
        var getHostLinkInfo = function(htserviceattp){
            if(htserviceattp){
                return htserviceattp.substring(0,htserviceattp.lastIndexOf(":"));
            }else{
                return null;
            }
        };
        return svc.base().one("topology", node).get().then(function(ntData){

            var nodes = [];
            var links = [];
            var linksMap = {};
            var hostLinks = [];

            if(ntData.topology && ntData.topology[0]){
                //Loop over the nodes
                angular.forEach(ntData.topology[0].node, function(nodeData) {
                    var groupType = "", nodeTitle = "", nodeLabel = "";
                    if(nodeData[svc.TOPOLOGY_CONST.HT_SERVICE_ID]){
                        groupType = "host";
                        var ht_serviceadd = nodeData[svc.TOPOLOGY_CONST.HT_SERVICE_ADDS];
                        //get title info
                        for(var i=0;i<ht_serviceadd.length;i++){
                            nodeTitle += 'IP: <b>' + ht_serviceadd[i][svc.TOPOLOGY_CONST.HT_SERVICE_IP] + '</b><br>';
                        }

                        nodeLabel = nodeData[svc.TOPOLOGY_CONST.HT_SERVICE_ID];

                        //get Link Info
                        var ht_serviceattp = nodeData[svc.TOPOLOGY_CONST.HT_SERVICE_ATTPOINTS];
                        for(var j=0;j<ht_serviceattp.length;j++){
                            var hostTpId = getHostLinkInfo(ht_serviceattp[j][svc.TOPOLOGY_CONST.HT_SERVICE_TPID]);
                            hostLinks.push({'from':nodeLabel,'to':hostTpId});
                        }

                        nodeTitle += 'Type: Host';

                    }else{
                        groupType = "switch";
                        nodeTitle = 'Name: <b>' + nodeData[svc.TOPOLOGY_CONST.NODE_ID] + '</b><br>Type: Switch';
                        nodeLabel = nodeData[svc.TOPOLOGY_CONST.NODE_ID];
                    }

                    nodes.push({'id': nodes.length.toString(), 'label': nodeLabel, group: groupType,value:20,title:nodeTitle});
                });
                //Loops over the links
                angular.forEach(ntData.topology[0].link, function(linkData) {
                    var srcId = getNodeIdByText(nodes, linkData.source[svc.TOPOLOGY_CONST.SOURCE_NODE]),
                        dstId = getNodeIdByText(nodes, linkData.destination[svc.TOPOLOGY_CONST.DEST_NODE]),
                        srcPort = linkData.source[svc.TOPOLOGY_CONST.SOURCE_TP],
                        dstPort = linkData.destination[svc.TOPOLOGY_CONST.DEST_TP],
                        linkId = links.length.toString();
                    if(srcId!=null && dstId!=null && !isEdgePresent(linksMap,srcId,dstId)){
                        links.push({id: linkId, 'from' : srcId, 'to': dstId, title:'Source Port: <b>' + srcPort + '</b><br>Dest Port: <b>'+dstPort+'</b>'});
                        linksMap[srcId+":"+dstId]=linkId;
                    }
                });

                //Adds the host to switch link info, determined at the end as we need the node id for from and to
                for(var i =0;i<hostLinks.length;i++){
                    links.push({id: links.length.toString(), 'from' : getNodeIdByText(nodes,hostLinks[i]["from"]), 'to': getNodeIdByText(nodes,hostLinks[i]["to"]), title:''});
                }


            }

            var data = {
                "nodes" : nodes,
                "links" : links
            };
            cb(data);
        },function(response) {
            console.log("Error with status code", response.status);
        });
    };
    return svc;
})
;