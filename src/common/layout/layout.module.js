define(['angularAMD' ,'angular-ui-router', 'ocLazyLoad', 'app/core/core.module', 'app/core/core.services'], function(app) {
  var layout = angular.module('app.common.layout', ['ui.router', 'ui.state', 'app.core']);
  
  layout.config(function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $provide, TopBarHelperProvider, NavHelperProvider, ContentHelperProvider) {
    $urlRouterProvider.otherwise("/");
    
    $stateProvider.state('main', {
      url: '/',
      views : {
        'mainContent@' : {
          controller: 'AppCtrl',
          templateUrl : 'src/app/index.tpl.html'
        },
        'navigation@main' : {
          controller: 'NavCtrl',
          template: NavHelperProvider.getViews()
        },
        'topbar@main' : {
          template : TopBarHelperProvider.getViews()
        },
        'content@main' : {
          template : ContentHelperProvider.getViews()
        } 
      },
      resolve: {
        loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: ['app/app.controller'].concat(TopBarHelperProvider.getControllers()).concat(NavHelperProvider.getControllers())
          });
        }]
      }
    });

    layout.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      factory : $provide.factory,
      service : $provide.service
    };

  });

  return layout;

});
