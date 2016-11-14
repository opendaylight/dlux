define(['app/yangman/models/baselist.model'], function (BaseListModel){
    'use strict';

    /**
     * Base parameters list object
     * @constructor
     * @param ParsingJsonService
     * @param ParametersService
     */
    function ParametersListModel($filter, ParsingJsonService, ParametersService){

        BaseListModel.call(this, $filter, ParsingJsonService);

        /* jshint validthis: true */
        var self = this;
        self.list = [];

        self.addItemToList = addItemToList;
        self.clear = clear;
        self.createItem = createItem;
        self.deleteParameterItem = deleteParameterItem;
        self.setName = setName;
        self.addEmptyItem = addEmptyItem;
        self.toJSON = toJSON;
        self.createParamsFromJson = createParamsFromJson;
        self.isNameUnique = isNameUnique;
        self.removeEmptyParams = removeEmptyParams;
        self.applyValsForFilters = applyValsForFilters;
        self.clone = clone;

        /**
         * Create copy of parameters list model
         */
        function clone() {
            var result = ParametersService.createEmptyParametersList(self.name);
            self.list.forEach(function (param) {
                result.addItemToList(param.clone());
            });
            return result;
        }

        /**
         * Apply all parameters names and values for filtering
         */
        function applyValsForFilters() {
            self.list.forEach(function (param) {
                param.applyValsForFilters();
            });
        }

        /**
         * Returns false if name is already used
         * @param nameValue
         * @returns {boolean}
         */
        function isNameUnique(nameValue) {
            return !nameValue || self.list.filter(function (item) {
                return item.name === nameValue;
            }).length === 1;
        }

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
                    self.addItemToList(elem);
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
            self.addItemToList(self.createItem());
        }

        function removeEmptyParams() {
            self.list = self.list.filter(function (param) {
                return param.name && param.name.length > 0;
            });
        }

        /**
         *
         * @param elem
         * @returns {Parameter|*}
         */
        function createItem(element) {
            if (!element){
                element = {
                    name: '',
                    value: '',
                };
            }
            return ParametersService.createParameter(element);
        }

        /**
         *
         * @param paramObj
         */
        function addItemToList(paramObj){
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
                return item.name;
            }
        };
    }

    ParametersListModel.prototype = Object.create(BaseListModel.prototype);

    return ParametersListModel;

});
