angular.module('console.topology', [])

.config(function($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('topology', {
    url: '/topology',
    access: access.public,
    templateUrl: 'topology/topology.tpl.html',
    controller: ['$scope', 'TopologySvc', 'SwitchSvc', function ($scope, TopologySvc, SwitchSvc) {
      $scope.createTopology = function() {
        TopologySvc.getTopologyData(null, function(data) {
          $scope.topologyData = data;
        });
      };

      $scope.createTopology();
      $scope.topologyData = {
        directed: false, multigraph: false, graph: [], nodes: [{"id": "openflow:1"}, {"id": "openflow:3"}, {"id": "openflow:2"}, {"id": "openflow:5"}, {"id": "openflow:4"}, {"id": "openflow:7"}, {"id": "openflow:6"}],
        links: [{"source": 0, "target": 2}, {"source": 0, "target": 3}, {"source": 1, "target": 2}, {"source": 2, "target": 4}, {"source": 3, "target": 5}, {"source": 3, "target": 6}]
      };
    }]
  });

});
