define(['common/layout/layout.module', 'common/layout/layout.services'], function(layout) {

  layout.config(function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $provide, TopBarProvider) {
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
          templateUrl: 'src/common/navigation/navigation.tpl.html'
        },
        'topbar@main' : {
          template : TopBarHelperProvider.getViews()
        }
      },
      resolve: {
        loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: ['app/app.controller', 'src/common/navigation/navigation.controller.js', 'common/topbar/topbar.controller']
          });
        }]
      }
    });

    layout.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      factory : $provide.service,
      service : $provide.service
    };

  });

  return layout;

});
