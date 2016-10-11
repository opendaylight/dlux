define([
    'app/yangman/controllers/form/ym-augmentation-modal.controller',
    'app/yangman/controllers/form/ym-case.controller',
    'app/yangman/controllers/form/ym-container.controller',
    'app/yangman/controllers/form/ym-choice.controller',
    'app/yangman/controllers/form/ym-input.controller',
    'app/yangman/controllers/form/ym-leaf.controller',
    'app/yangman/controllers/form/ym-leaf-list.controller',
    'app/yangman/controllers/form/ym-list.controller',
    'app/yangman/controllers/form/ym-output.controller',
    'app/yangman/controllers/form/ym-rpc.controller',
    'app/yangman/controllers/form/ym-type.controller',
    'app/yangman/controllers/form/ym-type-bit.controller',
    'app/yangman/controllers/form/ym-type-boolean.controller',
    'app/yangman/controllers/form/ym-type-empty.controller',
    'app/yangman/controllers/form/ym-type-enum.controller',
    'app/yangman/directives/yang-form-menu.directive',
    'app/yangman/directives/ym-info-box.directive',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangFormCtrl', YangFormCtrl);

    YangFormCtrl.$inject = ['$scope', '$rootScope', '$filter', 'constants', 'YangUtilsService'];

    function YangFormCtrl($scope, $rootScope, $filter, constants, YangUtilsService) {
        var yangForm = this;

        yangForm.viewPath = $scope.globalViewPath + 'rightpanel/form';
        yangForm.errorMsg = '';
        yangForm.inputIndex = 0;
        $scope.constants = constants;


        yangForm.getNodeName = getNodeName;

        init();




        function init() {
            $scope.$on(constants.YANGMAN_SET_ERROR_DATA, setRcvdErrorData);
            $scope.$on(constants.YANGMAN_SET_ERROR_MESSAGE, setErrorMessage);
        }



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
