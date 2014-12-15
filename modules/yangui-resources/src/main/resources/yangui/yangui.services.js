define(['app/yangui/yangui.module'], function(yangui) {

  yangui.register.factory('YangConfigRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
    });
  });

});