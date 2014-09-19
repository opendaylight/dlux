define(['app/container/container.module', 'Restangular'], function(container) {


  container.register.factory('ContainerRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("AD_SAL"));
    });
  });


  container.register.factory('ContainerSvc', function(ContainerRestangular) {
    var svc = {
      base: function() {
        return ContainerRestangular.one('controller/nb/v2').one('containermanager');
      },
      current: null,
      data: null
    };

    /*
    * Setup handling of the current container
    *
    * Setters / Getters
    *
    * If no containers it should return 'default'
    */
    svc.setCurrent = function (container) {
      svc.current = container;
    };

    svc.getCurrent = function () {
      return svc.current;
    };

    svc.getCurrentName = function () {
      var current = svc.getCurrent();
      return current ? current.container : 'default';
    };

    svc.containersUrl = function() {
      return svc.base().all('containers');
    };

    svc.containerUrl = function(container) {
      return svc.base().one('container', container);
    };

    svc.delete = function (containerName) {
      return svc.containerUrl(containerName).remove();
    };

    svc.getAll = function() {
      return svc.containersUrl().getList();
    };

    svc.itemData = function (i) {
      return {
        state: 'container.detail',
        params: {container: i.container},
        name: i.container
      };
    };

    svc.itemsData = function (data_) {
      return data_['container-config'].map(svc.itemData);
    };

    return svc;
  });
});
