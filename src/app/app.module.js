//----Temporary-------\\
var module = [
  'angularAMD', 
  'app/core/core.module',
  'angular-translate', 
  'angular-translate-loader-static-files', 
  'angular-ui-router', 'ocLazyLoad', 
  'common/navigation/navigation.module', 
  'app/node/nodes.module',
  'app/connection_manager/connection_manager.module',
  'app/container/container.module',
  'app/flow/flows.module',
  'app/yangui/yangui.module',
  'app/topology/topology.module',
  'app/network/network.module',
  'common/topbar/topbar.module', 
  'common/authentification/auth.module', 
  'common/layout/layout.module']; //needed module

var e = [
  'ui.router', 
  'oc.lazyLoad', 
  'pascalprecht.translate',
  'app.nodes',
  'app.connection_manager',
  'app.container',
  'app.flows',
  'app.networking',
  'app.topology',
  'app.yangui',
  'app.common.nav', 
  'app.common.topbar', 
  'app.common.auth', 
  'app.common.layout'];
//--------------------\\

define(module, function(ng) {
  'use strict'; 
   
  var app = angular.module('app', e); 
     
  console.log('bootstrap done (: ');
  
  app.config(function ($stateProvider, $urlRouterProvider,  $ocLazyLoadProvider, $translateProvider) {
    $urlRouterProvider.otherwise("/");
    
    $ocLazyLoadProvider.config({
      debug: true,
      asyncLoader: require
    });

    $translateProvider.preferredLanguage('en_US');
  });
    
  ng.bootstrap(app);

  return app;
});
