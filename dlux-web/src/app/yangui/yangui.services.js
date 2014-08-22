define(['app/yangui/yangui.module'], function(yangui) {

  yangui.register.factory('YangConfigRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl('http://localhost:8080');
    });
  });

});