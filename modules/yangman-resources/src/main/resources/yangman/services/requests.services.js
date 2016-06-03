define(
    [
        'app/yangman/models/historylist.model',
        'app/yangman/models/collectionlist.model',
        'app/yangman/models/history-request.model',
    ],
    function (HistoryListModel, CollectionListModel, HistoryRequestModel) {
        'use strict';

        angular.module('app.yangman').service('RequestsService', RequestsService);

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

                var api = (getApiFunction || angular.noop)(path),
                    receivedDataProcessed = status === 'success' ? receivedData : null,
                    result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);

                result.setData(sentData, receivedDataProcessed, status, path, parametrizedPath, operation, api, name,
                    collection, timestamp);

                return result;
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
                var result = new CollectionListModel(ParsingJsonService, service);
                result.setName(name);
                result.setGetApiFunction(getApiFunction);
                return result;
            }

            /**
             * Service for creating empty history list
             * @param name
             * @param getApiFunction
             * @returns {HistoryList}
             */
            function createEmptyHistoryList(name, getApiFunction){
                var result = new HistoryListModel(ParsingJsonService, service);
                result.setName(name);
                result.setGetApiFunction(getApiFunction);
                return result;
            }

            return service;

        }

    });
