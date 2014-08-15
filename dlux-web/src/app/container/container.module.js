define(['angularAMD', 'app/routingConfig','app/core/core.services', 'common/general/common.general.services', 'common/config/env.module'], function(ng) {
  var container = angular.module('app.container', ['app.core', 'app.common.general','ui.router.state', 'restangular', 'config']);

  container.config(function ($stateProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider) {

    container.register = {
      controller : $controllerProvider.register,
      factory : $provide.factory
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/container/container.controller');
    NavHelperProvider.addToMenu('container', {
      "link": "#/container/index",
      "title": "CONTAINER",
      "active": "container",
      "icon": "icon-sign-blank",
      "page": {
        "title": "CONTAINER",
        "description": "CONTAINER"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.container', {
      url: 'container',

      abstract: true,
      views : {
        'content' : {
          templateUrl: 'src/app/container/root.tpl.html',
          controller: 'rootContainerCtrl'
        }
      }
    });

    $stateProvider.state('main.container.index', {
      url: '/index',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/container/index.tpl.html',
          controller: 'ViewContainerCtrl'
        }
      }
    });

    $stateProvider.state('main.container.detail', {
      url: '/{container}/detail',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/container/detail.tpl.html',
          controller: 'ViewDetailContainerCtrl'
        }
      }
    });

    $stateProvider.state('main.container.edit', {
      url: '/{container}/edit',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/container/edit.tpl.html',
          controller: 'EditContainerCtrl'
        }
      }
    });

    $stateProvider.state('main.container.create', {
      url: '/create',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/container/create.tpl.html',
          controller: 'CreateContainerCtrl'
        }
      }
    });
  });

  return container;
});
