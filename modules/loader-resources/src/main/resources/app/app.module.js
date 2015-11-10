
// These variables are provided by the server in karaf distribution.
// The path of all *.module.js go here. They are RequireJs module.
// You can uncomment them only for development purpose if you are not using
//karaf based dlux deployment
/*
var module = [
  'DLUX',
  'angular',
  'angular-translate',
  'angular-sanitize',
  'angular-translate-loader-static-files',
  'angular-translate-loader-partial',
  'angular-ui-router',
  'ocLazyLoad',
  'angular-css-injector',
];

var deps = [
  'app/core/core.module',
  'app/node/nodes.module',
  'app/topology/topology.module',
  'common/login/login.module',
  'app/yangui/main',
  'app/yangvisualizer/yangvisualizer.module',
  'common/sigmatopology/sigmatopology.module',
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
  'ngSanitize',
  'angular.css.injector',
  'app',
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

define(module, function(DLUX, angular) {
  'use strict';
  var preboot = [],
    register = {},
    original_angular = angular,
    dlux_angular = {},
    app = angular.module('app', []);

  dlux_angular = DLUX.extendAngularContext(original_angular);

  // Keep separate the preboot process with all modules
  dlux_angular.module = function (name, deps) {
    var module = null;

    // To avoid modules to have a new api
    // this if statement replace each dlux module from doing the call DLUX.createModule
    if (DLUX.isDLUXModule(name)) {
      module = DLUX.createModule(name, deps, DLUX.IsInternalModule(name));
    } else {
      module = angular.module(name, deps);
    }

    preboot.push(module);
    return module;
  };

  window.angular = dlux_angular; // backward compatibility

  // The overal config he is done here.
  app.config(function ($urlRouterProvider,  $ocLazyLoadProvider, $translateProvider, $translatePartialLoaderProvider, $controllerProvider, $compileProvider, $provide, $filterProvider, cssInjectorProvider) {

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
    $translateProvider.useSanitizeValueStrategy('escape');

    // the only way to add a dynamic module
    register = {
        controller : $controllerProvider.register,
        directive : $compileProvider.directive,
        factory : $provide.factory,
        filter: $filterProvider.register,
        service : $provide.service
    };

    app.register = {};
    angular.extend(app.register, register);
  });

  /* --- define vs require war ---
   * From my understanding, we use require when
   * we want to load a dependency and run it. Define
   * is only to define the dependency for a module.
   */
  require(deps, function () {
    angular.element(document).ready(function () {
      angular.bootstrap(document, e).invoke(function () {
        preboot.forEach(function (m) {
          if (m instanceof DLUX.Module) {
            angular.extend(m.ng, register);
          } else {
            angular.extend(m, register);
          }
        });
        console.log('bootstrap done (: ');
      });
    });
  });

  return app;
});
