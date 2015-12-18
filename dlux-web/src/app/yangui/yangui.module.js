var modules = [
        'ZeroClipboard',
        'angularAMD',
        'app/routingConfig',
        'ui-bootstrap',
        'Restangular',
        'angular-translate',
        'jquery-ui',
        'codemirror',
        'codeMirror-showHint',
        'codeMirror-yanguiJsonHint',
        'codeMirror-javascriptMode',
        'codeMirror-matchBrackets',
        'ngClip',
        'common/yangutils/yangutils.services',
        'common/yangutils/listfiltering.services',
        'angular-translate-loader-partial'
    ],
    ZeroClipboard = null;

define(modules, function(ZC) {
  ZeroClipboard = ZC;

  var yangui = angular.module('app.yangui', ['ui.router.state','app.core', 'app.common.yangUtils', 'app.common.listFiltering', 'ui.bootstrap', 'restangular', 'pascalprecht.translate', 'ngClipboard']);

  yangui.register = yangui;

  yangui.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, $filterProvider, $translateProvider,$translatePartialLoaderProvider, NavHelperProvider, ngClipProvider) {

    $translatePartialLoaderProvider.addPart('app/yangui/assets/data/locale');

    ngClipProvider.setPath("assets/ZeroClipboard.swf");

    yangui.register = {
      directive : $compileProvider.directive,
      controller : $controllerProvider.register,
      factory : $provide.factory,
      filter: $filterProvider.register,
      service : $provide.service,
      constant : $provide.constant
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
              templateUrl: 'src/app/yangui/views/root.tpl.html'
            }
          }
      });

      $stateProvider.state('main.yangui.index', {
          url: '/index',
          access: access.admin,
          views: {
              '': {
                  controller: 'yanguiCtrl',
                  templateUrl: 'src/app/yangui/views/index.tpl.html'
              }
          }
      });
  });

  return yangui;
});
