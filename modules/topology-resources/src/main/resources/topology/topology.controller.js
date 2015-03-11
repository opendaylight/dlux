define(['app/topology/topology.module','app/topology/topology.services', 'graphRenderer', 'pixi'], function(topology, service, GraphRenderer, PIXI) {
  window.PIXI = PIXI; // attach pixijs to global scope

  topology.register.controller('TopologyCtrl', ['$scope', '$rootScope', 'NetworkTopologySvc' ,  function ($scope, $rootScope, NetworkTopologySvc) {
    $rootScope['section_logo'] = 'logo_topology';
    var graphRenderer = null;
    $scope.createTopology = function() {

        NetworkTopologySvc.getNode("flow:1", function(data) {
          /*var x = 50;
          var y = 50;
          var step = 30;
          data.nodes.push({id: 1001, x: x, y: y + step, label: 'Switch', group: 'switch',value:20});
          data.nodes.push({id: 1003, x: x, y: y + 3 * step, label: 'Host', group: 'host',value:20});*/

          var inNodes = data.nodes;
          var inEdges = data.links;
          graphRenderer = new GraphRenderer();
          graphRenderer.loadGraph(inNodes, inEdges);
          graphRenderer.start('topology_simple');
      });
    };

    $scope.createTopology();
  }]);
});
