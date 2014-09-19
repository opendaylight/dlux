define(['app/network/network.module'], function(network) {

  network.register.factory('NetworkRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("AD_SAL"));
    });
  });


  network.register.factory('StaticRouteSvc', function (NetworkRestangular) {
    var svc = {
      base: function (container) {
        container = container || 'default';
        return NetworkRestangular.one('controller/nb/v2').one('staticroute', container);
      }
    };

    svc.delete = function(staticRouteName) {
      svc.routeUrl("default", staticRouteName).remove();
    };

    svc.routesUrl = function (container) {
      return svc.base(container).all('routes');
    };

    svc.routeUrl = function (container, name) {
      return svc.base(container).one('route', name);
    };

    return svc;
  });


  network.register.factory('SubnetSvc', function (NetworkRestangular) {
    var svc = {
      base: function (container) {
        container = container || 'default';
        return NetworkRestangular.one('controller/nb/v2').one('subnetservice', container);
      }
    };

    svc.subnetsUrl = function (container) {
      return svc.base(container).all('subnets');
    };

    svc.subnetUrl = function (container, name) {
      return svc.base(container).one('subnet', name);
    };

    svc.delete = function(subnetName) {
      return svc.subnetUrl('default', subnetName).remove();
    };

    svc.subnetPortsUrl = function (container, name) {
      return svc.base(container).one('subnet', name).all('node-ports');
    };

    return svc;
  });


});
