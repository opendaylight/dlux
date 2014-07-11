require.config({
  baseUrl : 'src',
  paths : {
    'angular' : '../vendor/angular/angular',
    'angularAMD' : '../vendor/angularAMD/angularAMD',
    'ngload' : '../vendor/angularAMD/ngload.min',
    'domReady' : '../venddor/requirejs-domready/domReady',
    'angular-ui-router' : '../vendor/angular-ui-router/release/angular-ui-router',
    'angular-cookies' : '../vendor/angular-cookies/angular-cookies.min',
    'jquery' : '../vendor/jquery/jquery',
    'ocLazyLoad' : '../vendor/ocLazyLoad/dist/ocLazyLoad'    
  },

  shim : {
    'angularAMD' : ['angular'],
    'ocLazyLoad' : ['angular'],
    'angular-ui-router' : ['angular'],
    'angular-cookies' : ['angular'],
    'ngload' : ['angularAMD'],
    'jquery' : {
      exports : '$'
    }
  },

  deps : ['app/app.module']

});
