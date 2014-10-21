define(['angularAMD', 'app/routingConfig', 'ui-bootstrap', 'Restangular', 'angular-translate', 'angular-dragdrop'], function() {

  var eline = angular.module('app.eline', ['ui.router.state','app.core', 'ui.bootstrap', 'restangular', 'pascalprecht.translate', 'ngDragDrop']);

  eline.register = eline;

  eline.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $translateProvider, NavHelperProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    eline.register = {
      directive : $compileProvider.directive,
      controller : $controllerProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    NavHelperProvider.addControllerUrl('app/eline/eline.controller');
    NavHelperProvider.addToMenu('eline', {
      "link": "#/eline/index",
      "active": "main.eline",
      "title": "Elines",
      "icon": "icon-level-down",
      "page": {
        "title": "Elines UI",
        "description": "I2SS Eline provisioning UI"
      }
    });

    var access = routingConfig.accessLevels;
      $stateProvider.state('main.eline', {
          url: 'eline',
          abstract: true,
          views : {
            'content' : {
              templateUrl: 'src/app/eline/root.tpl.html'
            }
          }
      });

      $stateProvider.state('main.eline.index', {
          url: '/index',
          access: access.admin,
          views: {
              '': {
                  controller: 'elineCtrl',
                  templateUrl: 'src/app/eline/index.tpl.html'
              }
          }
      });
  });

  return eline;
});
