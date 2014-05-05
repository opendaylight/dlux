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
      /*$scope.topologyData = {
        directed: false, multigraph: false, graph: [], nodes: [{"id": "one"}, {"id": "two"}, {"id": "three"}],
        links: [{"source": 0, "target": 1}, {"source": 0, "target": 2}]
      }*/
    }]
  });

});
