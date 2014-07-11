define(['app/node/nodes.module','app/node/nodes.factory'], function(node) {

  node.register.controller('allNodesCtrl', function($scope, NodeInventorySvc, $timeout) {
    NodeInventorySvc.getAllNodes().then(function(data) {
      $scope.data = data[0].node;
    });
    var tableRendered = false;
    $scope.$watch('nodeSearch.id', function() {
      if(tableRendered) {
        $timeout(function(){
            $('.footable').trigger('footable_redraw'); //force a redraw
        }, 20);
      }
    });

    $scope.$on('lastentry', function() {
      // Initialize footable table
      if(!tableRendered){
        $('.footable').footable();
        tableRendered = true;
      }
    });
  });

  node.register.controller('nodeConnectorCtrl', function($scope, $stateParams, NodeInventorySvc, $timeout, nodeConnectorFactory) {
    var currentData = NodeInventorySvc.getCurrentData();
    if(currentData != null) {
      currentData.then(function(data) {
        var node = _.find(data[0].node, function(entry) {if(entry.id == $stateParams.nodeId) { return entry;}});
        $scope.data = node;
      });
    }
    else {
      NodeInventorySvc.getNode($stateParams.nodeId).then(function(data) {
      $scope.data = data.node[0];
      });
    }
    var tableRendered = false;
    $scope.$watch('nodeConnectorSearch', function() {
      if(tableRendered) {
          $timeout(function () {
          $('.footable').trigger('footable_redraw');//force a redraw
        }, 20);
      }
    });

      $scope.$on('lastentry', function() {
        // Initialize footable table
        if(!tableRendered){
          $('.footable').footable();
          tableRendered = true;
        }
      });

    $scope.checkActiveFlow = function(index) {
      return nodeConnectorFactory.getActiveFlow($scope.data['flow-node-inventory:table'], index);
    };
  });
});
