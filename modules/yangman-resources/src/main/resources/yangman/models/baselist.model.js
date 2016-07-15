define([], function (){
    'use strict';


    /**
     * Base list object for extending history and collection object
     * @constructor
     * @param ParsingJsonService
     */
    function BaseListModel($filter, ParsingJsonService) {

        var self = this;

        /**
         * General list of all objects to simply treat them
         * @type {Array}
         */
        self.list = [];
        /**
         * Simple list of selected items from self.list
         * @type {Array}
         */
        self.selectedItems = [];

        self.addFromJSON = addFromJSON;
        self.addItemToList = addItemToList;
        self.createItem = createItem;
        self.loadListFromStorage = loadListFromStorage;
        self.saveToStorage = saveToStorage;
        self.setName = setName;
        self.selectAllFilteredItems = selectAllFilteredItems;
        self.deselectAllFilteredItems = deselectAllFilteredItems;
        self.getSelectedItems = getSelectedItems;
        self.deselectAllItems = deselectAllItems;

        function deselectAllItems() {
            self.list.forEach(function (item) {
                item.selected = false;
            });
            self.selectedItems = [];
        }

        /**
         * @returns {Array}
         */
        function getSelectedItems(filterFunc) {
            if (filterFunc) {
                return $filter('filter')(self.selectedItems, filterFunc);
            }
            else {
                return self.selectedItems;
            }
        }

        /**
         * Mark all items matching filter as selected
         * Toggle only items matching filter, other items let be as they are
         * @param filterFunc function returning boolean
         */
        function selectAllFilteredItems(filterFunc) {
            $filter('filter')(self.list, filterFunc).forEach(function (item) {
                item.selected = true;
                if (self.selectedItems.indexOf(item) === -1){
                    self.selectedItems.push(item);
                }
            });
        }

        /**
         * Mark all requests matching filter as deselected
         * Toggle only requests matching filter, other requests let be as they are
         * @param filterFunc
         */
        function deselectAllFilteredItems(filterFunc) {
            $filter('filter')(self.list, filterFunc).forEach(function (item) {
                item.selected = false;
                self.selectedItems.splice(self.selectedItems.indexOf(item), 1);
            });
        }

        function setName(name) {
            self.name = name;
        }

        function createItem(elem) {
            return elem;
        }

        function addItemToList(){}

        /**
         * Loading from localStorage
         */
        function loadListFromStorage(){
            var storageList = localStorage.getItem(self.name);

            if (storageList){
                self.clear();
                ParsingJsonService.parseJson(storageList).map(function (elem) {
                    return self.createItem(elem);
                }).forEach(function (elem) {
                    self.addItemToList(elem);
                });
            }
        }

        /**
         * Saving to local storage
         */
        function saveToStorage(){
            try {
                localStorage.setItem(self.name, JSON.stringify(self.toJSON()));
            } catch (e) {
                // console.info('DataStorage error:', e);
            }
        }

        /**
         * Add each request from json
         * @param json
         */
        function addFromJSON(json) {
            json.forEach(function (elem) {
                var item = self.createItem(elem);
                self.addItemToList(item);
            });
        }
    }

    return BaseListModel;
});
