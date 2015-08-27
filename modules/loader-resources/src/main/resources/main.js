require.config({
  baseUrl : 'src',
  packages: [{
    name: "codemirror",
    location: "../assets/js/codemirror",
    main: "lib/codemirror"
  }],
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
    'pixi': '../vendor/pixi/bin/pixi',
    'd3' : '../vendor/d3/d3.min',
    'ocLazyLoad' : '../vendor/ocLazyLoad/dist/ocLazyLoad',
    'vis' : '../vendor/vis/dist/vis.min',
    'sigma' : '../vendor/sigma/sigma.min',
    'sigma-parsers-gexf' : '../vendor/sigma/plugins/sigma.parsers.gexf.min',
    'sigma-forceAtlas2' : '../vendor/sigma/plugins/sigma.layout.forceAtlas2.min',
    'sigma-dragNodes' : '../vendor/sigma/plugins/sigma.plugins.dragNodes.min',
    'sigma-customShapes' : '../vendor/sigma/plugins/sigma.renderers.customShapes.min',
    'graphRenderer' : '../assets/js/graphRenderer',
    'ngSlider' : '../vendor/ng-slider/dist/ng-slider.min',
    'codeMirror-showHint' : '../assets/js/codemirror/addon/hint/show-hint',
    'codeMirror-yanguiJsonHint' : '../assets/js/codemirror/addon/hint/yangui-json-hint',
    'codeMirror-javascriptMode' : '../assets/js/codemirror/mode/javascript/javascript',
    'codeMirror-matchBrackets' : '../assets/js/codemirror/addon/edit/matchbrackets',
    'ZeroClipboard' : '../vendor/zeroclipboard/dist/ZeroClipboard',
    'ngClip' : '../vendor/ng-clip/src/ngClip'
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
    'pixi' : {
        exports: 'PIXI'
    },
    'vis' : {
        exports: 'vis'
    },
    'graphRenderer' : ['pixi'],
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
    'sigma-customShapes' : ['sigma'],
    'ngSlider' : ['angular'],
    'codeMirros_showHint': ['codemirror'],
    'codeMirros_javascriptHint': ['codemirror'],
    'codeMirror_javascriptMode': ['codemirror'],
    'codeMirror_matchBrackets': ['codemirror'],
    'ZeroClipboard': ['angular'],
    'ngClip' : ['angular','ZeroClipboard']
  },

  deps : ['app/app.module']

});
