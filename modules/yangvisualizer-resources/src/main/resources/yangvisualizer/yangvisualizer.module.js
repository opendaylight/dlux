var modules = [
  'angularAMD', 
  'app/routingConfig', 
  'common/yangutils/yangutils.services',
  'ui-bootstrap', 
  'Restangular', 
  'angular-translate',
  'ngSlider'
];

define(modules, function() {

  var yangvisualizer = angular.module('app.yangvisualizer', ['ui.router.state','app.core', 'app.common.yangUtils', 'ui.bootstrap', 'restangular', 'pascalprecht.translate', 'ngSlider']);

  yangvisualizer.register = yangvisualizer;

  yangvisualizer.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $translateProvider, $translatePartialLoaderProvider, NavHelperProvider) {

    $translatePartialLoaderProvider.addPart('app/yangvisualizer/assets/data/locale');

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
      "title": "Yang Visualizer",
      "icon": "icon-eye-open",
      "page": {
        "title": "Yang Visualizer",
        "description": "Yang Visualizer"
      }
    });

    var access = routingConfig.accessLevels;
      $stateProvider.state('main.yangvisualizer', {
          url: 'yangvisualizer',
          abstract: true,
          views : {
            'content' : {
              templateUrl: 'src/app/yangvisualizer/views/root.tpl.html'
            }
          }
      });

      $stateProvider.state('main.yangvisualizer.index', {
          url: '/index',
          access: access.admin,
          views: {
              '': {
                  controller: 'yangvisualizerCtrl',
                  templateUrl: 'src/app/yangvisualizer/views/index.tpl.html'
              }
          }
      });
  });

  return yangvisualizer;
});