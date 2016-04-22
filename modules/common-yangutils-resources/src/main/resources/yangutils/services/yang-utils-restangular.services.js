define([], function () {
    'use strict';

    function YangUtilsRestangularService(Restangular, ENV){
        var isEmptyElement = function(element) {
            return element.hasOwnProperty('id') && element.id === undefined;
        };

        var r = Restangular.withConfig(function(RestangularConfig) {
            RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
            RestangularConfig.setRequestInterceptor(function(elem, operation) {
                if (operation === 'post' && isEmptyElement(elem)) {
                    return null;
                } else {
                    return elem;
                }
            });
        });

        return r;
    }

    YangUtilsRestangularService.$inject=['Restangular', 'ENV'];

    return YangUtilsRestangularService;

});