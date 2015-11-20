var allTestFiles = [];
var TEST_REGEXP = /spec\.js$/;

var pathToModule = function(path) {
  return path.replace(/^\/base\/src\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    if (file.indexOf('yang') < 0 ) { // yang spec are broken
      allTestFiles.push(pathToModule(file));
    }
  }
});

var run = function() {
  test(allTestFiles, function() {
    console.log('Starting Karma');
    window.__karma__.start();
  });
};

var test = require.config({
  baseUrl : '/base/src',
  paths : {
    'DLUX': 'app/core/dlux',
    'DLUXLAYOUT': 'app/core/dlux-layout',
    'angular': '../vendor/angular/angular',
    'angular-mocks': '../vendor/angular-mocks/angular-mocks',
    'ui-bootstrap': '../vendor/angular-bootstrap/ui-bootstrap-tpls.min',
    'Restangular': '../vendor/restangular/dist/restangular.min',
    'underscore': '../vendor/underscore/underscore',
    'angular-ui-router': '../vendor/angular-ui-router/release/angular-ui-router',
    'angular-css-injector': '../vendor/angular-css-injector/angular-css-injector',
    'angular-cookies': '../vendor/angular-cookies/angular-cookies.min',
    'angular-translate': '../vendor/angular-translate/angular-translate.min',
    'angular-translate-loader-static-files': '../vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
    'jquery': '../vendor/jquery/jquery',
    'jquery-ui': '../vendor/jquery-ui/jquery-ui.min',
    'footable': '../vendor/footable/dist/footable.min',
    'd3': '../vendor/d3/d3.min',
    'vis': '../vendor/vis/dist/vis.min',
    'ocLazyLoad': '../vendor/ocLazyLoad/dist/ocLazyLoad',
    'sigma': '../vendor/sigma/sigma.min',
    'sigma-parsers-gexf': '../vendor/sigma/plugins/sigma.parsers.gexf.min',
    'sigma-forceAtlas2': '../vendor/sigma/plugins/sigma.layout.forceAtlas2.min',
    'sigma-dragNodes': '../vendor/sigma/plugins/sigma.plugins.dragNodes.min',
    'sigma-customShapes': '../vendor/sigma/plugins/sigma.renderers.customShapes.min',
    'ngSlider': '../vendor/ng-slider/dist/ng-slider.min'
  },
  map: {
    '*': {
      'angularAMD': 'angular'
    }
  },
  shim: {
    'angular': {
      deps: ['jquery', 'jquery-ui'],
      exports: 'angular'
     },
    'angular-mocks': ['angular'],
    'ocLazyLoad': ['angular'],
    'Restangular': ['angular', 'underscore'],
    'ui-bootstrap': ['angular'],
    'angular-css-injector': ['angular'],
    'angular-ui-router': ['angular'],
    'angular-cookies': ['angular'],
    'angular-translate': ['angular'],
    'angular-translate-loader-static-files': ['angular-translate'],
    'vis': {
      exports: 'vis'
    },
    'jquery': {
      exports: '$'
    },
    'footable': ['jquery'],
    'undescore': {
      exports: '_'
    },
    'sticky': ['jquery', 'angular'],
    'sigma-parsers-gexf': ['sigma'],
    'sigma-forceAtlas2': ['sigma'],
    'sigma-dragNodes': ['sigma'],
    'sigma-customShapes': ['sigma'],
    'ngSlider': ['angular']
  },

  deps: ['angular', 'angular-mocks'],

  callback: run
});
