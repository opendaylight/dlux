define(['angularAMD', 'app/routingConfig', 'Restangular', 'angular-translate-loader-static-files', 'app/core/core.services'], function(ng) {
  var nodes = angular.module('app.nodes', ['app.core', 'ui.router.state', 'restangular']);

  nodes.config(function($stateProvider, $compileProvider, $controllerProvider, $provide, NavHelperProvider, $translateProvider) {
    nodes.register = {
      controller : $controllerProvider.register,
      directive : $compileProvider.directive,
      factory : $provide.factory,
      service : $provide.service
      
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/node/nodes.controller');
    NavHelperProvider.addToMenu('nodes', {
     "link" : "index.html#/node/index",
     "active" : "node",
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
