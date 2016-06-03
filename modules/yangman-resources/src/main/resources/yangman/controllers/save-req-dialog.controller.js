define([
    'app/yangman/yangman.module',
], function () {
    'use strict';

    angular.module('app.yangman').controller('SaveReqDialogCtrl', SaveReqDialogCtrl);

    SaveReqDialogCtrl.$inject = ['$filter', '$mdDialog', 'collectionNames', 'requests', 'duplicate'];

    function SaveReqDialogCtrl($filter, $mdDialog, collectionNames, requests, duplicate) {
        var vm = this;

        vm.collectionNames = collectionNames;
        vm.collectionName = duplicate ? requests[0].collection : '';
        vm.getColAutocomplete   = getColAutocomplete;
        vm.requests = requests;
        vm.duplicate = duplicate;

        vm.cancel = cancel;
        vm.save = save;

        cloneRequests();

        function getColAutocomplete() {
            return vm.collectionNames ? $filter('filter')(vm.collectionNames, vm.collectionName) : vm.collectionNames;
        }

        function cloneRequests(){
            vm.requests = vm.requests.map(function (req){
                return req.clone();
            });
        }

        function cancel() {
            $mdDialog.cancel();
        }

        function save() {
            vm.requests.forEach(function (reqObj){
                reqObj.collection = vm.collectionName;
            });
            $mdDialog.hide(vm.requests);
        }

    }

    return SaveReqDialogCtrl;

});
