define([], function () {
    'use strict';

    function CustomFuncService(){

        var service = {
            createCustomFunctionalityApis: createCustomFunctionalityApis,
            createNewFunctionality: createNewFunctionality,
            getMPCustFunctionality: getMPCustFunctionality,
        };

        return service;

        /**
         * Base custom functionality object
         * @param label
         * @param node
         * @param callback
         * @param viewStr
         * @param hideButtonOnSelect
         * @constructor
         */
        function CustFunctionality(label, node, callback, viewStr, hideButtonOnSelect) {
            this.label = label;
            this.callback = callback;
            this.viewStr = viewStr;
            this.hideButtonOnSelect = hideButtonOnSelect;

            this.setCallback = function (callback) {
                this.callback = callback;
            };

            this.runCallback = function (args) {
                if (this.callback) {
                    this.callback(args);
                } else {
                    console.warn('no callback set for custom functionality', this.label);
                }
            };
        }

        // TODO: add function's description
        function cmpApiToTemplatePath(subApi, templateStr) {
            var subApiStr = subApi.storage + '/' + subApi.pathTemplateString;
            return subApiStr === templateStr;
        }

        // TODO: add service's description
        function createNewFunctionality(label, node, callback, viewStr, hideButtonOnSelect) {
            if (node && callback) {
                return new CustFunctionality(label, node, callback, viewStr, hideButtonOnSelect);
            } else {
                console.error('no node or callback is set for custom functionality');
            }
        }

        // TODO: add service's description
        function getMPCustFunctionality(funcList) {
            var mpCF = funcList.filter(function (cf) {
                return cf.label === 'YANGUI_CUST_MOUNT_POINTS';
            });

            return mpCF[0];
        }

        // TODO: add service's description
        function createCustomFunctionalityApis(apis, module, revision, pathString, label,
                                               callback, viewStr, hideButtonOnSelect) {
            apis = apis.map(function (item) {
                if ((module ? item.module === module : true) && (revision ? item.revision === revision : true)) {

                    item.subApis = item.subApis.map(function (subApi) {

                        if (cmpApiToTemplatePath(subApi, pathString)) {
                            subApi.addCustomFunctionality(label, callback, viewStr, hideButtonOnSelect);
                        }

                        return subApi;
                    });
                }

                return item;
            });
        }
    }

    CustomFuncService.$inject = [];

    return CustomFuncService;

});
