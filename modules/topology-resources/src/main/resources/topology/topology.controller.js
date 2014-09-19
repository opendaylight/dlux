define(['app/topology/topology.module', 'app/topology/topology.directives','app/topology/topology.services'], function(topology) {
  topology.register.controller('TopologyCtrl', ['$scope', '$rootScope', 'NetworkTopologySvc' , 'pollSvc', function ($scope, $rootScope, NetworkTopologySvc, pollSvc) {
    $rootScope['section_logo'] = 'logo_topology';
    $scope.createTopology = function() {

        if(window.PollFlag === undefined){
            pollSvc.makePoll(250);
            window.PollFlag = true;
        }

        NetworkTopologySvc.getNode("flow:1", function(data) {
          var x = 50;
          var y = 50;
          var step = 30;
          data.nodes.push({id: 1001, x: x, y: y + step, label: 'Switch', group: 'switch',value:20});
          data.nodes.push({id: 1003, x: x, y: y + 3 * step, label: 'Host', group: 'host',value:20});
          $scope.topologyData = data;
      });
    };

    $scope.createTopology();
  }]);
});
