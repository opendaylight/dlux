define(['app/topology/topology.module', 'app/topology/topology.directives','app/topology/topology.services'], function(topology) {
  topology.register.controller('TopologyCtrl', ['$scope', '$rootScope', 'NetworkTopologySvc', function ($scope, $rootScope, NetworkTopologySvc) {
    $rootScope['section_logo'] = 'logo_topology';
    $scope.createTopology = function() {
        NetworkTopologySvc.getNode("flow:1", function(data) {
          $scope.topologyData = data;
      });
    };

    $scope.createTopology();
  }]);
});
