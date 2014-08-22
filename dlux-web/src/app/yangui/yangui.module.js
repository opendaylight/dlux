define(['angularAMD', 'app/routingConfig', 'common/yangutils/yangutils.services','ui-bootstrap', 'Restangular', 'angular-translate'], function() {

  var yangui = angular.module('app.yangui', ['ui.router.state','app.core', 'app.common.yangUtils', 'ui.bootstrap', 'restangular', 'pascalprecht.translate']);

  yangui.register = yangui;

  yangui.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    yangui.register = {
      directive : $compileProvider.directive,
      controller : $controllerProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    NavHelperProvider.addControllerUrl('app/yangui/yangui.controller');
    NavHelperProvider.addToMenu('yangui', {
      "link": "#/yangui/index",
      "active": "main.yangui",
      "title": "Yang UI",
      "icon": "icon-level-down",
      "page": {
        "title": "Yang UI",
        "description": "Yang UI"
      }
    });

    var access = routingConfig.accessLevels;
      $stateProvider.state('main.yangui', {
          url: 'yangui',
          abstract: true,
          views : {
            'content' : {
              templateUrl: 'src/app/yangui/root.tpl.html'
            }
          }
      });

      $stateProvider.state('main.yangui.index', {
          url: '/index',
          access: access.admin,
          views: {
              '': {
                  controller: 'yanguiCtrl',
                  templateUrl: 'src/app/yangui/index.tpl.html'
              }
          }
      });
  });

  return yangui;
});
