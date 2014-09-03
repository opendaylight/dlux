define(['angularAMD', 'app/routingConfig', 'app/core/core.services', 'Restangular', 'common/config/env.module'], function(ng) {

  var connection_manager = angular.module('app.connection_manager', ['app.core', 'ui.router.state', 'restangular', 'config' ]);

  connection_manager.config(function ($stateProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider) {

    connection_manager.register = {
      controller : $controllerProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/connection_manager/connection_manager.controller');
    NavHelperProvider.addToMenu('connection_manager', {
      "link": "#/connection_manager/index",
      "active": "main.connection_manager.*",
      "title": "CONNECTION_MANAGER",
      "icon": "icon-bolt",
      "page": {
        "title": "CONNECTION_MANAGER",
        "description": "CONNECTION_MANAGER"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.connection_manager', {
      abstract: true,
      url: 'connection_manager',
      views : {
        'content' : {
          templateUrl: 'src/app/connection_manager/root.tpl.html',
          controller: 'rootConnectionManagerCtrl'
        }
      }
    });

    $stateProvider.state('main.connection_manager.index', {
      url: '/index',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/connection_manager/index.tpl.html',
          controller: 'ConnectionManagerCtrl'
        }
      }
    });

    $stateProvider.state('main.connection_manager.discover', {
      url: '/discover',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/connection_manager/discover.tpl.html',
          controller: 'ConnectionManagerDiscoveryCtrl'
        }
      }
    });
  });

  return connection_manager;
});
