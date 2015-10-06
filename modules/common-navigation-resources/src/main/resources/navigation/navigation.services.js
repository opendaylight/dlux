define(['common/navigation/navigation.module'], function(nav) {

    nav.factory('MDSalRestangular', function(Restangular, ENV) {
        return Restangular.withConfig(function(RestangularConfig) {
            RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
        });
    });

});
