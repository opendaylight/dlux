angular.module('dlux.topology', [])

.config(function($stateProvider) {
  $stateProvider.state('topology', {
    url: '/topology',
    templateUrl: 'topology/topology.tpl.html',
    controller: function ($scope, TopologySvc, SwitchSvc) {
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
    }
  });

});
