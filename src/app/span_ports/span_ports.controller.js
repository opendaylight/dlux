define(['app/span_ports/span_ports.module','app/span_ports/span_ports.services'], function(ports) {

  ports.register.controller('SpanPortsCtrl', function ($scope) {

  });

  
  ports.register.controller('SpanPortIndexCtrl',['$scope', 'SpanPortSvc', function ($scope, SpanPortSvc) {
    alert("testing;");
    SpanPortSvc.getSpanPorts().then(function(data) {
      console.log(data);
      alert("HEOO");
    });
  }]);
 
});
