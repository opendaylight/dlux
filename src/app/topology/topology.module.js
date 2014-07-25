define(['angularAMD', 'app/routingConfig', 'app/core/core.services','Restangular'], function(ng) {

  var topology = angular.module('app.topology', ['ui.router.state','app.core','restangular']);

  topology.config(function($stateProvider, $controllerProvider, $compileProvider, $provide, $translateProvider, NavHelperProvider) {

    topology.register = {
      controller : $controllerProvider.register,
      directive : $compileProvider.directive,
      service : $provide.service,
      factory : $provide.factory
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/topology/topology.controller');
    NavHelperProvider.addToMenu('topology', {
      "link": "index.html#/topology",
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
