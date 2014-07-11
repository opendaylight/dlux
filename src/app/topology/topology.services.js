define(['app/topology/topology.module'], function(topology) {
  
  topology.register.factory('TopologyRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://localhost:8080');
    });
  });

  
  topology.register.factory('NetworkTopologySvc', function(TopologyRestangular) {
    var svc = {
        base: function() {
            return TopologyRestangular.one('restconf').one('operational').one('network-topology:network-topology');
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

            if(nodes && nodes[0]) {
                nodeId = nodes[0].id;
            }else{
                return null;
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
                    if(srcId!=null && dstId!=null){
                        links.push({id: linkId, 'from' : srcId, 'to': dstId, title:'Source Port: <b>' + srcPort + '</b><br>Dest Port: <b>'+dstPort+'</b>'});
                    }
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
});

});
