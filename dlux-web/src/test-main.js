var allTestFiles = [];
var TEST_REGEXP = /spec\.js$/;

var pathToModule = function(path) {
  return path.replace(/^\/base\/src\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

var run = function(){
  test(allTestFiles, function (){
    console.log('Starting Karma');
    window.__karma__.start();
  });
};

var test = require.config({
  baseUrl : '/base/src',
  paths : {
    'jquery' : '../vendor/jquery/jquery',
    'jquery-ui' : '../vendor/jquery-ui/ui/jquery-ui',
    'angular' : '../vendor/angular/angular',
    'angular-mocks' : '../vendor/angular-mocks/angular-mocks',
    'angularAMD' : '../vendor/angularAMD/angularAMD',
    'ngload' : '../vendor/angularAMD/ngload',
    'ui-bootstrap' : '../vendor/angular-bootstrap/ui-bootstrap-tpls.min',
    'domReady' : '../venddor/requirejs-domready/domReady',
    'Restangular' : '../vendor/restangular/dist/restangular.min',
    'underscore' : '../vendor/underscore/underscore',
    'underscore-string' : '../vendor/underscore.string/dist/underscore.string.min',
    'angular-ui-router' : '../vendor/angular-ui-router/release/angular-ui-router',
    'angular-css-injector' : '../vendor/angular-css-injector/angular-css-injector',
    'angular-cookies' : '../vendor/angular-cookies/angular-cookies.min',
    'angular-translate' : '../vendor/angular-translate/angular-translate.min',
    'angular-translate-loader-static-files' : '../vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
    'angular-sanitize' : '../vendor/angular-sanitize/angular-sanitize',
    'footable' : '../vendor/footable/dist/footable.min',
    'd3' : '../vendor/d3/d3.min',
    'vis' : '../vendor/vis/dist/vis.min',
    'select2' :  '../vendor/select2/select2',
    'ui-select2' :  '../vendor/angular-ui-select2/index',
    'ocLazyLoad' : '../vendor/ocLazyLoad/dist/ocLazyLoad',
    'ui-unique'  : '../vendor/angular-ui-utils/modules/unique/unique',
    'ui-sortable' : '../vendor/angular-ui-sortable/sortable',
    'ngDragDrop' : '../vendor/angular-dragdrop/draganddrop',
    'xeditable' : '../vendor/angular-xeditable/dist/js/xeditable'
  },

  shim : {
    'angular' : ['jquery'],
    'angular-mocks' : ['angular'],
    'angularAMD' : ['angular'],
    'ocLazyLoad' : ['angular'],
    'Restangular' : ['angular', 'underscore'],
    'ui-bootstrap' : ['angular'],
    'ui-unique' : ['angular'],
    'ui-sortable' : ['angular'],
    'select2' : ['angular'],
    'ui-select2' : ['select2'],
    'angular-css-injector' : ['angular'],
    'angular-ui-router' : ['angular'],
    'angular-cookies' : ['angular'],
    'angular-translate': ['angular'],
    'angular-translate-loader-static-files' : ['angular-translate'],
    'angular-sanitize' : ['angular'],
    'ngload' : ['angularAMD'],
    'ngDragDrop' : ['angular'],
    'xeditable' : ['angular'],
    'jquery-ui' : ['jquery'],
    'jquery' : {
      exports : '$'
    },
    'footable' : ['jquery'],
    'underscore' : {
      exports : '_'
    },
    'underscore-string' : {
      exports : '_.str',
      deps : ['underscore']
    }
  },

  // dynamically load all test files
  deps: ['angular', 'angular-mocks'],

  // we have to kickoff jasmine, as it is asynchronous
  callback: run
});
