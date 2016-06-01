define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('RequestHeaderCtrl', RequestHeaderCtrl);

    RequestHeaderCtrl.$inject = ['$scope', '$rootScope'];

    function RequestHeaderCtrl($scope, $rootScope) {
        var requestHeader = this;

        requestHeader.allOperations = ['GET', 'POST', 'PUT', 'DELETE'];
        requestHeader.selectedOperationsList = [];
        requestHeader.selectedOperation = null;

        init();

        /**
         * Initialization
         */
        function init(){
            setAllowedMethods(requestHeader.allOperations);
            requestHeader.selectedShownDataType = $scope.rightPanelSection;
        }

        /**
         * Set allowed operations for request
         * @param operations
         */
        function setAllowedMethods(operations){
            requestHeader.selectedOperationsList = operations;
            requestHeader.selectedOperation = requestHeader.selectedOperationsList[0];
        }

        // watchers
        $scope.$on('SET_SEL_OPERATIONS', function (event, operations) {
            setAllowedMethods(operations);
        });

    }

});
