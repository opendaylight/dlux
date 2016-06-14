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
        self.collection = '';
        self.method = '';
        self.name = '';
        self.path = '';
        self.receivedData = null;
        self.selected = false;
        self.sentData = null;
        self.status = '';
        self.timestamp = '';

        // functions
        self.clone = clone;
        self.toJSON = toJSON;
        self.getLastPathDataElemName = getLastPathDataElemName;
        self.setDataForView = setDataForView;
        self.setData = setData;
        self.setExecutionData = setExecutionData;

        /**
         * Grouped setter
         *
         * @param sentData
         * @param receivedData
         * @param status
         * @param path
         * @param operation
         * @param name
         * @param collection
         * @param timestamp
         */
        function setData(sentData, receivedData, status, path, operation, name, collection, timestamp) {

            self.sentData = sentData === null || sentData === undefined || $.isEmptyObject(sentData) ? null : sentData;
            self.name = name;
            self.path = path;
            self.method = operation;
            self.status = status;
            self.receivedData = receivedData === null || receivedData === undefined || $.isEmptyObject(receivedData) ?
                null : receivedData;
            self.collection = collection;
            self.timestamp = timestamp;
        }

        /**
         * Set data which might be available after executing request
         * @param sentData
         * @param receivedData
         * @param status - http status from response header
         */
        function setExecutionData(sentData, receivedData, status) {
            self.sentData = sentData;
            self.receivedData = receivedData;
            self.status = status ? (status > 199 && status < 205 ? 'success' : 'erorr') : '';
        }


        /**
         *
         * @returns {{sentData: (null|*), receivedData: (null|*), path: (string|*), collection: (string|*),
         * method: (string|*), status: (string|*), name: (string|*), timestamp: (string|*)}}
         */
        function toJSON() {
            var obj = {
                sentData: self.sentData,
                receivedData: self.receivedData,
                path: self.path,
                collection: self.collection,
                method: self.method,
                status: self.status,
                name: self.name,
                timestamp: self.timestamp,
            };

            return obj;
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
        function setDataForView(data){
            var newData = {},
                parsedData = '';

            angular.copy(data, newData);
            parsedData = JSON.stringify(
                YangUtilsService.stripAngularGarbage(newData, self.getLastPathDataElemName()), null, 4);

            return parsedData;
        }


        /**
         *
         * @returns {HistoryRequest}
         */
        function clone() {
            var result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);
            result.setData(self.sentData, self.receivedData, self.status, self.path, self.method, self.name,
                self.collection, self.timestamp);
            return result;
        }

    }

    return HistoryRequestModel;
});
