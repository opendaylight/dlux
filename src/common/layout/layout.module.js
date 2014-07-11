define(['angularAMD' ,'angular-ui-router', 'ocLazyLoad', 'app/core/core.module', 'app/core/core.services', 'common/general/common.navigation.directives','common/general/common.general.directives'], function(app) {
  var layout = angular.module('app.common.layout', ['ui.router.state', 'app.core', 'app.common.general', 'app.common.navigation']);
  
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
          template: NavHelperProvider.getViews(),
          controller: 'NavCtrl'
        },
        'topbar@main' : {
          template : TopBarHelperProvider.getViews(),
          controller: function($scope) {
            $scope['section_logo'] = 'logo_container';
          }
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
