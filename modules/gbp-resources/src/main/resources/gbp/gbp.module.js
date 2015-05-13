define(['angularAMD', 'app/routingConfig', 'ui-bootstrap', 'Restangular', 'angular-translate'], function() {

  var gbp = angular.module('app.gbp', ['ui.router.state','app.core', 'ui.bootstrap', 'restangular', 'pascalprecht.translate']);

  gbp.register = gbp;

  gbp.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider, $filterProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    gbp.register = {
      directive : $compileProvider.directive,
      controller : $controllerProvider.register,
      filter: $filterProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    NavHelperProvider.addControllerUrl('app/gbp/gbp.controller');
    NavHelperProvider.addToMenu('gbp', {
      "link": "#/gbp/index",
      "active": "main.gbp",
      "title": "GBP",
      "icon": "icon-level-down",
      "page": {
        "title": "GBP",
        "description": "GBP"
      }
    });

    var access = routingConfig.accessLevels;
      $stateProvider.state('main.gbp', {
          url: 'gbp',
          abstract: true,
          views : {
            'content' : {
              templateUrl: 'src/app/gbp/views/root.tpl.html'
            }
          }
      });

      $stateProvider.state('main.gbp.index', {
          url: '/index',
          access: access.admin,
          views: {
              '': {
                  controller: 'gbpCtrl',
                  templateUrl: 'src/app/gbp/views/index.tpl.html'
              }
          }
      });
  });

  return gbp;
});
