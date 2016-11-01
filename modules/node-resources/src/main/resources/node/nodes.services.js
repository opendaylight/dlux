/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/node/nodes.module'],function(node) {

  node.factory('nodeConnectorFactory', function() {
    var factory = {};

    factory.getActiveFlow = function(flowTable, index) {
      var flow = flowTable[index];
      var activeFlow = flow['opendaylight-flow-table-statistics:flow-table-statistics']['opendaylight-flow-table-statistics:active-flows'];

      return (activeFlow > 0);
    };
    return factory;
  });

  node.factory('NodeRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
    });
  });

  node.factory('NodeInventorySvc', function(NodeRestangular) {
    var svc = {
      base: function() {
        return NodeRestangular.one('restconf').one('operational').one('opendaylight-inventory:nodes');
      },
      data : null
    };

    svc.getCurrentData = function() {
      return svc.data;
    };

    svc.getAllNodes = function() {
      svc.data = svc.base().get();
      return svc.data;
    };

    svc.getNode = function(node) {
      return svc.base().one('node', node).get();
    };

    return svc;
  });

});
