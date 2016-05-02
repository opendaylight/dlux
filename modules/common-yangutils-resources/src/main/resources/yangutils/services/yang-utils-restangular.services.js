define([], function () {
    'use strict';

    function YangUtilsRestangularService(Restangular, ENV){

        // TODO: add service's description
        return Restangular.withConfig(function (RestangularConfig) {
            RestangularConfig.setBaseUrl(ENV.getBaseURL('MD_SAL'));
            RestangularConfig.setRequestInterceptor(function (elem, operation) {
                if (operation === 'post' && isEmptyElement(elem)) {
                    return null;
                } else {
                    return elem;
                }
            });
        });

        // TODO: add function's description
        function isEmptyElement(element) {
            return element.hasOwnProperty('id') && element.id === undefined;
        }
    }

    YangUtilsRestangularService.$inject = ['Restangular', 'ENV'];

    return YangUtilsRestangularService;

});
