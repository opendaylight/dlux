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
        self.responseStatus = '';
        self.responseStatusText = '';
        self.responseTime = '';

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
         * @param responseStatus
         * @param responseTime
         * @param responseStatusText
         */
        function setData(sentData, receivedData, status, path, operation, name, collection, timestamp, responseStatus, responseStatusText, responseTime) {

            self.sentData = sentData === null || sentData === undefined || $.isEmptyObject(sentData) ? null : sentData;
            self.name = name;
            self.path = path;
            self.method = operation;
            self.status = status;
            self.receivedData = receivedData === null || receivedData === undefined || $.isEmptyObject(receivedData) ?
                null : receivedData;
            self.collection = collection;
            self.timestamp = timestamp;
            self.responseStatus = responseStatus;
            self.responseStatusText = responseStatusText;
            self.responseTime = responseTime;
        }

        /**
         * Set data which might be available after executing request
         * @param sentData
         * @param receivedData
         * @param status - http status from response header
         * @param responseStatus
         * @param responseTime
         * @param responseStatusText
         */
        function setExecutionData(sentData, receivedData, status, responseStatus, responseStatusText, responseTime) {
            self.sentData = sentData;
            self.receivedData = receivedData;
            self.status = status ? (status > 199 && status < 205 ? 'success' : 'erorr') : '';
            self.responseStatus = responseStatus;
            self.responseStatusText = responseStatusText;
            self.responseTime = responseTime;
        }


        /**
         *
         * @returns {{sentData: (null|*), receivedData: (null|*), path: (string|*), collection: (string|*),
         * method: (string|*), status: (string|*), name: (string|*), timestamp: (string|*), responseStatus: (string|*),
         * responseTime: (string|*)}}
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
                responseStatus: self.responseStatus,
                responseStatusText: self.responseStatusText,
                responseTime: self.responseTime,
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
            /**
             *
             * @type {HistoryRequestModel}
             */
            var result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);
            result.setData(self.sentData, self.receivedData, self.status, self.path, self.method, self.name,
                self.collection, self.timestamp, self.responseStatus, self.responseStatusText, self.responseTime);
            return result;
        }

    }

    return HistoryRequestModel;
});
