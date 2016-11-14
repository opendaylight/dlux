define([
    'app/yangman/models/historylist.model',
    'app/yangman/models/collectionlist.model',
    'app/yangman/models/history-request.model',
], function (HistoryListModel, CollectionListModel, HistoryRequestModel) {
    'use strict';

    angular.module('app.yangman').service('RequestsService', RequestsService);

    RequestsService.$inject = [
        '$filter', 'PathUtilsService', 'ParametersService', 'ParsingJsonService', 'YangUtilsService',
        'RequestBuilderService', 'constants',
    ];

    function RequestsService($filter, PathUtilsService, ParametersService, ParsingJsonService, YangUtilsService,
                             RequestBuilderService, constants) {

        var service = {};

        service.applyParamsToObj = applyParamsToObj;
        service.applyParamsToStr = applyParamsToStr;
        service.clearUnnecessaryProperties = clearUnnecessaryProperties;
        service.createEmptyCollectionList = createEmptyCollectionList;
        service.createEmptyHistoryList = createEmptyHistoryList;
        service.createHistoryRequestFromElement = createHistoryRequestFromElement;
        service.createHistoryRequest = createHistoryRequest;
        service.fillRequestByMethod = fillRequestByMethod;
        service.fillRequestByViewType = fillRequestByViewType;
        service.findIdentifierByParam = findIdentifierByParam;
        service.scanDataParams = scanDataParams;
        service.replaceStringInText = replaceStringInText;

        /**
         * Clear unnecesary properties for saving to collection
         * @param request
         */
        function clearUnnecessaryProperties(request){
            request.status = '';
            request.responseStatus = null;
            request.responseStatusText = null;
            request.responseTime = null;

            return request;
        }

        /**
         * Find parametrized identifier in path array
         * @param params
         * @param pathElement
         * @returns {*}
         */
        function findIdentifierByParam(params, pathElement){
            var foundIdentifier = null;

            if ( pathElement.hasIdentifier() ){
                pathElement.identifiers.some(function (item){
                    return params.list.some(function (param){
                        var contained = item.value.indexOf('<<' + param.name + '>>') > -1;

                        if ( contained ){
                            foundIdentifier = item;
                        }

                        return contained;
                    });
                });
            }

            return foundIdentifier;
        }

        /**
         * Get data for saving request depend on view type
         * @param node
         * @param viewType
         * @param requestData
         * @param dataType
         * @param method
         * @returns {*}
         */
        function fillRequestByViewType(node, viewType, requestData, dataType, method){
            var setDataByViewType = {
                form: function () {
                    var data = {},
                        emptyObject = method === constants.OPERATION_POST && dataType.toUpperCase() === constants.REQUEST_DATA_TYPE_RECEIVED && node.type !== constants.NODE_RPC;

                    if ( !emptyObject ) {
                        node.buildRequest(RequestBuilderService, data, node.module);
                        data = checkNodeTypeData(node, data, dataType, requestData);
                    }

                    return data;
                },
                'req-data': function (){
                    return requestData ? angular.fromJson(requestData) : {};
                },
            };

            return setDataByViewType[viewType]();

            /**
             * Exceptions based on node type
             * @param node
             * @param data
             * @param dataType
             * @param requestData
             * @returns {*}
             */
            function checkNodeTypeData(node, data, dataType, requestData){
                var copyData = angular.copy(data),
                    setDataByNodeType = {
                        rpc: function (){

                            if ( dataType.toUpperCase() === constants.REQUEST_DATA_TYPE_RECEIVED ) {
                                copyData = requestData ? angular.fromJson(requestData) : {};
                            }

                            return copyData;
                        },
                        default: function () {
                            return data;
                        },
                    };

                return (setDataByNodeType[node.type] || setDataByNodeType.default)();
            }
        }

        /**
         * Fill history request data depend on selected method - saving to collection
         * @param requestObj
         * @param sentData
         * @param receivedData
         * @param method
         */
        function fillRequestByMethod(requestObj, sentData, receivedData, method, node, viewType){
            var setDataByMethod = {
                    GET: function (){
                        return {
                            sentData: {},
                            receivedData: receivedData.reqData ? angular.fromJson(receivedData.reqData) : {},
                        };
                    },
                    POST: function (){
                        return {
                            sentData: fillRequestByViewType(node, viewType, sentData.reqData, 'sent', method),
                            receivedData: fillRequestByViewType(
                                node, viewType, receivedData.reqData, constants.REQUEST_DATA_TYPE_RECEIVED, method
                            ),
                        };
                    },
                    PUT: function (){
                        return {
                            sentData: fillRequestByViewType(node, viewType, sentData.reqData, 'sent', method),
                            receivedData: {},
                        };
                    },
                    DELETE: function (){
                        return {
                            sentData: {},
                            receivedData: {},
                        };
                    },
                },
                data = setDataByMethod[method]();

            requestObj.setExecutionData(data.sentData, data.receivedData, '');
        }

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
         * @param str
         * @returns {*}
         */
        function applyParamsToStr(paramsObj, str) {
            if (paramsObj && paramsObj.hasOwnProperty('list')) {
                paramsObj.list.forEach(function (param){
                    str = service.replaceStringInText(str, '<<' + param.name + '>>', param.value);
                });
            }

            return str;
        }

        /**
         * Replace all parameters with its values
         * @param paramsObj
         * @param requestData
         * @returns {*}
         */
        function applyParamsToObj(paramsObj, data) {
            var dataStr = JSON.stringify(data);

            dataStr = service.applyParamsToStr(paramsObj, dataStr);

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
        function createHistoryRequest(sentData, receivedData, path, operation, status, name, collection, timestamp,
                                      responseStatus, responseStatusText, responseTime) {
            var result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);

            timestamp = timestamp || Date.now();

            result.setData(sentData, receivedData, status, path, operation, name, collection, timestamp,
                responseStatus, responseStatusText, responseTime);

            return result;
        }

        /**
         * Creating {HistoryRequest} from elem containing all necessary data
         * @param {Object} elem
         * @returns {*}
         */
        function createHistoryRequestFromElement(elem) {
            if (!elem.hasOwnProperty('timestamp') || elem.timestamp === ''){
                elem.timestamp = Date.now();
            }

            return service.createHistoryRequest(elem.sentData, elem.receivedData, elem.path, elem.method,
                elem.status, elem.name, elem.collection, elem.timestamp, elem.responseStatus,
                elem.responseStatusText, elem.responseTime
            );
        }

        /**
         * Service for creating empty collection list
         * @param name
         * @param getApiFunction
         * @returns {CollectionList}
         */
        function createEmptyCollectionList(name){
            var result = new CollectionListModel($filter, ParsingJsonService, service);
            result.setName(name);
            return result;
        }

        /**
         * Service for creating empty history list
         * @param name
         * @returns {*}
         */
        function createEmptyHistoryList(name, settingsObj){
            var result = new HistoryListModel($filter, ParsingJsonService, service);
            result.setName(name);
            result.setSettings(settingsObj);
            return result;
        }

        return service;

    }

});
