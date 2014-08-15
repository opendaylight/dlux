define(['angularAMD', 'Restangular', 'app/routingConfig', 'common/general/finishRender.module', 'app/core/core.services',
    'common/general/common.general.services', 'common/config/env.module'], function (ng) {
  var flows = angular.module('app.flows', ['ui.router.state', 'app.core', 'restangular', 'app.common.finishRender','app.common.general', 'config']);

  flows.config(function($controllerProvider, $compileProvider, $provide, $stateProvider, $translateProvider, NavHelperProvider) {
    flows.register = {
      controller : $controllerProvider.register,
      directive : $compileProvider.directive,
      service : $provide.service,
      factory : $provide.factory
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.flow', {

      url: 'flow',
      views : {
        'content' : {
          templateUrl: 'src/app/flow/root.tpl.html',
          controller: 'rootFlowCtrl'
        }
      },
      abstract: true
    });

    NavHelperProvider.addControllerUrl('app/flow/flows.controller');
    NavHelperProvider.addToMenu('flow', {
      "link": "#/flow/index",
      "active": "flow",
      "title": "FLOWS",
      "icon": "icon-level-down",
      "page": {
        "title": "FLOWS",
        "description": "FLOWS"
      }
    });

    // List all flow - independant of node.
    $stateProvider.state('main.flow.index', {
      url: '/index',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/flow/index.tpl.html',
          controller: 'ListAllFlowCtrl'
        }
      }
    });

    $stateProvider.state('main.flow.create', {
      url: '/create',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/flow/create.tpl.html',
          controller: 'FlowCreateCtrl'
        },
        'composer@flow.create': {
          templateUrl: 'src/app/flow/composer.tpl.html',
          controller: 'FlowCompositionCtrl'
        },
        'composer@flow.edit': {
          templateUrl: 'src/app/flow/composer.tpl.html',
          controller: 'FlowCompositionCtrl'
        },
      }
    });

    // List the flow on a node
    $stateProvider.state('main.flow.node', {
      url: '/{nodeType}/{nodeId}',
      access: access.public,
      views: {
        '': {
          templateUrl: 'flow/node.tpl.html',
          controller: 'ListNodeFlowCtrl'
        }
      }
    });

    // Show details
    $stateProvider.state('main.flow.detail', {
      url: '/:nodeType/:nodeId/:flowName/detail',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/flow/detail.tpl.html',
          controller:'ShowDetailCtrl'
        }
      }
    });

    // Edit state which uses the '' view in flow.detail
    $stateProvider.state('main.flow.edit', {
      url: '/:nodeType/:nodeId/:flowName/edit',
      access: access.public,
      views: {
        '': {
          templateUrl: 'src/app/flow/edit.tpl.html',
          controller: 'EditStateCtrl'
        }
      }
    });
  });

  return flows;
});
