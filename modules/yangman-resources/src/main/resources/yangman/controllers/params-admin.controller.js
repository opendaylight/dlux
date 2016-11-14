define([
    'app/yangman/services/handle-file.services',
], function () {
    'use strict';

    angular.module('app.yangman').controller('ParamsAdminCtrl', ParamsAdminCtrl);

    ParamsAdminCtrl.$inject = ['$mdMenu', '$mdDialog', '$scope', '$timeout', 'YangmanService', 'YMHandleFileService', 'parametersList'];

    function ParamsAdminCtrl($mdMenu, $mdDialog, $scope, $timeout, YangmanService, YMHandleFileService, parametersList) {
        var openMenuListener,
            vm = this;

        vm.parametersList = parametersList.clone();
        vm.search = '';
        vm.sortField1 = '_name';
        vm.sortField2 = '_value';
        vm.sortAsc = true;

        vm.close = close;
        vm.save = save;
        vm.createEmptyParam = createEmptyParam;
        vm.removeParam = removeParam;
        vm.clearFilter = clearFilter;
        vm.filterParam = filterParam;
        vm.sortBy = sortBy;
        vm.sortFunc = sortFunc;
        vm.exportParameters = exportParameters;
        vm.importParameters = importParameters;
        vm.validateNamesUnique = validateNamesUnique;
        vm.filterChange = filterChange;

        init();


        /**
         * Force validation after some filter is applied
         */
        function filterChange() {
            $timeout(vm.validateNamesUnique);
        }

        /**
         * Loop over all name inputs in form and validate duplicities
         */
        function validateNamesUnique() {
            var i = 0;
            while (vm.paramsForm.hasOwnProperty('name_' + i)){
                var modelValue = vm.paramsForm['name_' + i].$modelValue;
                vm.paramsForm['name_' + i].$setValidity(
                    'unique',
                    vm.parametersList.isNameUnique(modelValue)
                );
                i++;
            }
        }

        /**
         * Importing all parameters from json
         * @param fileContent
         */
        function importParameters(fileContent) {
            if (fileContent && YangmanService.validateFile(fileContent, ['name', 'value'])){
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

            YMHandleFileService.downloadFile(
                'yangman_parameters.json',
                vm.parametersList.toJSON(),
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
         * @param sortField1 , sortField2
         */
        function sortBy(sortField1, sortField2) {
            vm.sortField1 = sortField1;
            vm.sortField2 = sortField2;
            vm.sortAsc = !vm.sortAsc;
            vm.parametersList.applyValsForFilters();
            $timeout(vm.validateNamesUnique);
        }

        /**
         * Sort parameters with empty params at the end of list
         * @param item
         * @returns {*}
         */
        function sortFunc(item) {
            return [item[vm.sortField1] ? item[vm.sortField1] : (vm.sortAsc ? String.fromCharCode(255) : ''),
                    item[vm.sortField2] ? item[vm.sortField2] : (vm.sortAsc ? String.fromCharCode(255) : '')];
        }

        /**
         * Empty or matching params will be in list
         * @param paramObj
         * @returns {boolean}
         */
        function filterParam(paramObj) {
            return !(paramObj._name || paramObj._value) ||
                (paramObj._name && paramObj._name.indexOf(vm.search) !== -1) ||
                (paramObj._value && paramObj._value.indexOf(vm.search) !== -1);
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
            openMenuListener = $scope.$on('$mdMenuOpen', function () {
                closeOpenedMenu();
                $timeout(registerClickOutside);
            });
        }

        /**
         * Remove param from list
         * @param paramObj
         */
        function removeParam(paramObj) {
            vm.parametersList.deleteParameterItem(paramObj);
            $timeout(vm.validateNamesUnique);
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
        function close() {
            vm.parametersList.removeEmptyParams();
            $mdDialog.hide();
        }

        /**
         * Save list to storage and re-init dialog
         */
        function save() {
            vm.parametersList.saveToStorage();
            init();
        }

        function registerClickOutside() {
            $(document).click(function () {
                closeOpenedMenu();
            });
        }

        function unregisterClickOutside() {
            $(document).off('click');
        }

        function openMenuDestroyListener() {
            $scope.$on('$destroy', function () {
                openMenuListener();
            });
        }

        function closeOpenedMenu() {
            unregisterClickOutside();
            openMenuDestroyListener();
            $mdMenu.hide();
        }



    }

    return ParamsAdminCtrl;

});
