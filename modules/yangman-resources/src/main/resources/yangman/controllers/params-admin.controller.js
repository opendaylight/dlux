define([
    'app/yangman/directives/validation/unique.directive',
], function () {
    'use strict';

    angular.module('app.yangman').controller('ParamsAdminCtrl', ParamsAdminCtrl);

    ParamsAdminCtrl.$inject = ['$mdDialog', 'parametersList'];

    function ParamsAdminCtrl($mdDialog, parametersList) {
        var vm = this;

        vm.parametersList = parametersList;
        vm.search = '';
        vm.sortField = '_key';
        vm.sortAsc = true;

        vm.cancel = cancel;
        vm.save = save;
        vm.createEmptyParam = createEmptyParam;
        vm.removeParam = removeParam;
        vm.clearFilter = clearFilter;
        vm.filterParam = filterParam;
        vm.sortBy = sortBy;
        vm.sortFunc = sortFunc;


        init();

        /**
         * Set attribute to use when sorting
         * @param sortField
         */
        function sortBy(sortField) {
            vm.sortField = sortField;
            vm.sortAsc = !vm.sortAsc;
        }

        /**
         * Sort parameters with empty params at the end of list
         * @param item
         * @returns {*}
         */
        function sortFunc(item) {
            return item[vm.sortField] ? item[vm.sortField] : vm.sortAsc ? 'zzzzzzzzzzzzzzzz' : '';
        }

        /**
         * Empty or matching params will be in list
         * @param paramObj
         * @returns {boolean}
         */
        function filterParam(paramObj) {
            return !(paramObj._key || paramObj._value) ||
                    paramObj._key.indexOf(vm.search) !== -1 ||
                    paramObj._value.indexOf(vm.search) !== -1;
        }


        function clearFilter() {
            vm.search = '';
        }

        /**
         * Load params list and add one empty to the end of list
         */
        function init(){
            vm.parametersList.loadListFromStorage();
            createEmptyParam();
        }

        /**
         * Remove param from list
         * @param paramObj
         */
        function removeParam(paramObj) {
            vm.parametersList.deleteParameterItem(paramObj);
        }

        /**
         * Create new empty param
         */
        function createEmptyParam() {
            vm.parametersList.addEmptyItem();
        }

        /**
         * Cancel dialog
         */
        function cancel() {
            $mdDialog.cancel();
        }

        /**
         * Save list to storage and re-init dialog
         */
        function save() {
            vm.parametersList.saveToStorage();
            init();
        }


    }

    return ParamsAdminCtrl;

});

