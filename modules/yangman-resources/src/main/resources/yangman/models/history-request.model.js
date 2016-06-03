define([], function (){
    'use strict';

    /**
     * Base history request object
     * @constructor
     * @param PathUtilsService
     * @param YangUtilsService
     * @param ParsingJsonService
     */
    function HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService){
        var self = this;

        // properties
        self.name = '';
        self.sentData = null;
        self.path = '';
        self.parametrizedPath = null;
        self.method = '';
        self.status = '';
        self.receivedData = null;
        self.api = null;
        self.availability = false;
        self.collection = '';
        self.timestamp = '';
        self.selected = false;

        // functions
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
        self.setData = setData;

        /**
         * Grouped setter
         *
         * @param sentData
         * @param receivedData
         * @param status
         * @param path
         * @param parametrizedPath
         * @param operation
         * @param api
         * @param name
         * @param collection
         * @param timestamp
         */
        function setData(sentData, receivedData, status, path, parametrizedPath, operation, api, name, collection,
                         timestamp) {

            self.sentData = sentData === null || sentData === undefined || $.isEmptyObject(sentData) ? null : sentData;
            self.name = name;
            self.path = path;
            self.parametrizedPath = parametrizedPath;
            self.method = operation;
            self.status = status;
            self.receivedData = receivedData === null || receivedData === undefined || $.isEmptyObject(receivedData) ?
                null :
                receivedData;
            self.api = api;
            self.availability = (api !== null);
            self.collection = collection;
            self.timestamp = timestamp;
        }

        /**
         *
         * @returns {Array}
         */
        function getIdentifiers() {
            var identifiers = [];

            self.api.pathArray.forEach(function (elem) {
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
            var result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);
            result.setData(self.sentData, self.receivedData, self.status, self.path,
                self.parametrizedPath, self.method, self.api, self.name, self.collection, self.timestamp);
            return result;
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
                result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);
                result.setData(parsedJsonObj, self.receivedData, self.status, parametrizedPath, '', self.method,
                    (getApiFunction || angular.noop)(result.path), self.name, self.collection, self.timestamp);
            }

            return result;
        }

    }

    return HistoryRequestModel;
});
