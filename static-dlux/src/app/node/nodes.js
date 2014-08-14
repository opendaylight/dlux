/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

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

.controller('nodeConnectorCtrl', function($scope, $stateParams, NodeInventorySvc, $timeout, nodeConnectorFactory) {
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
})

.factory('nodeConnectorFactory', function() {
  var factory = {};

  factory.getActiveFlow = function(flowTable, index) {
    var flow = flowTable[index];
    var activeFlow = flow['opendaylight-flow-table-statistics:flow-table-statistics']['opendaylight-flow-table-statistics:active-flows'];

    return (activeFlow > 0);
  };
  return factory;
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

  $stateProvider.state('node.flow-stat', {
    url: '/:nodeId/flow-stat',
    access: access.admin,
    views: {
      '': {
        templateUrl: 'node/flow-stat.tpl.html',
        controller: 'nodeConnectorCtrl'
      }
    }
  });

  $stateProvider.state('node.port-stat', {
    url: '/:nodeId/port-stat',
    access: access.admin,
    views: {
      '': {
        templateUrl: 'node/port-stat.tpl.html',
        controller: 'nodeConnectorCtrl'
      }
    }
  });
});
