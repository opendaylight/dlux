var modules = [
  'angularAMD', 
  'app/routingConfig', 
  'common/yangutils/yangutils.services',
  'ui-bootstrap', 
  'Restangular', 
  'angular-translate'
];

define(modules, function() {

  var yangvisualizer = angular.module('app.yangvisualizer', ['ui.router.state','app.core', 'app.common.yangUtils', 'ui.bootstrap', 'restangular', 'pascalprecht.translate']);

  yangvisualizer.register = yangvisualizer;

  yangvisualizer.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    yangvisualizer.register = {
      directive : $compileProvider.directive,
      controller : $controllerProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    NavHelperProvider.addControllerUrl('app/yangvisualizer/yangvisualizer.controller');
    NavHelperProvider.addToMenu('yangvisualizer', {
      "link": "#/yangvisualizer/index",
      "active": "main.yangvisualizer",
      "title": "YANGVISUALIZER_MENU_LABEL",
      "icon": "icon-eye-open",
      "page": {
        "title": "YANGVISUALIZER_MENU_LABEL",
        "description": "YANGVISUALIZER_MENU_LABEL"
      }
    });

    var access = routingConfig.accessLevels;
      $stateProvider.state('main.yangvisualizer', {
          url: 'yangvisualizer',
          abstract: true,
          views : {
            'content' : {
              templateUrl: 'src/app/yangvisualizer/root.tpl.html'
            }
          }
      });

      $stateProvider.state('main.yangvisualizer.index', {
          url: '/index',
          access: access.admin,
          views: {
              '': {
                  controller: 'yangvisualizerCtrl',
                  templateUrl: 'src/app/yangvisualizer/index.tpl.html'
              }
          }
      });
  });

  return yangvisualizer;
});