define([], function () {
    'use strict';

    angular.module('app.yangman').controller('RequestHeaderCtrl', RequestHeaderCtrl);

    RequestHeaderCtrl.$inject = ['$scope', '$rootScope', 'ENV', 'YangmanService', 'PathUtilsService', '$filter'];

    function RequestHeaderCtrl($scope, $rootScope, ENV, YangmanService, PathUtilsService, $filter) {
        var requestHeader = this;

        requestHeader.allOperations = ['GET', 'POST', 'PUT', 'DELETE'];
        requestHeader.selectedOperationsList = [];
        requestHeader.selectedOperation = null;
        requestHeader.requestUrl = '';
        requestHeader.statusObj = null;

        // methods
        requestHeader.executeOperation = executeOperation;
        requestHeader.fillNodeData = fillNodeData;
        requestHeader.changeDataType = changeDataType;
        requestHeader.checkExecutedData = checkExecutedData;
        requestHeader.setJsonView = setJsonView;
        requestHeader.setRequestUrl = setRequestUrl;

        // watchers
        /**
         * Set selected operations based on data store
         */
        $scope.$on('SET_SEL_OPERATIONS', function (event, operations) {
            setAllowedMethods(operations);
            setRequestUrl();
        });

        /**
         * Watching for changes in shown detail data type (radio button)
         */
        $scope.$on('YANGMAN_HEADER_INIT', function (event, args) {
            init();
            setRequestUrl(args.params.path);
        });

        init();

        /**
         * Method for selecting correct json view by selected operation
         */
        function setJsonView(){
            var both = ['PUT', 'POST'];

            if ( both.indexOf(requestHeader.selectedOperation) > -1 ){
                $scope.setJsonView(true, true);
            } else {
                $scope.setJsonView(true, false);
            }

            sendRequestData({}, 'RECEIVED');
        }

        /**
         * Method for executing after data type was change (radio button)
         */
        function changeDataType(){
            $scope.switchSection('rightPanelSection', requestHeader.selectedShownDataType);
            requestHeader.setRequestUrl();

            if ( requestHeader.selectedShownDataType === 'req-data' && $scope.node ){
                setJsonView();
                sendRequestData($scope.buildRootRequest(), 'SENT');
            }
        }

        /**
         * Method for sending data to code mirror
         * @param data
         */
        function sendRequestData(data, type){
            $scope.rootBroadcast('YANGMAN_SET_CODEMIRROR_DATA_' + type, { data: JSON.stringify(data, null, 4) });
        }

        /**
         * Initialization
         */
        function init(){
            setAllowedMethods(requestHeader.allOperations);
            requestHeader.selectedShownDataType = $scope.rightPanelSection;
        }

        /**
         * Set allowed operations for request
         * @param operations
         */
        function setAllowedMethods(operations){
            requestHeader.selectedOperationsList = operations.length ? operations : requestHeader.allOperations;
            requestHeader.selectedOperation = requestHeader.selectedOperationsList[0];
        }

        /**
         * Set header request url if json selected
         */
        function setRequestUrl(path){
            requestHeader.requestUrl = path || ($scope.selectedSubApi ?
                    ENV.getBaseURL('MD_SAL') + '/restconf/' + $scope.selectedSubApi.buildApiRequestString() : '');
        }

        /**
         * Execute request operation
         */
        function executeOperation(requestData){

            YangmanService.executeRequestOperation(
                $scope.selectedApi,
                $scope.selectedSubApi,
                requestHeader.selectedOperation,
                $scope.node,
                requestHeader.selectedShownDataType,
                requestHeader.requestUrl,
                requestData,
                function (reqInfo, response) {
                    requestHeader.statusObj = reqInfo;

                    console.log('response.data', response.data);

                    if (response.data) {

                        if ( requestHeader.selectedShownDataType === 'req-data' ) {

                            // try to fill code mirror editor
                            sendRequestData(response.data.plain(), 'RECEIVED');

                            // try to find api, subapi and node
                            $scope.rootBroadcast('YANGMAN_GET_API_TREE_DATA', null, function (treeApis) {
                                var apisIndexes =
                                    PathUtilsService.searchNodeByPath(requestHeader.requestUrl, treeApis, null, true);

                                if ( apisIndexes ){
                                    // set apis
                                    $scope.setApi(
                                        $scope.apis[apisIndexes.indexApi],
                                        $scope.apis[apisIndexes.indexApi].subApis[apisIndexes.indexSubApi]
                                    );

                                    // set module
                                    $scope.setModule($filter('filter')(treeApis, { label: $scope.selectedApi.module })[0]);

                                    // set datastore
                                    $scope.setDataStore(
                                        $filter('filter')(
                                            $scope.selectedModule.children,
                                            { label: $scope.selectedSubApi.storage })[0],
                                        true,
                                        1
                                    );

                                    // set node
                                    $scope.setNode($scope.selectedSubApi.node);

                                    if ( $scope.node ) {
                                        // try to fill node
                                        YangmanService.fillNodeFromResponse($scope.node, response.data);
                                        $scope.node.expanded = true;
                                    }
                                }
                            });
                        } else {

                            if ( $scope.node ) {
                                // try to fill node
                                YangmanService.fillNodeFromResponse($scope.node, response.data);
                                $scope.node.expanded = true;
                            }
                        }


                    } else {
                        sendRequestData({}, 'RECEIVED');
                    }
                }, function (reqInfo, response) {
                    requestHeader.statusObj = reqInfo;

                    if (response.data) {
                        if ( requestHeader.selectedShownDataType === 'req-data' ) {
                            // try to fill code mirror editor
                            sendRequestData(response.data, 'RECEIVED');
                        }
                    }
                });
        }

        // TODO :: description
        function fillNodeData(pathElem, identifier) {
            if ($scope.selectedSubApi && $scope.selectedSubApi.storage === 'config' &&
                $scope.selectedSubApi.pathArray.indexOf(pathElem) === ($scope.selectedSubApi.pathArray.length - 1)) {
                PathUtilsService.fillListNode($scope.node, identifier.label, identifier.value);
            }
        }

        /**
         * Check data before executin operations
         */
        function checkExecutedData(){

            if ( requestHeader.requestUrl.length ) {
                var params = {
                    reqData: null,
                };

                if ( requestHeader.selectedShownDataType === 'req-data' ) {
                    // get json data
                    $scope.rootBroadcast('YANGMAN_GET_CODEMIRROR_DATA_SENT', params);
                    executeOperation(angular.fromJson(params.reqData));
                } else {
                    executeOperation({});
                }
            }
        }

    }

});
