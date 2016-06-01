define([
    'app/yangman/yangman.module',
], function (yangman) {
    'use strict';

    yangman.register.controller('RequestHeaderCtrl', RequestHeaderCtrl);

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
        requestHeader.setRequestUrl = setRequestUrl;

        init();

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
        function setRequestUrl(){
            requestHeader.requestUrl =
                $scope.selectedSubApi ?
                    ENV.getBaseURL('MD_SAL') + '/restconf/' + $scope.selectedSubApi.buildApiRequestString() : '';
        }

        /**
         * Execute request operation
         */
        function executeOperation(){

            YangmanService.executeRequestOperation(
                $scope.selectedApi,
                $scope.selectedSubApi,
                requestHeader.selectedOperation,
                $scope.node,
                requestHeader.selectedShownDataType,
                requestHeader.requestUrl,
                function (reqInfo, response) {
                    requestHeader.statusObj = reqInfo;

                    if (response.data) {

                        if ( requestHeader.selectedShownDataType === 'json' ) {
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


                    }
                }, function (reqInfo) {
                    requestHeader.statusObj = reqInfo;
                });
        }

        function fillNodeData(pathElem, identifier) {
            if ($scope.selectedSubApi && $scope.selectedSubApi.storage === 'config' &&
                $scope.selectedSubApi.pathArray.indexOf(pathElem) === ($scope.selectedSubApi.pathArray.length - 1)) {
                PathUtilsService.fillListNode($scope.node, identifier.label, identifier.value);
            }
        }

        // watchers
        $scope.$on('SET_SEL_OPERATIONS', function (event, operations) {
            setAllowedMethods(operations);
            setRequestUrl();
        });

    }

});
