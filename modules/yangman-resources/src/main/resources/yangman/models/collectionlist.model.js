define(
    ['app/yangman/models/baselist.model', 'app/yangman/models/collection.model'],
    function (BaseListModel, CollectionModel){

        'use strict';

        /**
         * Base collection list object
         * @constructor
         * @param ParsingJsonService
         * @param RequestsService
         */
        function CollectionListModel($filter, ParsingJsonService, RequestsService){

            BaseListModel.call(this, $filter, ParsingJsonService);

            /* jshint validthis: true */
            var self = this;

            /**
             * Array of collections in which are requests from self.list groupped
             * @type {Array}
             */
            self.collections = [];

            self.addItemToList = addItemToList;
            self.clear = clear;
            self.collectionExists = collectionExists;
            self.createItem = createItem;
            self.deleteCollection = deleteCollection;
            self.deleteRequestItem = deleteRequestItem;
            self.duplicateCollection = duplicateCollection;
            self.getCollection = getCollection;
            self.getCollectionNames = getCollectionNames;
            self.loadListFromFile = loadListFromFile;
            self.renameCollection = renameCollection;
            self.toggleReqSelection = toggleReqSelection;
            self.toJSON = toJSON;
            self.getCollectionInJSON = getCollectionInJSON;
            self.getExpandedCollectionNames = getExpandedCollectionNames;
            self.expandCollectionByNames = expandCollectionByNames;
            self.getCollectionInRawJSON = getCollectionInRawJSON;

            /**
             *
             * @param collectionName
             */
            function getCollectionInJSON(collectionName){
                return JSON.stringify(self.toJSON(collectionName));
            }

            function getCollectionInRawJSON(collectionName){
                return self.toJSON(collectionName);
            }


            /**
             * @param collObj
             */
            function deleteCollection(collObj){

                var colIndex = self.collections.indexOf(collObj);
                // first check if collObj is the same as got by index to prevent delete wrong collection because of the
                // asynchron processes (when user is pressing enter many times, this method could be called more times
                // and in some other proceeding might be this collection already deleted)
                if (self.collections[colIndex] && self.collections[colIndex].name === collObj.name){
                    self.collections.splice(colIndex, 1);
                }
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
                if (onlyOneSelected){
                    self.selectedItems.forEach(function (req){
                        req.selected = false;
                    });
                    self.selectedItems = [];
                }

                if (reqObj.selected && !onlyOneSelected){
                    self.selectedItems.splice(self.selectedItems.indexOf(reqObj), 1);
                }

                reqObj.selected = (reqObj.selected && onlyOneSelected) || !reqObj.selected;
                if (reqObj.selected){
                    self.selectedItems.push(reqObj);
                }
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
            function createItem(elem) {
                return RequestsService.createHistoryRequestFromElement(elem);
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
            function addItemToList(reqObj){
                self.list.push(reqObj);
                if (reqObj.collection) {
                    var col = null;
                    if (self.collectionExists(reqObj.collection)) {
                        col = self.getCollection(reqObj.collection);
                    }
                    else {
                        col = new CollectionModel(reqObj.collection);
                        self.collections.push(col);
                    }
                    col.data.push(reqObj);
                }
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
                self.selectedItems = [];
                self.list = [];
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
                        return RequestsService.createHistoryRequest(elem.sentData, elem.receivedData, elem.path,
                            elem.method, elem.status, elem.name, elem.collection);
                    }).forEach(function (elem) {
                        self.addItemToList(elem);
                    });
                }
            }

            /**
             * Get expanded collection names
             */
            function getExpandedCollectionNames(){
                return self.collections.filter(function(collection){
                    return collection.expanded;
                }).map(function(collection){
                    return collection.name;
                });
            }

            /**
             * Expand collections by expandCollectionNames
             */
            function expandCollectionByNames(expandCollectionNames){
                self.collections.forEach(function(collection){
                    if (findName(collection.name)) {
                        collection.expanded = true;
                    }
                });

                function findName(name) {
                    return expandCollectionNames.some(function(collectionName){
                        return name === collectionName;
                    });
                }
            }

        }
        CollectionListModel.prototype = Object.create(BaseListModel.prototype);

        return CollectionListModel;
    }
);
