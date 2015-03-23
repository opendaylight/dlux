define(['common/navigation/navigation.module'], function(nav) {

  nav.register.factory('MDSalRestangular', function(Restangular, ENV) {
              return Restangular.withConfig(function(RestangularConfig) {
                  RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
              });
          });

});
