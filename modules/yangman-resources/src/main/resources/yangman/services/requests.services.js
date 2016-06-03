define(['app/yangman/yangman.module'], function (yangui) {
    'use strict';

    yangui.register.service('RequestsService', RequestsService);

    RequestsService.$inject = ['PathUtilsService', 'ParsingJsonService', 'YangUtilsService'];

    function RequestsService(PathUtilsService, ParsingJsonService, YangUtilsService){

        var service = {};

        service.createEmptyCollectionList = createEmptyCollectionList;
        service.createEmptyHistoryList = createEmptyHistoryList;
        service.createHistoryRequestFromElement = createHistoryRequestFromElement;
        service.createHistoryRequest = createHistoryRequest;
        service.validateFile = validateFile;

        /**
         * Validating collection import file
         * @param data
         * @param checkArray
         * @returns {*}
         */
        function validateFile(data, checkArray){
            try {
                var obj = ParsingJsonService.parseJson(data);

                return obj && obj.every(function (el){
                    return checkArray.every(function (arr){
                        return el.hasOwnProperty(arr);
                    });
                });
            } catch (e) {
                return e;
            }
        }

        /**
         * Service for creating basic history object
         * @param sentData
         * @param receivedData
         * @param path
         * @param parametrizedPath
         * @param operation
         * @param status
         * @param name
         * @param collection
         * @param getApiFunction
         * @returns {HistoryRequest}
         */
        function createHistoryRequest(sentData, receivedData, path, parametrizedPath, operation, status, name,
                                      collection, timestamp, getApiFunction){
            var api = getApiFunction ? getApiFunction(path) : nullFunction(),
                receivedDataProcessed = status === 'success' ? receivedData : null;

            return new HistoryRequest(sentData, receivedDataProcessed, status, path, parametrizedPath, operation, api,
                name, collection, timestamp);
        }


        /**
         * Creating {HistoryRequest} from elem containing all necessary data
         * @param {Object} elem
         * @param {function} getApiFunction
         * @returns {HistoryRequest}
         */
        function createHistoryRequestFromElement(elem, getApiFunction) {
            return service.createHistoryRequest(elem.sentData, elem.receivedData,
                elem.path, elem.parametrizedPath,
                elem.method, elem.status, elem.name,
                elem.collection, elem.timestamp, getApiFunction);
        }

        /**
         * Service for creating empty collection list
         * @param name
         * @param getApiFunction
         * @returns {CollectionList}
         */
        function createEmptyCollectionList(name, getApiFunction){
            return new CollectionList(name, getApiFunction);
        }


        /**
         * Service for creating empty history list
         * @param name
         * @param getApiFunction
         * @returns {HistoryList}
         */
        function createEmptyHistoryList(name, getApiFunction){
            return new HistoryList(name, getApiFunction);
        }

        /**
         * Base list object for extending history and collection object
         * @param name
         * @constructor
         */
        function BaseList(name) {
            var self = this;
            self.name = name;


            self.addFromJSON = addFromJSON;
            self.addRequestToList = addRequestToList;
            self.createEntry = createEntry;
            self.errorEditCbk = errorEditCbk;
            self.loadListFromStorage = loadListFromStorage;
            self.refresh = refresh;
            self.saveToStorage = saveToStorage;
            self.successfullEditCbk = successfullEditCbk;

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


        /**
         * Base history list object
         * @param name
         * @param getApiFunction
         * @constructor
         */
        function HistoryList(name, getApiFunction){
            BaseList.call(this, name);
            /* jshint validthis: true */
            var self = this;
            self.list = [];
            self.listGroupedByDate = {};
            self.selectedRequests = [];

            self.addRequestToList = addRequestToList;
            self.clear = clear;
            self.createEntry = createEntry;
            self.deleteRequestItem = deleteRequestItem;
            self.getApiFunction = getApiFunction;
            self.groupListByDate = groupListByDate;
            self.refresh = refresh;
            self.toggleReqSelection = toggleReqSelection;


            /**
             * Mark reqObj as selected
             * @param {boolean} onlyOneSelected boolean if only this object should be marked as selected
             * @param reqObj HistoryRequest object to be selected
             */
            function toggleReqSelection(onlyOneSelected, reqObj){
                if (onlyOneSelected){
                    self.selectedRequests.forEach(function (req){
                        req.selected = false;
                    });
                    self.selectedRequests = [];
                }

                if (reqObj.selected && !onlyOneSelected){
                    self.selectedRequests.splice(self.selectedRequests.indexOf(reqObj), 1);
                }

                reqObj.selected = (reqObj.selected && onlyOneSelected) || !reqObj.selected;
                if (reqObj.selected){
                    self.selectedRequests.push(reqObj);
                }

            }

            /**
             * Grouping by date to show date groups in yangman
             */
            function groupListByDate(){
                self.list.forEach(addToListDateGroup);

                function addToListDateGroup(elem){
                    var groupName = new Date(elem.timestamp).toDateString();
                    if (!self.listGroupedByDate.hasOwnProperty(groupName)){
                        self.listGroupedByDate[groupName] = [];
                    }
                    self.listGroupedByDate[groupName].push(elem);
                }
            }

            /**
             *
             * @param elem
             * @returns {HistoryRequest|*}
             */
            function createEntry(elem) {
                return service.createHistoryRequestFromElement(elem, self.getApiFunction);
            }

            /**
             *
             * @param reqObj
             */
            function addRequestToList(reqObj){
                self.list.push(reqObj);
            }

            /**
             * Refresh each element using self.detApiFunction
             */
            function refresh() {
                self.list.forEach(function (elem) {
                    elem.refresh(self.getApiFunction);
                });
            }

            /**
             *
             * @param elem
             */
            function deleteRequestItem(elem){
                self.list.splice(self.list.indexOf(elem), 1);
            }

            function clear() {
                self.list = [];
                self.listGroupedByDate = {};
                self.selectedRequests = [];
            }

            /**
             *
             * @returns {Array}
             */
            self.toJSON = function () {
                return self.list.map(function (elem) {
                    return elem.toJSON();
                });
            };
        }

        HistoryList.prototype = Object.create(BaseList.prototype);


        /**
         * Base collection list object
         * @param name
         * @param getApiFunction
         * @constructor
         */
        function CollectionList(name, getApiFunction){
            var self = this;
            BaseList.call(self, name);
            self.collections = [];
            self.getApiFunction = getApiFunction;
            self.selectedRequests = [];

            self.addRequestToList = addRequestToList;
            self.clear = clear;
            self.collectionExists = collectionExists;
            self.createEntry = createEntry;
            self.deleteCollection = deleteCollection;
            self.deleteRequestItem = deleteRequestItem;
            self.duplicateCollection = duplicateCollection;
            self.getCollection = getCollection;
            self.getCollectionNames = getCollectionNames;
            self.loadListFromFile = loadListFromFile;
            self.refresh = refresh;
            self.renameCollection = renameCollection;
            self.toggleReqSelection = toggleReqSelection;
            self.toJSON = toJSON;
            self.getCollectionInJSON = getCollectionInJSON;

            function getCollectionInJSON(collectionName){
                return JSON.stringify(self.toJSON(collectionName));
            }


            /**
             *
             * @param collObj
             */
            function deleteCollection(collObj){
                self.collections.splice(self.collections.indexOf(collObj), 1);
            }

            /**
             *
             * @param srcColName
             * @param destColName
             */
            function duplicateCollection(srcColName, destColName){
                var newCol = self.getCollection(srcColName).clone(destColName);
                self.collections.push(newCol);
            }

            /**
             *
             * @param collObj
             * @param name
             */
            function setCollObjNewName(collObj, newName){
                collObj.name = newName;
                collObj.data.forEach(function (item){
                    item.collection = newName;
                });
            }

            /**
             * Mark reqObj as selected
             * @param reqObj HistoryRequest object to be selected
             */
            function toggleReqSelection(onlyOneSelected, reqObj){

                self.collections.forEach(function (collection){
                    collection.data.forEach(function (req){
                        req.selected = reqObj === req;
                    });
                });

            }

            /**
             *
             * @param oldName
             * @param newName
             */
            function renameCollection(oldName, newName){
                var col = self.getCollection(oldName);
                setCollObjNewName(col, newName);
            }

            /**
             *
             * @param elem
             * @returns {HistoryRequest|*}
             */
            function createEntry(elem) {
                return service.createHistoryRequestFromElement(elem, self.getApiFunction);
            }

            /**
             *
             * @param {string} colName
             * @returns {boolean}
             */
            function collectionExists(colName) {
                return self.collections.some(function (col){
                    return col.name === colName;
                });
            }

            /**
             *
             * @returns {Array}
             */
            function getCollectionNames(){
                return self.collections.map(function (elem){
                    return elem.name;
                });
            }

            /**
             *
             * @param colName
             * @returns {T}
             */
            function getCollection(colName){
                return self.collections.filter(function (col){
                    return col.name === colName;
                })[0];
            }


            /**
             *
             * @param reqObj
             */
            function addRequestToList(reqObj){
                if (reqObj.collection) {
                    var col = null;
                    if (self.collectionExists(reqObj.collection)) {
                        col = self.getCollection(reqObj.collection);
                    }
                    else {
                        col = new Collection(reqObj.collection);
                        self.collections.push(col);
                    }
                    col.data.push(reqObj);
                }
            }

            /**
             * Refresh each requst in collections using his getApiFunction
             */
            function refresh() {
                self.collections.forEach(function (collection) {
                    collection.data.forEach(function (elem) {
                        elem.refresh(self.getApiFunction);
                    });
                });
            }

            /**
             *
             * @param elem
             */
            function deleteRequestItem(elem){
                var col = self.getCollection(elem.collection);
                col.data.splice(col.data.indexOf(elem), 1);
                if (col.data.length === 0){
                    self.collections.splice(self.collections.indexOf(col), 1);
                }

            }

            function clear() {
                self.collections = [];
            }

            /**
             *
             * @param collectionName
             * @returns {*}
             */
            function toJSON(collectionName) {
                if (collectionName){
                    return self.getCollection(collectionName).data.map(function (elem){
                        return elem.toJSON();
                    });
                }
                else {
                    var list = [];
                    self.collections.forEach(function (collection){
                        collection.data.forEach(function (elem){
                            list.push(elem.toJSON());
                        });
                    });
                    return list;
                }
            }

            /**
             *
             * @param data
             */
            function loadListFromFile(data){
                if (data){
                    ParsingJsonService.parseJson(data).map(function (elem) {
                        return service.createHistoryRequest(elem.sentData, elem.receivedData, elem.path,
                            elem.parametrizedPath, elem.method, elem.status, elem.name, elem.collection,
                            self.getApiFunction);
                    }).forEach(function (elem) {
                        self.addRequestToList(elem);
                    });
                }
            }
        }
        CollectionList.prototype = Object.create(BaseList.prototype);

        function Collection(name){
            var self = this;
            self.name = name;
            self.expanded = false;
            self.data = [];

            self.clone = clone;
            self.toggleExpanded = toggleExpanded;

            function clone(newName){
                var result = new Collection(newName);
                self.data.forEach(function (item){
                    var newItem = item.clone();
                    newItem.collection = newName;
                    result.data.push(newItem);
                });
                return result;
            }

            function toggleExpanded(){
                self.expanded = !self.expanded;
            }
        }

        /**
         * Base history request object
         * @param sentData
         * @param receivedData
         * @param status
         * @param path
         * @param parametrizedPath
         * @param operation
         * @param api
         * @param name
         * @param collection
         * @constructor
         */
        function HistoryRequest(sentData, receivedData, status, path, parametrizedPath, operation, api, name,
                                collection, timestamp){
            var self = this;
            self.sentData = sentData === null || sentData === undefined || $.isEmptyObject(sentData) ? null : sentData;
            self.name = name;
            self.path = path;
            self.parametrizedPath = parametrizedPath;
            self.method = operation;
            self.status = status;
            self.receivedData = receivedData === null || receivedData === undefined || $.isEmptyObject(receivedData) ?
                null :
                receivedData;
            self.show = false;
            self.api = api;
            self.availability = (api !== null);
            self.collection = collection;
            self.timestamp = timestamp;
            self.selected = false;

            self.getIdentifiers = getIdentifiers;
            self.refresh = refresh;
            self.clone = clone;
            self.toJSON = toJSON;
            self.clonePathArray = clonePathArray;
            self.setParametrizedPath = setParametrizedPath;
            self.getLastPathDataElemName = getLastPathDataElemName;
            self.setDataForView = setDataForView;
            self.clearParametrizedData = clearParametrizedData;
            self.copyWithParametrizationAsNatural = copyWithParametrizationAsNatural;

            /**
             *
             * @returns {Array}
             */
            function getIdentifiers() {
                var identifiers = [];

                api.pathArray.forEach(function (elem) {
                    elem.identifiers.forEach(function (i) {
                        identifiers.push(i);
                    });
                });

                return identifiers;
            }

            /**
             * Refresh each element using getApiFunction
             * @param getApiFunction
             */
            function refresh(getApiFunction) {
                var refreshedApi = getApiFunction(self.path);

                self.api = refreshedApi;
                self.availability = (refreshedApi !== null);
            }

            /**
             *
             * @returns {{
             *  sentData: *,
             *  receivedData: *,
             *  path: *,
             *  collection: *,
             *  parametrizedPath: *,
             *  method: *,
             *  status: *,
             *  name: *,
             *  timestamp: *
             * }}
             */
            function toJSON() {
                var obj = {
                    sentData: self.sentData,
                    receivedData: self.receivedData,
                    path: self.path,
                    collection: self.collection,
                    parametrizedPath: self.parametrizedPath,
                    method: self.method,
                    status: self.status,
                    name: self.name,
                    timestamp: self.timestamp,
                };

                return obj;
            }

            /**
             *
             */
            function clonePathArray() {
                if ( self.api && self.api.pathArray ) {
                    self.api.clonedPathArray = self.api.pathArray.map(function (pe) {
                        return pe.clone();
                    });
                } else {
                    self.api.clonedPathArray = [];
                }
            }

            function setParametrizedPath(){
                self.clonePathArray();
                PathUtilsService.fillPath(self.api.clonedPathArray, self.parametrizedPath);
            }

            /**
             *
             * @returns {*}
             */
            function getLastPathDataElemName() {
                var pathArray = self.path.split(':');
                return pathArray[pathArray.length - 1];
            }

            /**
             *
             * @param sent
             * @param data
             * @returns {string}
             */
            function setDataForView(sent, data){
                var newData = {},
                    parsedData = '';

                angular.copy(data, newData);
                parsedData = JSON.stringify(
                    YangUtilsService.stripAngularGarbage(newData, self.getLastPathDataElemName()), null, 4);

                if ( sent && self.api ) {
                    if ( self.parametrizedPath ) {
                        self.setParametrizedPath();
                    } else {
                        self.clonePathArray();
                    }
                }

                return parsedData;
            }

            function clearParametrizedData() {
                self.parametrizedPath = null;
                self.clonePathArray();
            }


            /**
             *
             * @returns {HistoryRequest}
             */
            function clone() {
                return new HistoryRequest(self.sentData, self.receivedData, self.status, self.path,
                    self.parametrizedPath, self.method, self.api, self.name, self.collection);
            }


            /**
             *
             * @param parametrizedPath
             * @param getApiFunction
             * @param dataForView
             * @param JSONparsingErrorClbk
             * @returns {*}
             */
            function copyWithParametrizationAsNatural(parametrizedPath, getApiFunction, dataForView,
                                                              JSONparsingErrorClbk){

                var parsedJsonObj = null,
                    result = null;

                parsedJsonObj = ParsingJsonService.parseJson(dataForView, JSONparsingErrorClbk);

                if (parsedJsonObj){
                    result = new HistoryRequest(parsedJsonObj, self.receivedData, self.status,
                        parametrizedPath, '', self.method, self.api, self.name, self.collection);
                    result.api = getApiFunction ? getApiFunction(result.path) : nullFunction();
                }

                return result;
            }

        }

        /**
         * Helper
         * @returns {null}
         */
        function nullFunction() {
            return null;
        }


        return service;

    }

});
