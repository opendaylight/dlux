define(['app/yangman/models/baselist.model'], function (BaseListModel){
    'use strict';

    /**
     * Base parameters list object
     * @constructor
     * @param ParsingJsonService
     * @param ParametersService
     */
    function ParametersListModel(ParsingJsonService, ParametersService){

        BaseListModel.call(this, ParsingJsonService);

        /* jshint validthis: true */
        var self = this;
        self.list = [];

        self.addRequestToList = addRequestToList;
        self.clear = clear;
        self.createEntry = createEntry;
        self.deleteParameterItem = deleteParameterItem;
        self.setName = setName;
        self.addEmptyItem = addEmptyItem;
        self.getKeysInArr = getKeysInArr;
        self.toJSON = toJSON;
        self.createParamsFromJson = createParamsFromJson;


        /**
         * Using when importing data from json file
         * @param data
         */
        function createParamsFromJson(data){
            if (data){
                self.clear();
                ParsingJsonService.parseJson(data).map(function (elem) {
                    return ParametersService.createParameter(elem);
                }).forEach(function (elem) {
                    self.addRequestToList(elem);
                });
            }
        }

        /**
         * Get all parameters in json for exporting
         * @returns {Array}
         */
        function toJSON() {
            return self.list.map(function (param){
                return param.toJSON();
            });
        }

        /**
         * Get list of params keys in array
         * @returns {Array}
         * @param {Parameter} exceptingParamObj key of this object will be excluded from result
         */
        function getKeysInArr(exceptingParamObj) {
            return self.list
                .filter(function (param){
                    return param !== exceptingParamObj;
                })
                .map(function (param){
                    return param.key;
                }
            );
        }

        /**
         * Set list name
         * @param name
         */
        function setName(name) {
            self.name = name;
        }

        /**
         * Add empty param to list
         */
        function addEmptyItem() {
            self.addRequestToList(self.createEntry());
        }

        /**
         *
         * @param elem
         * @returns {Parameter|*}
         */
        function createEntry(element) {
            if (!element){
                element = {
                    key: '',
                    value: '',
                };
            }
            return ParametersService.createParameter(element);
        }

        /**
         *
         * @param paramObj
         */
        function addRequestToList(paramObj){
            self.list.push(paramObj);
        }

        /**
         *
         * @param paramObj
         */
        function deleteParameterItem(paramObj){
            self.list.splice(self.list.indexOf(paramObj), 1);
        }

        function clear() {
            self.list = [];
        }

        /**
         *
         * @returns {Array}
         */
        self.toJSON = function () {
            return self.list.filter(notEmptyParam).map(function (elem) {
                return elem.toJSON();
            });

            function notEmptyParam(item){
                return item.key;
            }
        };
    }

    ParametersListModel.prototype = Object.create(BaseListModel.prototype);

    return ParametersListModel;

});
