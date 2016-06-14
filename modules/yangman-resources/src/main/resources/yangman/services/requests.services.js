define(
    [
        'app/yangman/yangman.module',
        'app/yangman/models/historylist.model',
        'app/yangman/models/collectionlist.model',
        'app/yangman/models/history-request.model',
    ],
    function (yangui, HistoryListModel, CollectionListModel, HistoryRequestModel) {
        'use strict';

        yangui.register.service('RequestsService', RequestsService);

        RequestsService.$inject = ['PathUtilsService', 'ParametersService', 'ParsingJsonService', 'YangUtilsService'];

        function RequestsService(PathUtilsService, ParametersService, ParsingJsonService, YangUtilsService){

            var service = {};

            service.createEmptyCollectionList = createEmptyCollectionList;
            service.createEmptyHistoryList = createEmptyHistoryList;
            service.createHistoryRequestFromElement = createHistoryRequestFromElement;
            service.createHistoryRequest = createHistoryRequest;
            service.scanDataParams = scanDataParams;
            service.validateFile = validateFile;


            function scanDataParams(paramsObj, lineString) {

                console.debug('scaning params', arguments);

                var usedParamLabelArray = [];

                var params = lineString ? lineString.match(/<<(?!<<)[a-zA-Z0-9]+>>/g) : null;

                if ( params ) {
                    params
                        .filter(onlyUnique)
                        .forEach(function (param) {
                            usedParamLabelArray.push(removeUnwantedChars(param));
                        });
                }

                var returnedParamsList = paramsObj.list.forEach( function (param){
                    var nameIndex = usedParamLabelArray.indexOf(param.name);
                    if ( nameIndex !== -1 ) {
                        usedParamLabelArray.splice(nameIndex, 1);
                    }
                });

                usedParamLabelArray.forEach(function (param){
                    returnedParamsList.push(ParametersService.createParameter(param));
                });
                return returnedParamsList;

                // TODO: add function's description
                function removeUnwantedChars(val){
                    var string = val.substring(2);
                    return string.substring(0, string.indexOf('>>'));
                }

                // TODO: add function's description
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
            }

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
             * @param operation
             * @param status
             * @param name
             * @param collection
             * @returns {*}
             * @param timestamp
             */
            function createHistoryRequest(sentData, receivedData, path, operation, status, name, collection) {

                var receivedDataProcessed = status === 'success' ? receivedData : null,
                    result = new HistoryRequestModel(PathUtilsService, YangUtilsService, ParsingJsonService);

                result.setData(sentData, receivedDataProcessed, status, path, operation, name, collection, Date.now());

                return result;
            }

            /**
             * Creating {HistoryRequest} from elem containing all necessary data
             * @param {Object} elem
             * @returns {*}
             */
            function createHistoryRequestFromElement(elem) {
                return service.createHistoryRequest(elem.sentData, elem.receivedData, elem.path, elem.method,
                    elem.status, elem.name, elem.collection, Date.now());
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
