//----Temporary-------\\
var module = ['angularAMD', 'app/core/core.module', 'angular-ui-router', 'ocLazyLoad', 'common/navigation/navigation.module','common/topbar/topbar.module' , 'common/authentification/auth.module', 'common/layout/layout.module']; //needed module

var e = ['ui.router','ui.state', 'oc.lazyLoad', 'app.common.nav', 'app.common.topbar', 'app.common.auth', 'app.common.layout'];
//--------------------\\

define(module, function(ng) {
  'use strict'; 
   
  var app = angular.module('app', e); 
     
  console.log('bootstrap done (: ');
  
  app.config(function ($stateProvider, $urlRouterProvider,  $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/");
      
    $ocLazyLoadProvider.config({
      debug: true,
      asyncLoader: require
    });
    /*
    $stateProvider.state('root', {
      url : '/',
      views : { 
        'mainContent' : {
          controller: 'AppCtrl',
          templateUrl: 'src/app/index.tpl.html'
        }
      },
      resolve: {
        test: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: ['src/app/app.controller.js']
          });
        }]
      }
    }); */
  });
    
  ng.bootstrap(app);

  return app;
});
