define(['app/span_ports/span_ports.module'], function(ports) {
  
  ports.register.factory('SpanPortsRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://localhost:8080');
    });
  });


  
  ports.register.factory('SpanPortSvc', function (SpanPortsRestangular) {
    var svc = {
      base: function() {
        return SpanPortsRestangular.one('restconf');
      }
    };

    svc.getSpanPorts = function() {
      return svc.base().one("spanPorts").getList();
    };

    svc.getSpanPort = function() {

    };

    svc.addSpanPort = function() {

    };

    svc.updateSpanPort = function() {

    };

    svc.deleteSpanPort = function() {

    };

    return svc;
  }); 
});
