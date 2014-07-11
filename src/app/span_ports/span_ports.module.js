define(['angularAMD'], function(ng) {

  var ports = angular.module('app.span_ports', ['ui.router.state','app.core','restangular']);

  ports.config(function ($stateProvider, $controllerProvider, $provide, NavHelperProvider) {
  
    ports.register = {
      controller: $controllerProvider.register,
      factory : $provide.factory,
      service : $provide.service
    };

    $stateProvider.state('main.span_ports', {
      abstract: true,
      url: '/span_ports',
      views : {
        'content' : {
          templateUrl: 'src/app/span_ports/root.tpl.html'
        }
      }
    });

    $stateProvider.state('main.span_ports.index', {
      url: '/index',
      views: {
        '': {
          templateUrl: 'src/app/span_ports/index.tpl.html',
          controller:'SpanPortIndexCtrl'        
        }  
      }
    });

    $stateProvider.state('main.span_ports.create', {
      url: '/create',
      views: {
        '': {
          templateUrl: 'src/app/span_ports/create.tpl.html',
          controller: 'SpanPortsCtrl'
        },
      }
    });
  });

  return ports;
});
