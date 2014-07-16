angular.module('console.topology', [])

.config(function($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('topology', {
    url: '/topology',
    access: access.public,
    templateUrl: 'topology/topology.tpl.html',
    controller: ['$scope', 'NetworkTopologySvc', function ($scope, NetworkTopologySvc) {
      $scope.createTopology = function() {
          NetworkTopologySvc.getNode("flow:1", function(data) {
          $scope.topologyData = data;
        });
      };

      $scope.createTopology();
    }]
  });

});
