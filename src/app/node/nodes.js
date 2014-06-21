angular.module('console.node', [])
  .directive("nodeTable", function () {
    return function ($scope) {
      if($scope.$last) {
        $scope.$emit('lastentry');
      }
    };
  })

.controller('allNodesCtrl', function($scope, NodeInventorySvc, $timeout) {
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
})

.controller('nodeConnectorCtrl', function($scope, $stateParams, NodeInventorySvc, $timeout) {
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
