define([], function (){
    'use strict';


    /**
     * Base list object for extending history and collection object
     * @constructor
     * @param ParsingJsonService
     */
    function BaseListModel(ParsingJsonService) {

        var self = this;

        self.addFromJSON = addFromJSON;
        self.addRequestToList = addRequestToList;
        self.createEntry = createEntry;
        self.errorEditCbk = errorEditCbk;
        self.loadListFromStorage = loadListFromStorage;
        self.refresh = refresh;
        self.saveToStorage = saveToStorage;
        self.successfullEditCbk = successfullEditCbk;
        self.setName = setName;

        function setName(name) {
            self.name = name;
        }

        function createEntry(elem) {
            return elem;
        }

        function addRequestToList(){}

        function refresh(){}

        function successfullEditCbk(){}

        function errorEditCbk(){}

        /**
         * Loading from localStorage
         */
        function loadListFromStorage(){
            var storageList = localStorage.getItem(self.name);

            if (storageList){
                self.clear();
                ParsingJsonService.parseJson(storageList).map(function (elem) {
                    return self.createEntry(elem);
                }).forEach(function (elem) {
                    self.addRequestToList(elem);
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
                var req = self.createEntry(elem);
                self.addRequestToList(req);
            });
        }
    }

    return BaseListModel;
});
