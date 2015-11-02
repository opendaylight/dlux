var modules = [
    'angularAMD',
    'app/routingConfig',
    'common/yangutils/yangutils.services',
    'ui-bootstrap',
    'Restangular',
    'angular-translate',
    'ngSlider',
    'angular-animate',
    'angular-aria',
    'angular-material'
];

define(modules, function() {

    var yangvisualizer = angular.module('app.yangvisualizer', ['ui.router.state','app.core', 'app.common.yangUtils', 'ui.bootstrap', 'restangular', 'pascalprecht.translate', 'ngSlider', 'ngMaterial']);

    yangvisualizer.register = yangvisualizer;

    yangvisualizer.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $translateProvider, $translatePartialLoaderProvider, NavHelperProvider, $mdThemingProvider) {

        $translatePartialLoaderProvider.addPart('app/yangvisualizer/assets/data/locale');

        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey',{
                'default': '400', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
            })
            .accentPalette('brown',{
                'default': '400', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
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