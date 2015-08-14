
// These variables are provided by the server in karaf distribution.
// The path of all *.module.js go here. They are RequireJs module.
// You can uncomment them only for development purpose if you are not using
//karaf based dlux deployment
/*
var module = [
  'angular',
  'angular-translate',
  'angular-translate-loader-static-files',
  'angular-ui-router',
  'ocLazyLoad',
  'angular-css-injector',
];

var deps = [
  'app/core/core.module',
  'app/node/nodes.module',
  'app/topology/topology.module',
  'app/yangui/yangui.module',
  'common/login/login.module',
  'common/navigation/navigation.module',
  'common/topbar/topbar.module',
  'common/layout/layout.module',
  'common/config/env.module'
];

// The name of all angularjs module
var e = [
  'ui.router',
  'oc.lazyLoad',
  'pascalprecht.translate',
  'angular.css.injector',
  'app',
  'app.nodes',
  'app.topology',
  'app.common.login',
  'app.yangui',
  'app.common.nav',
  'app.common.topbar',
  'app.common.layout'];
//--------------------\\

*/

define(module, function(angular) {
  'use strict';
  var preboot = [],
    register = {},
    dlux_angular = {},
    orig_angular = angular,
    app = angular.module('app', []);

  angular.extend(dlux_angular, orig_angular);

  dlux_angular.module = function(name, deps) {
    var module = orig_angular.module(name, deps);
    preboot.push(module);
    return module;
  };

  window.angular = dlux_angular; // backward compatibility

  // The overal config he is done here.
  app.config(function ($urlRouterProvider, $ocLazyLoadProvider, $translateProvider, $controllerProvider, $compileProvider, $provide, cssInjectorProvider) {

    $urlRouterProvider.otherwise("/topology"); // set the default route

    cssInjectorProvider.setSinglePageMode(true); // remove all added CSS files when the page change

    // set the ocLazyLoader to output error and use requirejs as loader
    $ocLazyLoadProvider.config({
      debug: true,
      asyncLoader: require
    });
    
    // the only way to add a dynamic module
    register = {
        controller : $controllerProvider.register,
        directive : $compileProvider.directive,
        factory : $provide.factory,
        service : $provide.service
    };

    $translateProvider.preferredLanguage('en_US');
     
    app.register = {};
    angular.extend(app.register, register);
  });

  /* --- define vs require war --- 
   * From my understanding, we use require when
   * we want to load a dependency and run it. Define
   * is only to define the dependency for a module.
   */
  require(deps, function() {
    angular.element(document).ready(function() {
      angular.bootstrap(document, e).invoke(function() {
        preboot.forEach(function(m) {
            angular.extend(m, register);
        });
        console.log('bootstrap done (: ');
      });
    });
  });

  return app;
});
