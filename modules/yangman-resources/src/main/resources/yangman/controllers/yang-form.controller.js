define([
    'app/yangman/yangman.module',
    'app/yangman/controllers/form/augmentation-modal.controller',
    'app/yangman/controllers/form/case.controller',
    'app/yangman/controllers/form/container.controller',
    'app/yangman/controllers/form/choice.controller',
    'app/yangman/controllers/form/input.controller',
    'app/yangman/controllers/form/leaf.controller',
    'app/yangman/controllers/form/leaf-list.controller',
    'app/yangman/controllers/form/list.controller',
    'app/yangman/controllers/form/output.controller',
    'app/yangman/controllers/form/rpc.controller',
    'app/yangman/controllers/form/type.controller',
    'app/yangman/controllers/form/type-bit.controller',
    'app/yangman/controllers/form/type-empty.controller',
    'app/yangman/controllers/form/type-enum.controller',
    'app/yangman/directives/yang-form-menu.directive',
    'app/yangman/directives/ym-info-box.directive',
], function (yangman) {
    'use strict';

    yangman.register.controller('YangFormCtrl', YangFormCtrl);

    YangFormCtrl.$inject = ['$scope', '$rootScope', '$filter', 'constants'];

    function YangFormCtrl($scope, $rootScope, $filter, constants) {
        var yangForm = this;

        yangForm.viewPath = $scope.globalViewPath + 'rightpanel/form';
        $scope.constants = constants;

        // methods
        yangForm.getNodeName = getNodeName;

        /**
         * Get node label name
         * @param localeLabel
         * @param label
         * @returns {*}
         */
        function getNodeName(localeLabel, label) {
            var localeResult = $filter('translate')(localeLabel);
            return localeResult.indexOf(constants.LOCALE_PREFIX) === 0 ? label : localeResult;
        }


    }

});
