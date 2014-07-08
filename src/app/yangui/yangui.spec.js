/**
 * Copyright (c) 4.7.2014 Cisco.  All rights reserved.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */


describe( 'yangui', function() {
    var yinParser, nodeWrapper;
    
    beforeEach(angular.mock.module( 'console' ) );

    beforeEach( angular.mock.inject(function(_yinParser_, _nodeWrapper_) {
        yinParser = _yinParser_;
        nodeWrapper = _nodeWrapper_;
    }));

    describe( 'leafCtrl', function() {
        var leafCtrl, $scope;
        var parentBool, nodeBool, parentStr, nodeStr, parentInt, nodeInt;

        beforeEach( angular.mock.inject( function($controller, $rootScope ) {
            $scope = $rootScope.$new();
            leafCtrl = $controller( 'leafCtrl', {$scope: $scope });
            parentBool = yinParser.__test.yangParser.createNewNode('barrier', 'leaf', null);
            nodeBool = yinParser.__test.yangParser.createNewNode('boolean', 'type', parentBool);
            nodeWrapper.wrapAll(parentBool);

            parentStr = yinParser.__test.yangParser.createNewNode('barrier', 'leaf', null);      
            nodeStr = yinParser.__test.yangParser.createNewNode('string', 'type', parentStr);
            nodeWrapper.wrapAll(parentStr);

            parentInt = yinParser.__test.yangParser.createNewNode('barrier', 'leaf', null);      
            nodeInt = yinParser.__test.yangParser.createNewNode('uint32', 'type', parentInt);
            nodeWrapper.wrapAll(parentInt);
        }));
    });

    describe( 'containerCtrl', function() {
        var containerCtrl, $scope;
        var node;

        beforeEach( inject( function($controller, $rootScope ) {
            $scope = $rootScope.$new();
            
            node = yinParser.__test.yangParser.createNewNode('flows', 'container', null);
            nodeWrapper.wrapAll(node);
            
            $scope.node = node;
            containerCtrl = $controller( 'containerCtrl', {$scope: $scope });
        }));

        it( 'test toggleExpanded()', inject( function() {
            var expandedBefore = $scope.node.expanded;
            $scope.toggleExpanded();
            expect($scope.node.expanded).not.toBe(expandedBefore);
        }));

    });

    describe( 'caseCtrl', function() {
        var $scope;
        var node;

        beforeEach( inject( function($rootScope ) {
            $scope = $rootScope.$new();
            
            node = yinParser.__test.yangParser.createNewNode('write-metadata-case', 'case', null);
            nodeWrapper.wrapAll(node);
            
            $scope.node = node;
        }));

        it( 'test whether scope with 1 node is empty', inject( function($controller) {
            var caseCtrl = $controller( 'caseCtrl', {$scope: $scope });
            expect($scope.empty).toBe(true);
        }));

        it( 'test whether scope with one node and 1 child of this node is empty', inject( function($controller) {
            var nodeChild = yinParser.__test.yangParser.createNewNode('write-metadata', 'container', node);
            nodeWrapper.wrapAll(nodeChild);
            var caseCtrl = $controller( 'caseCtrl', {$scope: $scope });
            expect($scope.empty).toBe(true); 
        }));

        it( 'test whether scope with one node and 1 child with other children of this node is empty', inject( function($controller) {
            var nodeChild1 = yinParser.__test.yangParser.createNewNode('write-metadata', 'container', node);
            var nodeChild2 = yinParser.__test.yangParser.createNewNode('metadata', 'leaf', nodeChild1);
            var nodeChild3 = yinParser.__test.yangParser.createNewNode('uint64', 'type', nodeChild2);
            nodeWrapper.wrapAll(nodeChild1);
            var caseCtrl = $controller( 'caseCtrl', {$scope: $scope });
            expect($scope.empty).toBe(false); 
        }));

    });

    describe( 'listCtrl', function() {
        var node, $scope; 
        
        beforeEach(angular.mock.inject( function($rootScope ) {
            $scope = $rootScope.$new();
            var node = yinParser.__test.yangParser.createNewNode('instruction', 'list', null);
            nodeWrapper.wrapAll(node);
            $scope.node = node;
        }));

        it( 'test setActElement', inject( function($controller) {
            var myNode = yinParser.__test.yangParser.createNewNode('order', 'leaf', node);
            nodeWrapper.wrapAll(myNode);
            var listCtrl = $controller( 'listCtrl', {$scope: $scope });
            $scope.setActElement(myNode);
            expect($scope.node.actElement).toEqual(myNode);
        }));

        it( 'test addListElem', inject( function($controller) {
            var listCtrl = $controller( 'listCtrl', {$scope: $scope });
            $scope.addListElem();
            expect($scope.node.actElement).not.toBe(null);
            expect($scope.node.needAddNewListElem).toBeFalsy();
            expect($scope.node.listElems.length).toBeGreaterThan(0);
        }));

        it( 'test removeListElem', inject( function($controller) {
            var listCtrl = $controller( 'listCtrl', {$scope: $scope });
            $scope.addListElem();
            var myNode = $scope.node.actElement;
            $scope.removeListElem(myNode);
            expect($scope.node.actElement).toBe(null);
            expect($scope.node.listElems.length).toBe(0);
        }));

        it( 'test isElemActive', inject( function($controller) {
            var listCtrl = $controller( 'listCtrl', {$scope: $scope });
            $scope.addListElem();
            var actElem = $scope.node.actElement;
            expect($scope.isElemActive(actElem)).toEqual('active');
            expect($scope.isElemActive($scope.node)).toEqual('');
        }));
    });

    describe('yanguiCtrl', function() {
        var $httpBackend, myCtrl, $scope, $timeout, Restangular, yangUtils,
            mockModules, mockNodes, mA, mB, mC;
        
        var createModulesResponse = function createModulesResponse(ctrlCreatedModules) {
            $httpBackend.when('GET', 'http://localhost:8080/restconf/modules').respond(function(method, url, data, headers){
                                                                                        if(ctrlCreatedModules) {
                                                                                            return [200, mockModules, {}];
                                                                                        } else {
                                                                                            ctrlCreatedModules = true;
                                                                                            return [200, {modules: {module: []}}, {}];
                                                                                        }
                                                                                    });
        };

        var createNodesResponse = function createNodesResponse(ctrlCreatedNodes) {
            $httpBackend.when('GET', 'http://localhost:8080/restconf/operational/opendaylight-inventory:nodes').respond(function(method, url, data, headers){
                                                                                                                            if(ctrlCreatedNodes) {
                                                                                                                                return [200, mockNodes, {}];
                                                                                                                            } else {
                                                                                                                                ctrlCreatedNodes = true;
                                                                                                                                return [200, {nodes: {node: []}}, {}];
                                                                                                                            }
                                                                                                                        });
        };

        var createEmptyCtrl = function createEmptyCtrl(controller) {
            $httpBackend.when('GET', 'assets/data/locale-en_US.json').respond({});
            createModulesResponse(false);
            createNodesResponse(false);
            myCtrl = controller('yanguiCtrl', {$scope : $scope, $http : $httpBackend, $timeout: $timeout, Restangular : Restangular, yangUtils : yangUtils});
            $httpBackend.flush();
        };
        
        beforeEach(angular.mock.inject( function($controller, $rootScope, _$timeout_, _$httpBackend_, _Restangular_, _yangUtils_) {
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            Restangular = _Restangular_;
            $scope = $rootScope.$new();
            yangUtils = _yangUtils_;

            mockModules = {
                modules: {
                    module: [
                        { 'name': 'MA'},
                        { 'name': 'MB'},
                        { 'name': 'MC'}
                    ]
                }
            };

            mA = '<module name="MA">' +
                 '   <leaf name="LA"></leaf>' +
                 '</module>';
            mB = '<module name="MB">' +
                 '   <leaf name="LB"></leaf>' +
                 '</module>';
            mC = '<module name="MC">' +
                 '   <leaf name="LC"></leaf>' +
                 '</module>';

            mockNodes = {
                nodes: {
                    node: [
                        { 'id': 'id1'},
                        { 'id': 'id2'},
                        { 'id': 'id3'},
                        { 'id': 'id4'}
                    ]
                }
            };

            createEmptyCtrl($controller);
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('Test for loadModules()', inject( function() {

            createModulesResponse(true);
            //Need to mock individual calls to assets/yang2xml/*.yang.xml files
            $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
            $httpBackend.when('GET', './assets/yang2xml/MB.yang.xml').respond(mB);
            $httpBackend.when('GET', './assets/yang2xml/MC.yang.xml').respond(mC);

            $scope.__test.loadModules();
            $httpBackend.flush();
            expect($scope.nodeModules.length).toBe(3);
        }));

        it('Test for loadNodes()', inject( function() {
            createNodesResponse(true);

            $scope.__test.loadNodes();
            $httpBackend.flush();
            expect($scope.devices.length).toBe(4);
        }));
        
        it('Test for loadFlows() - extra', function(){

            var mockNode = {
                            "node": [
                                {
                                    "flow-node-inventory:table": [
                                        {
                                            "flow-node-inventory:id": 2,
                                            "flow-node-inventory:flow": [
                                                {
                                                    "flow-node-inventory:id": "124",
                                                    "flow-node-inventory:match": {
                                                        "flow-node-inventory:ipv4-destination": "10.0.0.1/24",
                                                        "flow-node-inventory:ethernet-match": {
                                                            "flow-node-inventory:ethernet-type": {
                                                                "flow-node-inventory:type": 2048
                                                            }
                                                        }
                                                    },
                                                    "flow-node-inventory:priority": 2,
                                                    "flow-node-inventory:out_port": 10,
                                                    "flow-node-inventory:flags": "FlowModFlags [_cHECKOVERLAP=false, _rESETCOUNTS=false, _nOPKTCOUNTS=false, _nOBYTCOUNTS=false, _sENDFLOWREM=false]",
                                                    "flow-node-inventory:table_id": 2,
                                                    "flow-node-inventory:barrier": false,
                                                    "flow-node-inventory:strict": false,
                                                    "flow-node-inventory:out_group": 2,
                                                    "flow-node-inventory:cookie_mask": 10,
                                                    "flow-node-inventory:instructions": {
                                                        "flow-node-inventory:instruction": [
                                                            {
                                                                "flow-node-inventory:write-metadata": {
                                                                    "flow-node-inventory:metadata-mask": 12,
                                                                    "flow-node-inventory:metadata": 10
                                                                },
                                                                "flow-node-inventory:order": 0
                                                            }
                                                        ]
                                                    },
                                                    "flow-node-inventory:installHw": false,
                                                    "flow-node-inventory:cookie": 10,
                                                    "flow-node-inventory:flow-name": "flow-instruction-write-metadata"
                                                }
                                            ]
                                        }
                                    ],
                                    "id": "openflow:1"
                                }
                            ]
                        };

            var flows = [
                            {
                                table : 2,
                                flow: '124',
                                label: 'table:2 > flow:124'
                            }
                        ];

            $scope.selDevice = 'x';

            $scope.__test.loadFlows();

            $httpBackend.expectGET('http://localhost:8080/restconf/config/opendaylight-inventory:nodes/node/x').respond(mockNode);
            $httpBackend.flush();

            expect($scope.flows[0].flow).toBe(flows[0].flow);
            expect($scope.flows[0].table).toBe(flows[0].table);
            expect($scope.flows[0].label).toBe(flows[0].label);
        });
        
        it ('Test for sendFlow()', angular.mock.inject(function() {
            $scope.selDevice = 'x';
            $scope.selModule = yinParser.__test.yangParser.createNewNode('flows','container',null);
            var nodeList = yinParser.__test.yangParser.createNewNode('flow','list',$scope.selModule);
            var nodeListItem = yinParser.__test.yangParser.createNewNode('id','leaf',nodeList);
            var nodeListItem2 = yinParser.__test.yangParser.createNewNode('table_id','leaf',nodeList);
            nodeWrapper.wrapAll($scope.selModule);
            nodeList.addListElem();

            nodeList.listElems[0].children[0].value = 1;
            nodeList.listElems[0].children[1].value = 2;

            // expect($scope.statusMsg).toBeUndefined();
            $httpBackend.expectPUT('http://localhost:8080/restconf/config/opendaylight-inventory:nodes/node/x/table/2/flow/1').respond({});
            $httpBackend.when('GET', 'http://localhost:8080/restconf/operational/opendaylight-inventory:nodes/node/x/table/2/flow/1').respond({});
            $scope.__test.sendFlow();
            
            $httpBackend.flush();

            // expect($scope.statusMsg).toBe('SEND_SUCCESS');
            $httpBackend.expectPUT('http://localhost:8080/restconf/config/opendaylight-inventory:nodes/node/x/table/2/flow/1').respond(500);
            $scope.__test.sendFlow();
            
            $httpBackend.flush();

            // expect($scope.statusMsg).toBe('SEND_ERROR');
        }));

        it('Test for deleteFlow()', function(){

            $scope.selDevice = 'x';
            $scope.selFlow = {
                    flow: 1,
                    table: 1
            };

            // TODO fix flush issue
            // $httpBackend.expectDELETE('http://localhost:8080/restconf/config/opendaylight-inventory:nodes/node/x/table/1/flow/1').respond({});
            // $scope.__test.deleteFlow();
            // $httpBackend.flush();

            // // expect($scope.statusMsg).toBe('SEND_SUCCESS');

            // $httpBackend.expectDELETE('http://localhost:8080/restconf/config/opendaylight-inventory:nodes/node/x/table/1/flow/1').respond(500);
            // $scope.__test.deleteFlow();
            // $httpBackend.flush();

            // expect($scope.statusMsg).toBe('SEND_ERROR');
        });

        it('test for $scope.fill()',  angular.mock.inject(function(){
            $scope.selFlow = {
                                table : 2,
                                flow: '124',
                                data:  {
                                    "flow-node-inventory:id": "124",
                                    "flow-node-inventory:table_id": 2
                                },
                                label: 'table:2 > flow:124'
                            };

            $scope.selModule = yinParser.__test.yangParser.createNewNode('flows','container',null);
            var nodeList = yinParser.__test.yangParser.createNewNode('flow','list',$scope.selModule);
            var nodeListItem = yinParser.__test.yangParser.createNewNode('id','leaf',nodeList);
            var nodeListItem2 = yinParser.__test.yangParser.createNewNode('table_id','leaf',nodeList);
            nodeWrapper.wrapAll($scope.selModule);

            $scope.fill();

            expect(nodeList.listElems.length).toBe(1);
            expect(nodeList.listElems[0].children.length).toBe(2);
            expect(nodeList.listElems[0].children[0].value).toBe('124');
            expect(nodeList.listElems[0].children[1].value).toBe(2);
        }));

        it('test for $scope.preview()', angular.mock.inject(function(){
            $scope.selFlow = {
                                data:  {
                                    "flow-node-inventory:id": "124",
                                    "flow-node-inventory:table_id": 2
                                }
                            };

            $scope.selModule = yinParser.__test.yangParser.createNewNode('flows','container',null);
            var nodeList = yinParser.__test.yangParser.createNewNode('flow','list',$scope.selModule);
            var nodeListItem = yinParser.__test.yangParser.createNewNode('id','leaf',nodeList);
            var nodeListItem2 = yinParser.__test.yangParser.createNewNode('table_id','leaf',nodeList);
            nodeWrapper.wrapAll($scope.selModule);

            var data = {'flow-node-inventory:flow': [$scope.selFlow.data]},
                name = 'flow-node-inventory:flows';
            
            $scope.selModule.clear();
            $scope.selModule.fill(name, data); 

            $scope.showPreview = true;
            $scope.preview();
            expect($scope.previewVisible.length).toBeGreaterThan(0);

            $scope.showPreview = false;
            $scope.preview();
            expect($scope.previewVisible).toBe(false);

        }));

    });
});
