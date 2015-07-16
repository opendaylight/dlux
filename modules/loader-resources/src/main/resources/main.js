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
    'angular-sanitize' : '../vendor/angular-sanitize/angular-sanitize',
    'ui-select2' :  '../vendor/angular-ui-select2/index',
    'jquery' : '../vendor/jquery/jquery.min',
    'jquery-ui' : '../vendor/jquery-ui/jquery-ui.min',
    'ui-unique'  : '../vendor/angular-ui-utils/modules/unique/unique',
    'footable' : '../vendor/footable/dist/footable.min',
    'pixi': '../vendor/pixi/bin/pixi',
    'd3' : '../vendor/d3/d3.min',
    'ocLazyLoad' : '../vendor/ocLazyLoad/dist/ocLazyLoad',
    'vis' : '../vendor/vis/dist/vis.min',
    'select2' :  '../vendor/select2/select2',
    'sigma' : '../vendor/sigma/sigma.min',
    'sigma-parsers-gexf' : '../vendor/sigma/plugins/sigma.parsers.gexf.min',
    'sigma-forceAtlas2' : '../vendor/sigma/plugins/sigma.layout.forceAtlas2.min',
    'sigma-dragNodes' : '../vendor/sigma/plugins/sigma.plugins.dragNodes.min',
    'sigma-customShapes' : '../vendor/sigma/plugins/sigma.renderers.customShapes.min',
    'ngTable' : '../vendor/ng-table/ng-table.min',
    'graphRenderer' : '../assets/js/graphRenderer',
    'ngSlider' : '../vendor/ng-slider/dist/ng-slider.min',
    'angular-dragdrop': '../vendor/angular-dragdrop/draganddrop',
    'ngStorage': '../vendor/ngstorage/ngStorage.min',
    'xeditable' : '../vendor/angular-xeditable/dist/js/xeditable',
    'ui-sortable' : '../vendor/angular-ui-sortable/sortable',
    
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
    'angular-sanitize' : ['angular'],
    'ngload' : ['angularAMD'],
    'pixi' : {
        exports: 'PIXI'
    },
    'graphRenderer' : ['pixi'],
    'jquery' : {
      exports : '$'
    },
    'jquery-ui' : ['jquery'],
    'ngDragDrop' : ['angular'],
    'ui-sortable' : ['angular'],
    'ui-unique' : ['angular'],
    'ngTable' : ['angular'],
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
    'sigma-customShapes' : ['sigma'],
    'angular-dragdrop' : ['angular'],
    'ngSlider' : ['angular'],
    'ui-select2' : ['select2'],
    'select2' : ['angular'],
    'ngStorage' : ['angular'],
    'xeditable' : ['angular'],
  },

  deps : ['app/app.module']

});
