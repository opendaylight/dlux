define(['app/span_ports/span_ports.module'], function(ports) {
  
  ports.register.factory('SpanPortsRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://odl.cloudistic.me:8080/restconf');
    });
  });


  
  ports.register.factory('SpanPortSvc', function (SpanPortsRestangular) {
    var svc = {
      base: function(container) {
        return SpanPortsRestangular.one(container);
      }
    };

    svc.getSpanPorts = function() {
      return svc.base("spanPorts").getList();
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
