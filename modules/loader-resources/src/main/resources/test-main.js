var allTestFiles = [];
var TEST_REGEXP = /spec\.js$/;

var pathToModule = function(path) {
  return path.replace(/^\/base\/src\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    if (file.indexOf('yang') < 0 && file.indexOf('sfc') < 0) { // yang specs and sfc specs are broken
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
    'angular' : '../vendor/angular/angular',
    'angular-mocks' : '../vendor/angular-mocks/angular-mocks',
    'angularAMD' : '../vendor/angularAMD/angularAMD',
    'ngload' : '../vendor/angularAMD/ngload',
    'ui-bootstrap' : '../vendor/angular-bootstrap/ui-bootstrap-tpls.min',
    'domReady' : '../vendor/requirejs-domready/domReady',
    'Restangular' : '../vendor/restangular/dist/restangular.min',
    'underscore' : '../vendor/underscore/underscore',
    'angular-ui-router' : '../vendor/angular-ui-router/release/angular-ui-router',
    'angular-css-injector' : '../vendor/angular-css-injector/angular-css-injector',
    'angular-cookies' : '../vendor/angular-cookies/angular-cookies.min',
    'angular-translate' : '../vendor/angular-translate/angular-translate.min',
    'angular-translate-loader-static-files' : '../vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
    'angular-sanitize' : '../vendor/angular-sanitize/angular-sanitize',
    'ui-select2' :  '../vendor/angular-ui-select2/index',
    'jquery' : '../vendor/jquery/jquery.min',
    'jquery-ui' : '../vendor/jquery-ui/jquery-ui.min',
    'footable' : '../vendor/footable/dist/footable.min',
    'pixi': '../vendor/pixi/bin/pixi',
    'd3' : '../vendor/d3/d3.min',
    'vis' : '../vendor/vis/dist/vis.min',
    'select2' :  '../vendor/select2/select2',
    'ocLazyLoad' : '../vendor/ocLazyLoad/dist/ocLazyLoad',
    'sigma' : '../vendor/sigma/sigma.min',
    'sigma-parsers-gexf' : '../vendor/sigma/plugins/sigma.parsers.gexf.min',
    'sigma-forceAtlas2' : '../vendor/sigma/plugins/sigma.layout.forceAtlas2.min',
    'sigma-dragNodes' : '../vendor/sigma/plugins/sigma.plugins.dragNodes.min',
    'sigma-customShapes' : '../vendor/sigma/plugins/sigma.renderers.customShapes.min',
    'graphRenderer' : '../assets/js/graphRenderer',
    'ngSlider' : '../vendor/ng-slider/dist/ng-slider.min',
    'angular-dragdrop': '../vendor/angular-dragdrop/draganddrop',
    'ngStorage': '../vendor/ngstorage/ngStorage',
    'xeditable' : '../vendor/angular-xeditable/dist/js/xeditable',
    'ui-sortable' : '../vendor/angular-ui-sortable/sortable',
    'ui-unique'  : '../vendor/angular-ui-utils/modules/unique/unique',
    'ngTable' : '../vendor/ng-table/ng-table'
  },

  shim : {
    'jquery' : {
      exports : '$'
    },
    'angular' : ['jquery'],
    'angular-mocks' : ['angular'],
    'angularAMD' : ['angular'],
    'ocLazyLoad' : ['angular'],
    'Restangular' : ['angular', 'underscore'],
    'ui-bootstrap' : ['angular'],
    'angular-css-injector' : ['angular'],
    'angular-ui-router' : ['angular'],
    'angular-cookies' : ['angular'],
    'angular-translate': ['angular'],
    'angular-translate-loader-static-files' : ['angular-translate'],
    'angular-sanitize' : ['angular'],
    'ngload' : ['angularAMD'],
    'pixi' : {
        exports: 'PIXI'
    },
    'graphRenderer' : ['pixi'],
    
    'footable' : ['jquery'],
    'undescore' : {
      exports : '_'
    },
    'sticky' : ['jquery', 'angular'],
    'sigma-parsers-gexf' : ['sigma'],
    'sigma-forceAtlas2' : ['sigma'],
    'sigma-dragNodes' : ['sigma'],
    'sigma-customShapes' : ['sigma'],
    'ngSlider' : ['angular'],
    'ui-select2' : ['select2'],
    'select2' : ['angular'],
    'ngStorage' : ['angular'],
    'xeditable' : ['angular'],
    'ngDragDrop' : ['angular'],
    'ui-sortable' : ['angular'],
    'ui-unique' : ['angular'],
    'ngTable' : {deps : [ "jquery", "angular" ]},
  },

  deps : ['angular', 'angular-mocks'],

  callback: run
});
