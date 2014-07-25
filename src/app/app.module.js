//----Temporary-------\\

// This is provided by the server.
// The path of all *.module.js go here. They are RequireJs module
var module = [
  'angularAMD',
  'app/core/core.module',
  'angular-translate',
  'angular-translate-loader-static-files',
  'angular-ui-router',
  'ocLazyLoad',
  'angular-css-injector',
  'app/yangui/yangui.module',
  'common/navigation/navigation.module',
  'common/topbar/topbar.module',
  'common/layout/layout.module']; //needed module

// The name of all angularjs module
var e = [
  'ui.router',
  'oc.lazyLoad',
  'pascalprecht.translate',
  'angular.css.injector',
  'app.yangui',
  'app.common.nav',
  'app.common.topbar',
  'app.common.layout'];
//--------------------\\

define(module, function(ng) {
  'use strict';

  var app = angular.module('app', e);


  // The overal config he is done here.
  app.config(function ($stateProvider, $urlRouterProvider,  $ocLazyLoadProvider, $translateProvider, cssInjectorProvider) {

    $urlRouterProvider.otherwise("/"); // set the default route

    cssInjectorProvider.setSinglePageMode(true); // remove all added CSS files when the page change

    // set the ocLazyLoader to output error and use requirejs as loader
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
