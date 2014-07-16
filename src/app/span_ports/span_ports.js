angular.module('console.span_ports', [])

  .controller('SpanPortsCtrl', function ($scope) {

  })
  .config(function ($stateProvider) {
  $stateProvider.state('span_ports', {
    abstract: true,
    url: '/span_ports',
    templateUrl: 'span_ports/root.tpl.html'
  });

  $stateProvider.state('span_ports.index', {
    url: '/index',
    templateUrl: 'span_ports/index.tpl.html',
    views: {
      '': {
        templateUrl: 'span_ports/index.tpl.html',
        controller: ['$scope', 'SpanPortSvc', function ($scope, SpanPortSvc) {
          alert("testing;");
          SpanPortSvc.getSpanPorts().then(function(data) {
            console.log(data);
            alert("HEOO");
          });
        }]
      }
    }
  });

  $stateProvider.state('span_ports.create', {
    url: '/create',
    views: {
      '': {
        templateUrl: 'span_ports/create.tpl.html',
        controller: 'SpanPortsCtrl'
      },
    }
  });
});
