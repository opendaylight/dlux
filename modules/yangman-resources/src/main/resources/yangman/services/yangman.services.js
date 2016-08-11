define([], function () {
    'use strict';

    angular.module('app.yangman').service('YangmanService', YangmanService);

    YangmanService.$inject = [
        'RequestBuilderService',
        'YangUtilsService',
        'YangUtilsRestangularService',
        'ENV',
    ];

    function YangmanService(
        RequestBuilderService,
        YangUtilsService,
        YangUtilsRestangularService,
        ENV
    ){
        var service = {
            executeRequestOperation: executeRequestOperation,
            fillNodeFromResponse: fillNodeFromResponse,
            getDataStoreIndex: getDataStoreIndex,
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

        function executeRequestOperation(
            selectedApi,
            selectedSubApi,
            operation,
            node, dataType,
            requestUrl,
            successCbk,
            errorCbk
        ){
            var reqString = selectedSubApi ? selectedSubApi.buildApiRequestString() : '',
                requestData = {},
                preparedRequestData = {},
                headers,
                time = {
                    started: 0,
                    finished: 0,
                },
                customRestangular = null;

            // set full response detail
            YangUtilsRestangularService.setFullResponse(true);

            // set correct host into restangular based on shown data type
            if ( dataType === 'json' ){
                var parser = locationHelper(requestUrl, ['pathname', 'origin']),
                    raParam = '';

                YangUtilsRestangularService.setBaseUrl(parser.origin);
                reqString = parser.pathname.slice(1).split('/');
                raParam = reqString.shift();
                reqString = reqString.join('/');

                customRestangular = YangUtilsRestangularService.one(raParam);
            } else {
                YangUtilsRestangularService.setBaseUrl(ENV.getBaseURL('MD_SAL'));
                customRestangular  = YangUtilsRestangularService.one('restconf');
            }

            //reqString = reqPath ? reqPath.slice(selectedApi.basePath.length, reqPath.length) : reqString;
            //var requestPath = selectedApi.basePath + reqString;

            // if node build sent request
            if ( node ) {

                node.buildRequest(RequestBuilderService, requestData, node.module);
                angular.copy(requestData, preparedRequestData);

                preparedRequestData = YangUtilsService.prepareRequestData(
                    preparedRequestData,
                    operation,
                    reqString, selectedSubApi
                );

                headers = YangUtilsService.prepareHeaders(preparedRequestData);
            }

            operation = YangUtilsService.prepareOperation(operation);

            // start track time response
            time.started = new Date().getMilliseconds();

            // executing operation
            customRestangular
                .customOperation(operation.toLowerCase(), reqString, null, headers, preparedRequestData)
                .then(function (response) {
                    // finish track time response
                    time.finished = new Date().getMilliseconds();

                    var reqObj = {
                        status: response.status,
                        statusText: response.statusText,
                        time: (time.finished - time.started),
                    };

                    (successCbk || angular.noop)(reqObj, response);

                }, function (resp) {
                    console.log('resp', resp);
                    // finish track time response
                    time.finished = new Date().getMilliseconds();

                    var reqObj = {
                        status: resp.status,
                        statusText: resp.statusText,
                        time: (time.finished - time.started),
                    };

                    (errorCbk || angular.noop)(reqObj);

                    var errorMsg = '';

                    if (resp.data && resp.data.errors && resp.data.errors.error && resp.data.errors.error.length) {
                        errorMsg = ': ' + resp.data.errors.error.map(function (e) {
                            return e['error-message'];
                        }).join(', ');
                    }

                    /**
                     * TODO after first GET we have set $scope.node with data
                     * so build from the top of this function return requestData
                     */
                    if (operation === 'GET'){
                        requestData = {};
                    }

                    console.info(
                        'error sending request to', selectedSubApi ? selectedSubApi.buildApiRequestString() : '',
                        'reqString', reqString,
                        'got', resp.status,
                        'data', resp.data
                    );
                }
            );
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
            var props = Object.getOwnPropertyNames(data);

            // fill each property - needed for root mountpoint node,
            // in other cases there should be only one property anyway
            props.forEach(function (p) {
                node.fill(p, data[p]);
            });
        }
    }

});
