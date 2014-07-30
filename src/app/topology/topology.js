/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

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
