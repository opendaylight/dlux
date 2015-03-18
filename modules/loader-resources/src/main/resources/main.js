require.config({
  baseUrl : 'src',
  paths : {
    'angular' : '../vendor/angular/angular',
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
    'jquery' : '../vendor/jquery/jquery.min',
    'jquery-ui' : '../vendor/jquery-ui/jquery-ui.min',
    'footable' : '../vendor/footable/dist/footable.min',
    'd3' : '../vendor/d3/d3.min',
    'vis' : '../vendor/vis/dist/vis.min',
    'ocLazyLoad' : '../vendor/ocLazyLoad/dist/ocLazyLoad',
    'sigma' : '../vendor/sigma/sigma.min',
    'sigma-parsers-gexf' : '../vendor/sigma/plugins/sigma.parsers.gexf.min',
    'sigma-forceAtlas2' : '../vendor/sigma/plugins/sigma.layout.forceAtlas2.min',
    'sigma-dragNodes' : '../vendor/sigma/plugins/sigma.plugins.dragNodes.min',
    'sigma-customShapes' : '../vendor/sigma/plugins/sigma.renderers.customShapes.min'
  },

  shim : {
    'angularAMD' : ['angular'],
    'ocLazyLoad' : ['angular'],
    'Restangular' : ['angular', 'underscore'],
    'ui-bootstrap' : ['angular'],
    'angular-css-injector' : ['angular'],
    'angular-ui-router' : ['angular'],
    'angular-cookies' : ['angular'],
    'angular-translate': ['angular'],
    'angular-translate-loader-static-files' : ['angular-translate'],
    'ngload' : ['angularAMD'],
    'jquery' : {
      exports : '$'
    },
    'jquery-ui' : ['jquery'],
    'angular' : {
        deps: ['jquery','jquery-ui'],
        exports: 'angular'
    },
    'footable' : ['jquery'],
    'undescore' : {
      exports : '_'
    },
    'sticky' : ['jquery', 'angular'],
    'sigma-parsers-gexf' : ['sigma'],
    'sigma-forceAtlas2' : ['sigma'],
    'sigma-dragNodes' : ['sigma'],
    'sigma-customShapes' : ['sigma']
  },

  deps : ['app/app.module']

});
