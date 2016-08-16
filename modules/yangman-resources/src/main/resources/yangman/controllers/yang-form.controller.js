define([
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
    'app/yangman/controllers/form/type-boolean.controller',
    'app/yangman/controllers/form/type-empty.controller',
    'app/yangman/controllers/form/type-enum.controller',
    'app/yangman/directives/yang-form-menu.directive',
    'app/yangman/directives/ym-info-box.directive',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangFormCtrl', YangFormCtrl);

    YangFormCtrl.$inject = ['$scope', '$rootScope', '$filter', 'constants', 'YangUtilsService'];

    function YangFormCtrl($scope, $rootScope, $filter, constants) {
        var yangForm = this;

        yangForm.viewPath = $scope.globalViewPath + 'rightpanel/form';
        yangForm.errorMsg = '';
        $scope.constants = constants;

        // methods
        yangForm.getNodeName = getNodeName;

        // watchers
        $scope.$on(constants.YANGMAN_SET_ERROR_DATA, setRcvdErrorData);

        $scope.$on(constants.YANGMAN_SET_ERROR_MESSAGE, setErrorMessage);

        /**
         * Method for set error message in form
         * @param event
         * @param message
         */
        function setErrorMessage(event, data){
            yangForm.errorMsg = data.params;
        }

        /**
         * Read and set error message received from header controller
         * @param event
         * @param data
         */
        function setRcvdErrorData(event, data) {

            if (data.params.errors) {
                yangForm.errorMsg = data.params.errors.error[0]['error-message'];
            }
            else {
                yangForm.errorMsg = '';
            }
        }

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
