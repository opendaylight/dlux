define([], function () {
    'use strict';

    angular.module('app.yangman').service('YangmanService', YangmanService);

    YangmanService.$inject = [
        'RequestBuilderService',
        'YangUtilsService',
        'YangUtilsRestangularService',
        'ENV',
        'ParsingJsonService',
        'RequestsService',
        'PathUtilsService',
        'constants',
    ];

    function YangmanService(
        RequestBuilderService,
        YangUtilsService,
        YangUtilsRestangularService,
        ENV,
        ParsingJsonService,
        RequestsService,
        PathUtilsService,
        constants
    ){
        var service = {
            cutUrl: cutUrl,
            checkRpcReceivedData: checkRpcReceivedData,
            executeRequestOperation: executeRequestOperation,
            fillNodeFromResponse: fillNodeFromResponse,
            getDataStoreIndex: getDataStoreIndex,
            handleNodeIdentifier: handleNodeIdentifier,
            prepareAllRequestData: prepareAllRequestData,
            prepareReceivedData: prepareReceivedData,
            putIntoObj: putIntoObj,
            setSrcDataByDataType: setSrcDataByDataType,
            validateFile: validateFile,
        };

        return service;

        /**
         * Handle param continuum between header path array and node data
         * @param parametersList
         * @param selectedSubApi
         * @param node
         */
        function handleNodeIdentifier(parametersList, selectedSubApi, node){
            var identifier = RequestsService.findIdentifierByParam(
                parametersList, selectedSubApi.pathArray[selectedSubApi.pathArray.length - 1]
            );

            if ( identifier ){
                PathUtilsService.fillListNode(node, identifier.label, identifier.value);
            }
        }

        /**
         * Put data to output container if root node is rpc
         * @param data
         * @param node
         * @returns {*}
         */
        function checkRpcReceivedData(data, node){
            return node.type === constants.NODE_RPC ? cutData(data) : data;

            function cutData(data){
                return {
                    output: data[node.label].output,
                };
            }
        }

        /**
         * Put source object into destination object by source properties
         * @param sourceObj
         * @param destinationObj
         */
        function putIntoObj(sourceObj, destinationObj, containter){
            if ( sourceObj ) {
                Object.keys(sourceObj).forEach(function(prop){
                    destinationObj[containter] = destinationObj[containter] ? destinationObj[containter] : {};
                    destinationObj[containter][prop] = sourceObj[prop];
                });
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
                rpc: function (){

                    if ( outputType === constants.DISPLAY_TYPE_FORM ){
                        var dObj = {};

                        if ( !sData ) {
                            sData = {};
                            sData[node.label] = {};
                        }

                        putIntoObj(rData, dObj, node.label);
                        putIntoObj(sData[node.label] ? sData[node.label] : sData, dObj, node.label);
                        return dObj;
                    } else {
                        return rData;
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
                        DEFAULT: function () {
                            if (node) {
                                node.clear();
                            }
                            return rData;
                        },
                    };

                    return (methodType[method] || methodType.DEFAULT)();
                },
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
         * Apply all parametrized values into request (data, url, pathArray)
         * @param allPreparedData
         * @param params
         * @param selSubApiCopy
         * @param requestUrl
         */
        function setParametrizedData(allPreparedData, params, selSubApiCopy, requestUrl){
            allPreparedData.reqFullUrl = RequestsService.applyParamsToStr(params, requestUrl);

            // apply parametrized value into request data in string form
            allPreparedData.reqString =
                selSubApiCopy ? RequestsService.applyParamsToStr(params, selSubApiCopy.buildApiRequestString()) : '';

            if ( !angular.equals(allPreparedData.reqFullUrl, requestUrl) && selSubApiCopy ){
                // fill parametrized data into path array
                PathUtilsService.fillPath(selSubApiCopy.pathArray, allPreparedData.reqFullUrl);
            }

            allPreparedData.reqData = RequestsService.applyParamsToObj(params, allPreparedData.srcData);
        }

        /**
         * Set source data into request object based on shown data type
         * @param allPreparedData
         * @param node
         * @param requestData
         * @param dataType
         */
        function setSrcDataByDataType(allPreparedData, node, requestData, dataType){
            if ( dataType === constants.DISPLAY_TYPE_FORM && node){
                node.buildRequest(RequestBuilderService, requestData, node.module);
                allPreparedData.srcData = angular.copy(requestData);
            }
            else {
                allPreparedData.srcData = requestData;
            }
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
         * @returns {
         *   {
         *     customRestangular: null,
         *     headers: {},
         *     operation: string,
         *     reqString: string,
         *     reqHeaders: {},
         *     reqData: string,
         *     srcData: string,
         *     reqFullUrl:
         *     string
         *    }
         *   }
         */
        function prepareAllRequestData(selectedApi, selectedSubApi, operation, node, dataType, requestUrl, requestData,
                                       params) {
            var allPreparedData = {
                    customRestangular: null,
                    headers: {},
                    operation: '',
                    reqString: '',
                    reqHeaders: {},
                    reqData: '',
                    srcData: '',
                    reqFullUrl: '',
                },
                selSubApiCopy = angular.copy(selectedSubApi);

            setSrcDataByDataType(allPreparedData, node, requestData, dataType);
            setParametrizedData(allPreparedData, params, selSubApiCopy, requestUrl);

            // prepare req data
            if (operation === constants.OPERATION_GET){
                allPreparedData.srcData = null;
                allPreparedData.reqData = null;
            }
            else if ( operation === constants.OPERATION_POST ){

                if ( selSubApiCopy ) {
                    allPreparedData.reqData = YangUtilsService.postRequestData(
                        allPreparedData.reqData,
                        allPreparedData.reqString,
                        selSubApiCopy
                    );
                }
            }

            // set correct host into restangular based on shown data type and prepare data
            if ( dataType === constants.DISPLAY_TYPE_REQ_DATA ){
                var parser = locationHelper(allPreparedData.reqFullUrl, ['pathname', 'origin']),
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

        function cutUrl(url){
            return url.indexOf('restconf') > -1 ? url.split('restconf')[1].substring(1) : url;
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

            YangUtilsRestangularService.setFullResponse(true);

            var allPreparedData = prepareAllRequestData(
                selectedApi, selectedSubApi, operation, node, dataType, requestUrl, requestData, params
            );

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

                return {
                    status: response.status,
                    statusText: response.statusText,
                    time: null,
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
            node.clear();
            props.forEach(function (p) {
                node.fill(p, data[p]);
            });
        }
    }

});
