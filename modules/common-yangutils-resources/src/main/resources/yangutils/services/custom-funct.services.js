define([], function () {
    'use strict';

    function CustomFuncService(){

        var CustFunctionality = function (label, node, callback, viewStr, hideButtonOnSelect) {
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
        };

        var cmpApiToTemplatePath = function(subApi, templateStr) {
            var subApiStr = subApi.storage + '/' + subApi.pathTemplateString;
            return subApiStr === templateStr;
        };

        var custFunct = {};

        custFunct.createNewFunctionality = function (label, node, callback, viewStr, hideButtonOnSelect) {
            if (node && callback) {
                return new CustFunctionality(label, node, callback, viewStr, hideButtonOnSelect);
            } else {
                console.error('no node or callback is set for custom functionality');
            }
        };

        custFunct.getMPCustFunctionality = function(funcList) {
            var mpCF = funcList.filter(function(cf) {
                return cf.label === 'YANGUI_CUST_MOUNT_POINTS';
            });

            return mpCF[0];
        };

        custFunct.createCustomFunctionalityApis = function (apis, module, revision, pathString, label, callback, viewStr, hideButtonOnSelect) {
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
        };

        return custFunct;

    }

    CustomFuncService.$inject=[];

    return CustomFuncService;

});