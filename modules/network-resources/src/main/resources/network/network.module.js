define(['angularAMD', 'app/routingConfig', 'app/core/core.services', 'Restangular', 'common/config/env.module'], function(ng) {
  var network = angular.module('app.networking', ['ui.router.state','app.core','restangular', 'config']);

  network.config(function ($stateProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    network.register = {
      controller : $controllerProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    NavHelperProvider.addControllerUrl('app/network/network.controller');
    NavHelperProvider.addToMenu('network', {
      "link": "#/network/staticroute",
      "title": "NETWORK",
      "active": "main.network",
      "icon": "icon-cloud",
      "page": {
        "title": "NETWORK",
        "description": "NETWORK"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.network', {
      url: 'network',
      views : {
        'content' : {
          templateUrl: 'src/app/network/root.tpl.html',
          controller : 'NetworkCtrl'
        }
      },
      abstract: true
    });
     /*
    $stateProvider.state('main.network.index', {
      url: '/index',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/network/index.tpl.html',
          controller: 'NetworkCtrl'
        }
      }
    });*/

    $stateProvider.state('main.network.staticroutes', {
      url: '/staticroute',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/network/staticroutes.tpl.html',
          controller: 'StaticRouteCtrl'
        }
      }
    });

    $stateProvider.state('main.network.staticroutes.create', {
      url: '/create',
      access: access.public,
      views: {
        '@main.network': {
          templateUrl: 'src/app/network/staticroutes.create.tpl.html',
          controller: 'StaticRouteCreateCtrl'
        }
      }
    });

    $stateProvider.state('main.network.staticroutes.edit', {
      url: '/:name/edit',
      access: access.public,
      views: {
        '@main.network': {
          templateUrl: 'src/app/network/staticroutes.edit.tpl.html',
          controller: 'StaticRouteEditCtrl'
        }
      }
    });

    $stateProvider.state('main.network.subnets', {
      url: '/subnet',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/network/subnets.tpl.html',
          controller: 'SubnetCtrl'
        }
      }
    });

    $stateProvider.state('main.network.subnets.create', {
      url: '/create',
      views: {
        '@main.network': {
          templateUrl: 'src/app/network/subnets.create.tpl.html',
          controller: 'SubnetCreateCtrl'
        }
      }
    });

    $stateProvider.state('main.network.subnets.edit', {
      url: '/:name/edit',
      views: {
        '@main.network': {
          templateUrl: 'src/app/network/subnets.edit.tpl.html',
          controller: 'SubnetEditCtrl'
        }
      }
    });

  });

  return network;
});
