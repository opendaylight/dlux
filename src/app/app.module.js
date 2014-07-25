//----Temporary-------\\
var module = [
  'angularAMD', 
  'app/core/core.module',
  'angular-translate', 
  'angular-translate-loader-static-files', 
  'angular-ui-router', 
  'ocLazyLoad',
  'angular-css-injector',
  'common/layout/layout.module']; //needed module

var e = [
  'ui.router', 
  'oc.lazyLoad', 
  'pascalprecht.translate',
  'angular.css.injector', 
  'app.common.layout'];
//--------------------\\

define(module, function(ng) {
  'use strict'; 
   
  var app = angular.module('app', e); 
     

  
  app.config(function ($stateProvider, $urlRouterProvider,  $ocLazyLoadProvider, $translateProvider, cssInjectorProvider) {
    $urlRouterProvider.otherwise("/");
    cssInjectorProvider.setSinglePageMode(true); //remove all added CSS files when the page change
    $ocLazyLoadProvider.config({
      debug: true,
      asyncLoader: require
    });

    $translateProvider.preferredLanguage('en_US');
  });
    
  ng.bootstrap(app);

  console.log('bootstrap done (: ');

  return app;
});
