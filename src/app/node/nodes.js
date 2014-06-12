angular.module('console.node', [])

.controller('allNodesCtrl', function($scope, NodeInventorySvc) {
  NodeInventorySvc.getAllNodes().then(function(data) {
    $scope.data = data[0].node;
  });
})
.controller('nodeConnectorCtrl', function($scope, $stateParams, NodeInventorySvc) {
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
})

.config(function ($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('node', {
    url: '/node',
    abstract: true,
    templateUrl: 'node/root.tpl.html'
  });

  $stateProvider.state('node.index', {
    url: '/index',
    access: access.admin,
    views: {
      '': {
        templateUrl: 'node/index.tpl.html',
        controller: 'allNodesCtrl'
      }
    }
  });

  $stateProvider.state('node.detail', {
    url: '/:nodeId/detail',
    access: access.admin,
    views: {
      '': {
        templateUrl: 'node/detail.tpl.html',
        controller: 'nodeConnectorCtrl'
      }
    }
  });
});
