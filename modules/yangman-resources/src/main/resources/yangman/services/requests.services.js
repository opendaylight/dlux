define([
    'app/yangman/models/historylist.model',
    'app/yangman/models/collectionlist.model',
    'app/yangman/models/history-request.model',
], function (HistoryListModel, CollectionListModel, HistoryRequestModel) {
    'use strict';

    angular.module('app.yangman').service('RequestsService', RequestsService);

    RequestsService.$inject = ['PathUtilsService', 'ParametersService', 'ParsingJsonService', 'YangUtilsService'];

    function RequestsService(PathUtilsService, ParametersService, ParsingJsonService, YangUtilsService){

        var service = {};

        service.applyParams = applyParams;
        service.createEmptyCollectionList = createEmptyCollectionList;
        service.createEmptyHistoryList = createEmptyHistoryList;
        service.createHistoryRequestFromElement = createHistoryRequestFromElement;
        service.createHistoryRequest = createHistoryRequest;
        service.scanDataParams = scanDataParams;
        service.replaceStringInText = replaceStringInText;

        /**
         * Scan used parameters in current line of codemirror
         * @param {ParametersListModel} paramsObj - list of parameters to be searched for
         * @param {string} lineString - line from current codemirror to be inspected
         * @returns array of {ParameterModel}
         */
        function scanDataParams(paramsObj, lineString) {

            var usedParamLabelArray = [];

            var params = lineString ? lineString.match(/<<(?!<<)[a-zA-Z0-9]+>>/g) : null;

            if ( params ) {
                params
                    .filter(onlyUnique)
                    .forEach(function (param) {
                        usedParamLabelArray.push(removeUnwantedChars(param));
                    });
            }

            var returnedParamsList = paramsObj.list.filter( function (param){
                    var paramIndex = usedParamLabelArray.indexOf(param.name);
                if ( paramIndex !== -1 ) {
                    return usedParamLabelArray.splice(paramIndex, 1);
                }
                else {
                    return false;
                }
            });

            usedParamLabelArray.forEach(function (param){
                    returnedParamsList.push(ParametersService.createParameter({ name: param }));
            });

            return returnedParamsList;

            /**
             * remove chars greater then and less then from parameter definition
             * @param val
             * @returns {string}
             */
            function removeUnwantedChars(val){
                var string = val.substring(2);
                return string.substring(0, string.indexOf('>>'));
            }

            /**
             * Filter function
             * @param value
             * @param index
             * @param self
             * @returns {boolean}
             */
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
        }

        /**
         * Replace all parameters with its values
         * @param paramsObj
         * @param requestData
         * @returns {*}
         */
        function applyParams(paramsObj, data) {
            var dataStr = JSON.stringify(data);

                if (paramsObj && paramsObj.hasOwnProperty('list')) {
                    paramsObj.list.forEach(function (param){
                        dataStr = service.replaceStringInText(dataStr, '<<' + param.name + '>>', param.value);
                    });
                }

            return ParsingJsonService.parseJson(dataStr);
        }

        /**
         * Service for replacing string in text
         * @param text
         * @param strToReplace
         * @param newStr
         * @returns {*}
         */
        function replaceStringInText(text, strToReplace, newStr) {
            var replacedText = text;
            if (text.indexOf(strToReplace) > -1) {
                replacedText = text.split(strToReplace).join(newStr);
            }
            return replacedText;
        }




        /**
         * Service for creating basic history object
         * @param sentData
         * @param receivedData
         * @param path
         * @param operation
         * @param status
         * @param name
         * @param collection
         * @returns {*}
         * @param timestamp
         */
            function createHistoryRequest(sentData, receivedData, path, operation, status, name, collection, timestamp) {

            var receivedDataProcessed = status === 'success' ? receivedData : null,
                result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);

                result.setData(sentData, receivedDataProcessed, status, path, operation, name, collection, timestamp);

            return result;
        }

        /**
         * Creating {HistoryRequest} from elem containing all necessary data
         * @param {Object} elem
         * @returns {*}
         */
        function createHistoryRequestFromElement(elem) {
                if (!elem.hasOwnProperty('timestamp')){
                    elem.timestamp = Date.now();
                }
            return service.createHistoryRequest(elem.sentData, elem.receivedData, elem.path, elem.method,
                    elem.status, elem.name, elem.collection, elem.timestamp);
        }

        /**
         * Service for creating empty collection list
         * @param name
         * @param getApiFunction
         * @returns {CollectionList}
         */
        function createEmptyCollectionList(name){
            var result = new CollectionListModel(ParsingJsonService, service);
            result.setName(name);
            return result;
        }

        /**
         * Service for creating empty history list
         * @param name
         * @returns {*}
         */
        function createEmptyHistoryList(name){
            var result = new HistoryListModel(ParsingJsonService, service);
            result.setName(name);
            return result;
        }

        return service;

    }

    });
