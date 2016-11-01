/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/node/nodes.module','app/node/nodes.services'], function(node) {

  node.controller('rootNodeCtrl', function($rootScope) {
    $rootScope['section_logo'] = 'assets/images/logo_node.gif';
   // $rootScope.$apply();
  });

  node.controller('allNodesCtrl', function($scope, NodeInventorySvc, $timeout) {
    NodeInventorySvc.getAllNodes().then(function(data) {
      $scope.data = data.nodes.node;
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

  node.controller('nodeConnectorCtrl', function($scope, $stateParams, NodeInventorySvc, $timeout, nodeConnectorFactory) {
    var currentData = NodeInventorySvc.getCurrentData();
    if(currentData != null) {
      currentData.then(function(data) {
        var node = _.find(data.nodes.node, function(entry) {if(entry.id == $stateParams.nodeId) { return entry;}});
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
