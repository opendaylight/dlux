define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.service('YangmanService', YangmanService);

    YangmanService.$inject = [
        'RequestBuilderService',
        'YangUtilsService',
        'YangUtilsRestangularService',
        'ENV',
        'ParsingJsonService',
        'RequestsService',

    ];

    function YangmanService(
        RequestBuilderService,
        YangUtilsService,
        YangUtilsRestangularService,
        ENV,
        ParsingJsonService,
        RequestsService
    ){
        var service = {
            checkRpcReceivedData: checkRpcReceivedData,
            executeRequestOperation: executeRequestOperation,
            fillNodeFromResponse: fillNodeFromResponse,
            getDataStoreIndex: getDataStoreIndex,
            prepareAllRequestData: prepareAllRequestData,
            prepareReceivedData: prepareReceivedData,
            validateFile: validateFile,
        };

        return service;

        function checkRpcReceivedData(data, node){
            return node.type === 'rpc' ? cutData(data) : data;

            function cutData(data){
                return {
                    output: data[node.label].output,
                };
            }
        }

        /**
         * Prepare request date before filling into node depends on method and node type
         * @param node
         * @param method
         * @param rData
         * @param sData
         * @param outputType
         * @returns {*}
         */
        function prepareReceivedData(node, method, rData, sData, outputType){
            var prepareType = {
                rpc: function(){

                    if ( outputType === 'form' ){
                        var dObj = {};
                        putIntoObj(rData, dObj, node.label);
                        putIntoObj(sData[node.label] ? sData[node.label] : sData, dObj, node.label);
                        return dObj;
                    } else {
                        return rData;
                    }

                    /**
                     * Put source object into destination object by source properties
                     * @param sourceObj
                     * @param destinationObj
                     */
                    function putIntoObj(sourceObj, destinationObj, containter){
                        Object.keys(sourceObj).forEach(function(prop){
                            destinationObj[containter] = destinationObj[containter] ? destinationObj[containter] : {};
                            destinationObj[containter][prop] = sourceObj[prop];
                        });
                    }
                },
                default: function (){
                    var methodType = {
                        GET: function () {
                            if ( node ){
                                node.clear();
                            }
                            return rData;
                        },
                        DELETE: function () {
                            if ( node ) {
                                node.clear();
                            }
                            return {};
                        },
                        PUT: function () {
                            return rData;
                        },
                        DEFAULT: function () {
                            return outputType === 'form' ? sData : rData;
                        }
                    };

                    return (methodType[method] || methodType.DEFAULT)();
                }
            };

            return (prepareType[node ? node.type : 'default'] || prepareType.default)();
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
         * Return index of selected datastore in list
         * @param list
         * @param dataStore
         * @returns {*}
         */
        function getDataStoreIndex(list, dataStore){
            var rIndex = null,
                result = list.some(function (item, index) {
                    rIndex = index;
                    return item.label === dataStore;
                });

            return result ? rIndex : null;
        }

        /**
         * Prepare all necessary data for executing or saving request
         * @param selectedApi
         * @param selectedSubApi
         * @param operation
         * @param node
         * @param dataType
         * @param requestUrl
         * @param requestData
         * @param params
         * @returns {{customRestangular: null, headers: {}, operation: string, reqString: string, reqHeaders: {},
         *          reqData: {}}}
         */
        function prepareAllRequestData(selectedApi, selectedSubApi, operation, node, dataType, requestUrl, requestData,
                                       params) {
            var allPreparedData = {
                customRestangular: null,
                headers: {},
                operation: '',
                reqString: selectedSubApi ? selectedSubApi.buildApiRequestString() : '',
                reqHeaders: {},
                reqData: '',
                srcData: '',
            };

            if ( dataType === 'form' && node){
                node.buildRequest(RequestBuilderService, requestData, node.module);
                allPreparedData.srcData = angular.copy(requestData);
            }
            else {
                allPreparedData.srcData = requestData;
            }

            allPreparedData.reqData = RequestsService.applyParams(params, allPreparedData.srcData);

            // prepare req data
            if (operation === 'GET' || operation === 'DELETE'){
                allPreparedData.srcData = null;
                allPreparedData.reqData = null;
            }
            else if (operation === 'POST'){
                allPreparedData.reqData = YangUtilsService.postRequestData(
                    allPreparedData.reqData,
                    allPreparedData.reqString,
                    selectedSubApi
                );
            }

            // set correct host into restangular based on shown data type and prepare data
            if ( dataType === 'req-data' ){
                var parser = locationHelper(requestUrl, ['pathname', 'origin']),
                    raParam = '';

                YangUtilsRestangularService.setBaseUrl(parser.origin);
                allPreparedData.reqString = parser.pathname.slice(1).split('/');
                raParam = allPreparedData.reqString.shift();
                allPreparedData.reqString = allPreparedData.reqString.join('/');

                allPreparedData.customRestangular = YangUtilsRestangularService.one(raParam);

            } else {

                YangUtilsRestangularService.setBaseUrl(ENV.getBaseURL('MD_SAL'));
                allPreparedData.customRestangular  = YangUtilsRestangularService.one('restconf');

                if ( node ) {
                    allPreparedData.headers = YangUtilsService.prepareHeaders(allPreparedData.reqData);
                }
            }

            allPreparedData.operation = YangUtilsService.prepareOperation(operation);
            return allPreparedData;
        }

        /**
         * Execute request built from this data
         * @param selectedApi
         * @param selectedSubApi
         * @param operation
         * @param node
         * @param dataType
         * @param requestUrl
         * @param requestData
         * @param successCbk
         * @param errorCbk
         * @param params
         */
        function executeRequestOperation(selectedApi, selectedSubApi, operation, node, dataType, requestUrl,
                                         requestData, params, successCbk, errorCbk) {
            var time = {
                started: 0,
                finished: 0,
            };

            YangUtilsRestangularService.setFullResponse(true);

            // prepare all necessary data
            var allPreparedData = prepareAllRequestData(selectedApi, selectedSubApi, operation, node, dataType,
                requestUrl, requestData, params);

            // start track time response
            time.started = new Date().getMilliseconds();

            // executing operation
            allPreparedData.customRestangular.customOperation(
                allPreparedData.operation.toLowerCase(),
                allPreparedData.reqString,
                null,
                allPreparedData.headers,
                allPreparedData.reqData
            )
            .then(
                function (response) {
                    (successCbk || angular.noop)(finishExecuting(response), response);
                },
                function (response) {
                    (errorCbk || angular.noop)(finishExecuting(response), response);
                }
            );

            function finishExecuting(response){
                // finish track time response
                time.finished = new Date().getMilliseconds();
                var spentRequestTime = time.finished - time.started;

                return {
                    status: response.status,
                    statusText: response.statusText,
                    time: spentRequestTime < 0 ? -(spentRequestTime) : spentRequestTime,
                    requestData: allPreparedData.reqData,
                    requestSrcData: allPreparedData.srcData,
                };
            }
        }

        /**
         * Method for parsing path to additional properties based on JS LOCATION
         * @param path
         * @param properties
         * @returns {{}}
         */
        function locationHelper(path, properties){
            var parser = document.createElement('a'),
                obj = {};

            parser.href = path;

            properties.forEach(function (prop) {
                obj[prop] = parser[prop];
            });

            return obj;
        }

        /**
         * Fill node values from response
         * @param node
         * @param data
         */
        function fillNodeFromResponse(node, data){
            var props = data ? Object.getOwnPropertyNames(data) : [];

            // fill each property - needed for root mountpoint node,
            // in other cases there should be only one property anyway
            props.forEach(function (p) {
                node.fill(p, data[p]);
            });
        }
    }

});
