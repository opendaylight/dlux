define([
], function () {
    'use strict';

    angular.module('app.yangman').controller('ParamsAdminCtrl', ParamsAdminCtrl);

    ParamsAdminCtrl.$inject = ['$mdDialog', 'YangmanService', 'HandleFileService', 'parametersList'];

    function ParamsAdminCtrl($mdDialog, YangmanService, HandleFileService, parametersList) {
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
        vm.exportParameters = exportParameters;
        vm.importParameters = importParameters;
        vm.validateKeysUnique = validateKeysUnique;

        init();

        /**
         * Loop over all key inputs in form and validate duplicities
         */
        function validateKeysUnique() {
            var i = 0;
            while (vm.paramsForm.hasOwnProperty('key_' + i)){
                var modelValue = vm.paramsForm['key_' + i].$modelValue;
                vm.paramsForm['key_' + i].$setValidity(
                    'unique',
                    vm.parametersList.isKeyUnique(modelValue)
                );
                i++;
            }
        }

        /**
         * Importing all parameters from json
         * @param fileContent
         */
        function importParameters(fileContent) {
            if (fileContent && YangmanService.validateFile(fileContent, ['key', 'value'])){
                try {
                    vm.parametersList.createParamsFromJson(fileContent);
                    vm.parametersList.saveToStorage();
                    angular.element(document).find('#importParameters').val('');
                    createEmptyParam();
                }
                catch (e) {
                    angular.element(document).find('#importParameters').val('');
                    console.error('DataStorage error:', e);
                }
            }
            else {
                angular.element(document).find('#importParameters').val('');
            }

        }

        /**
         * Export all parameters to json file
         */
        function exportParameters() {

            HandleFileService.downloadFile(
                'yangman_parameters.json',
                JSON.stringify(vm.parametersList.toJSON()),
                'json',
                'charset=utf-8',
                function (){},
                function (e){
                    console.error('Export parameters error:', e);
                }
            );
        }

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

