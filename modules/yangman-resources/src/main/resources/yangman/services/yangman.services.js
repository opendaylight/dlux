define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.service('YangmanService', YangmanService);

    YangmanService.$inject = [
        'RequestBuilderService',
        'YangUtilsService',
        'YangUtilsRestangularService',
        'ENV',
        'RequestsService',
    ];

    function YangmanService(
        RequestBuilderService,
        YangUtilsService,
        YangUtilsRestangularService,
        ENV,
        RequestsService
    ){
        var service = {
            executeRequestOperation: executeRequestOperation,
            fillNodeFromResponse: fillNodeFromResponse,
            getDataStoreIndex: getDataStoreIndex,
            prepareAllRequestData: prepareAllRequestData,
        };

        return service;

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
                reqData: {},
            };

            // set correct host into restangular based on shown data type
            if ( dataType === 'req-data' ){
                var parser = locationHelper(requestUrl, ['pathname', 'origin']),
                    raParam = '';

                YangUtilsRestangularService.setBaseUrl(parser.origin);
                allPreparedData.reqString = parser.pathname.slice(1).split('/');
                raParam = allPreparedData.reqString.shift();
                allPreparedData.reqString = allPreparedData.reqString.join('/');

                allPreparedData.customRestangular = YangUtilsRestangularService.one(raParam);
                allPreparedData.reqData = RequestsService.applyParams(params, requestData);
            } else {

                YangUtilsRestangularService.setBaseUrl(ENV.getBaseURL('MD_SAL'));
                allPreparedData.customRestangular  = YangUtilsRestangularService.one('restconf');

                if ( node ) {

                    node.buildRequest(RequestBuilderService, requestData, node.module);
                    angular.copy(requestData, allPreparedData.reqData);
                    allPreparedData.reqData = RequestsService.applyParams(params, allPreparedData.reqData);

                    allPreparedData.reqData = YangUtilsService.prepareRequestData(
                        allPreparedData.reqData,
                        operation,
                        allPreparedData.reqString,
                        selectedSubApi
                    );

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

                return {
                    status: response.status,
                    statusText: response.statusText,
                    time: (time.finished - time.started),
                    requestData: allPreparedData.reqData,
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
