/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['angularAMD', 'app/routingConfig', 'Restangular', 'angular-translate', 'angular-translate-loader-static-files', 'app/core/core.services', 'common/config/env.module'], function(ng) {
  var nodes = angular.module('app.nodes', ['app.core', 'pascalprecht.translate', 'ui.router.state', 'restangular', 'config']);
  nodes.register = nodes;// for unit test

  nodes.config(function($stateProvider, $compileProvider, $controllerProvider, $provide, NavHelperProvider, $translateProvider) {
    nodes.register = {
      controller : $controllerProvider.register,
      directive : $compileProvider.directive,
      factory : $provide.factory,
      service : $provide.service

    };

    NavHelperProvider.addControllerUrl('app/node/nodes.controller');
    NavHelperProvider.addToMenu('nodes', {
     "link" : "#/node/index",
     "active" : "main.node.*",
     "title" : "NODES",
     "icon" : "icon-sitemap",
     "page" : {
        "title" : "NODES",
        "description" : "NODES"
     }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.node', {
      url: 'node',
      abstract: true,
      views : {
        'content' : {
          templateUrl: 'src/app/node/root.tpl.html',
          controller: 'rootNodeCtrl'
        }
      }
    });

    $stateProvider.state('main.node.index', {
      url: '/index',
      access: access.admin,
      views: {
        '': {
          templateUrl: 'src/app/node/index.tpl.html',
          controller: 'allNodesCtrl'
        }
      }
    });

    $stateProvider.state('main.node.detail', {
      url: '/:nodeId/detail',
      access: access.admin,
      views: {
        '': {
          templateUrl: 'src/app/node/detail.tpl.html',
          controller: 'nodeConnectorCtrl'
        }
      }
    });

    $stateProvider.state('main.node.flow-stat', {
      url: '/:nodeId/flow-stat',
      access: access.admin,
      views: {
        '': {
          templateUrl: 'src/app/node/flow-stat.tpl.html',
          controller: 'nodeConnectorCtrl'
        }
      }
    });

    $stateProvider.state('main.node.port-stat', {
      url: '/:nodeId/port-stat',
      access: access.admin,
      views: {
        '': {
          templateUrl: 'src/app/node/port-stat.tpl.html',
          controller: 'nodeConnectorCtrl'
        }
      }
    });

  });

  return nodes;
});
