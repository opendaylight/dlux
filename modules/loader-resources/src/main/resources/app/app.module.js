
// These variables are provided by the server in karaf distribution.
// The path of all *.module.js go here. They are RequireJs module.
// You can uncomment them only for development purpose if you are not using
//karaf based dlux deployment
/*
var module = [
  'angularAMD',
  'app/core/core.module',
  'angular-translate',
  'angular-translate-loader-static-files',
  'angular-translate-loader-partial',
  'angular-ui-router',
  'ocLazyLoad',
  'angular-css-injector',
  'app/node/nodes.module',
  'app/topology/topology.module',
  'common/login/login.module',
  'app/yangui/main',
  'app/yangvisualizer/yangvisualizer.module',
    'common/sigmatopology/sigmatopology.module',
  'common/navigation/navigation.module',
  'common/topbar/topbar.module',
  'common/layout/layout.module',
  'common/config/env.module']; //needed module

// The name of all angularjs module
var e = [
  'ui.router',
  'oc.lazyLoad',
  'pascalprecht.translate',
  'angular.css.injector',
  'app.nodes',
  'app.topology',
  'app.common.login',
  'app.yangui',
    'app.yangvisualizer',
    'app.common.sigmatopology',
  'app.common.nav',
  'app.common.topbar',
  'app.common.layout'];
//--------------------\\

*/

define(module, function(ng) {
  'use strict';

  var app = angular.module('app', e);


  // The overal config he is done here.
  app.config(function ($stateProvider, $urlRouterProvider,  $ocLazyLoadProvider, $translateProvider, $translatePartialLoaderProvider, cssInjectorProvider) {

    $urlRouterProvider.otherwise("/topology"); // set the default route

    cssInjectorProvider.setSinglePageMode(true); // remove all added CSS files when the page change

    // set the ocLazyLoader to output error and use requirejs as loader
    $ocLazyLoadProvider.config({
      debug: true,
      asyncLoader: require
    });

    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '/src/{part}-{lang}.json'
    });

    $translatePartialLoaderProvider.addPart('../assets/data/locale');
    $translateProvider.preferredLanguage('en_US');
  });

  ng.bootstrap(app);

  console.log('bootstrap done (: ');

  return app;
});
