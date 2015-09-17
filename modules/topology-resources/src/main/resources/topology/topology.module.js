define(['angularAMD', 'app/routingConfig', 'app/core/core.services','Restangular', 'common/config/env.module'], function(ng) {

  var topology = angular.module('app.topology', ['ui.router.state','app.core','restangular', 'config']);

  topology.config(function($stateProvider, $controllerProvider, $compileProvider, $provide, $translateProvider, NavHelperProvider) {

    topology.register = {
      controller : $controllerProvider.register,
      directive : $compileProvider.directive,
      service : $provide.service,
      factory : $provide.factory
    };

    NavHelperProvider.addControllerUrl('app/topology/topology.controller');
    NavHelperProvider.addToMenu('topology', {
      "link": "#/topology",
      "title": "TOPOLOGY",
      "active": "main.topology",
      "icon": "icon-link",
      "page": {
        "title": "TOPOLOGY",
        "description": "TOPOLOGY"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.topology', {
      url: 'topology',
      access: access.public,
      views : {
        'content' : {
          templateUrl: 'src/app/topology/topology.tpl.html',
          controller: 'TopologyCtrl'
        }
      }
    });

  });

  return topology;
});
