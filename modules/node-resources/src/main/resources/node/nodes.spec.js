/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
define(['app/node/nodes.module', 'app/node/nodes.controller', 'angular-ui-router', 'common/layout/layout.module'], function () {
    describe("Node Listing Screen", function () {
        var scope, state, nodeServiceMock, rootScope;
        beforeEach(angular.mock.module('ui.router'));
        beforeEach(angular.mock.module('app.common.layout'));
        beforeEach(angular.mock.module('app.nodes'));

        beforeEach(angular.mock.inject(function ($controller, $q, $state, $rootScope, $templateCache) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            state = $state;
            $templateCache.put('src/app/node/root.tpl.html', '');
            $templateCache.put('src/app/node/index.tpl.html', '');
            $templateCache.put('src/app/node/detail.tpl.html', '');
            nodeServiceMock = {
                getAllNodes: function () {
                    // TODO: rewrite this test
                    var deferred = $q.defer();
                    deferred.resolve(
                        {
                            'nodes': {
                                'node': [{
                                    'id': 'node1',
                                }],
                            },
                        }
                    );
                    return deferred.promise;
                },
                getCurrentData: function () {
                    return null;
                },
                getNode: function (id) {
                    var deferred = $q.defer();
                    deferred.resolve({"node": [{"id": id}]});
                    return deferred.promise;
                }
            };
        }));

        it('should load the root states', angular.mock.inject(function ($controller) {
            var stateName = 'main.node';

            $controller('rootNodeCtrl', {$scope: scope, $state: state});
            expect(state.href(stateName, {})).toBe('#/node');
        }));


        it('should call get Nodes', angular.mock.inject(function ($controller, $q) {
            var stateName = 'main.node.index';

            spyOn(nodeServiceMock, 'getAllNodes').andCallThrough();
            $controller('allNodesCtrl', {$scope: scope, $state: state, NodeInventorySvc: nodeServiceMock});
            rootScope.$digest();

            expect(state.href(stateName, {})).toBe('#/node/index');
            expect(nodeServiceMock.getAllNodes).toHaveBeenCalled();
            expect(scope.data[0].id).toBe('node1');
        }));

        it("ensure node connector link works using existing Data", angular.mock.inject(function ($controller, $q) {
            nodeServiceMock.getCurrentData = function () {
                var deferred = $q.defer();
                deferred.resolve(
                    {
                        'nodes': {

                            'node': [
                                {
                                    'id': 2,
                                },
                                {
                                    'id': 3,
                                },
                            ],
                        },
                    }
                );

                return deferred.promise;
            };

            var stateName = 'main.node.detail';
            var stateParams = {nodeId: 2};
            spyOn(nodeServiceMock, 'getCurrentData').andCallThrough();
            $controller('nodeConnectorCtrl', {
                $scope: scope,
                $stateParams: stateParams,
                NodeInventorySvc: nodeServiceMock
            });
            rootScope.$digest();

            expect(state.href(stateName, stateParams)).toBe('#/node/%d/detail'.replace('%d', stateParams.nodeId));
            expect(nodeServiceMock.getCurrentData).toHaveBeenCalled();
            expect(scope.data.id).toEqual(2);
        }));

        it("ensure node connector can be fetched separately", angular.mock.inject(function ($controller) {
            var stateName = 'main.node.detail';
            var stateParams = {nodeId: 3};
            spyOn(nodeServiceMock, 'getCurrentData').andCallThrough();
            spyOn(nodeServiceMock, 'getNode').andCallThrough();
            $controller('nodeConnectorCtrl', {
                $scope: scope,
                $stateParams: stateParams,
                NodeInventorySvc: nodeServiceMock
            });
            rootScope.$digest();

            expect(state.href(stateName, stateParams)).toBe('#/node/%d/detail'.replace('%d', stateParams.nodeId));
            expect(nodeServiceMock.getNode).toHaveBeenCalled();
            expect(scope.data.id).toEqual(3);
        }));
    });
});
