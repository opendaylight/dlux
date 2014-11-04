/**
 * Copyright (c) 4/7/2014 Cisco and others. All rights reserved.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 * 
 * UNIT TESTING FILE FOR YANGUTILS.JS
 * 
 */

define(['common/yangutils/yangutils.module', 'common/config/env.module'], function() {

    describe('app.common.yangUtils', function(){

        var propertiesEqual = function(a, b) {
            var excludedTypes = ['array']; //TODO rework?

            var aProps = Object.keys(a).filter(function(i) {
                return excludedTypes.indexOf(typeof a[i]) === -1;
            });

            for(var index in aProps) {
                var prop = aProps[index];
                expect(a.hasOwnProperty(prop) && b.hasOwnProperty(prop)).toBe(true);

                var aPropToTest = (a[prop] ? a[prop].toString(): null),
                    bPropToTest = (b[prop] ? b[prop].toString(): null);

                expect(aPropToTest).toBe(bPropToTest);
            }
        };

        var childrenEqual = function(a, b) {
            expect(a.children.length).toBe(b.children.length);

            for(var i = 0; i < a.children.length; i++) {
                nodesEqual(a.children[i], b.children[i]);
            }
        };

        var nodesEqual = function(a, b) {
            expect(Object.keys(a).length).toBe(Object.keys(b).length);

            try {
                propertiesEqual(a, b);
                childrenEqual(a, b);
            } catch (e) {
                console.warn('copy testing ',e.message);
            }
        };

        var constants;
        beforeEach(angular.mock.module('config'));
        beforeEach(angular.mock.module('restangular'));
        beforeEach(angular.mock.module('app.common.yangUtils'));
    
        beforeEach(function() {
            angular.mock.inject(function(_constants_) {
                constants = _constants_;
            });
        });

        describe('custFunct', function(){

            var custFunct, yinParser, yangParser;

            beforeEach(function(){
                angular.mock.inject(function(_custFunct_, _yinParser_){
                    custFunct = _custFunct_;
                    yinParser = _yinParser_;

                });

                yangParser = yinParser.__test.yangParser;
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
            });

            it('createNewFunctionality', function(){
                var node = yangParser.createNewNode('flows','leaf', null, constants.NODE_UI_DISPLAY),
                    dummyValue = false,
                    customFunctionality = custFunct.createNewFunctionality('test', node, function(){
                        dummyValue = true;
                    });

                expect(dummyValue).toBe(false);
                customFunctionality.runCallback();
                expect(dummyValue).toBe(true);
                expect(customFunctionality.label).toBe('test');
                expect(angular.isFunction(customFunctionality.callback)).toBe(true);
                expect(angular.isFunction(customFunctionality.runCallback)).toBe(true);
                expect(angular.isFunction(customFunctionality.setCallback)).toBe(true);
                dummyValue = false;
                customFunctionality.setCallback(null);
                customFunctionality.runCallback();
                expect(dummyValue).toBe(false);

                customFunctionality = custFunct.createNewFunctionality('test');
                expect(customFunctionality).toBe(undefined);
            });

        });

        describe('reqBuilder', function() {

            var reqBuilder, testObject, testListArray;

            beforeEach(function() {

                    angular.mock.inject(function(_reqBuilder_) {
                        reqBuilder = _reqBuilder_;
                    });
            });

            it('createList', function() {
                expect(angular.isFunction(reqBuilder.createList)).toBe(true);
            });

            it('insertObjToList', function() {
                testObject = reqBuilder.createObj();
                testListArray = reqBuilder.createList();

                expect(testListArray.length).toBe(0);
                reqBuilder.insertObjToList(testListArray, testObject);
                expect(testListArray[0]).toBe(testObject);

            });

            it('insertPropertyToObj', function() {

                var testProperty = 'testProp';
                var testValue = 'testValue';

                expect(testObject[testProperty]).toBeUndefined();
                reqBuilder.insertPropertyToObj(testObject, testProperty, testValue);
                expect(testObject[testProperty]).toBe(testValue);
                reqBuilder.insertPropertyToObj(testObject, testProperty);
                expect($.isEmptyObject(testObject[testProperty])).toBe(true);
            });

            it('resultToString ', function() {

                var stringJSON = reqBuilder.resultToString(testObject);
                var isValidJSON = true;

                try {
                    JSON.parse(stringJSON);
                } catch (e) {
                    isValidJSON = false;
                }

                expect(isValidJSON).toBe(true);

            });

        });

        describe('restrictionsFact', function() {
            var restrictionsFact;

            beforeEach(function() {
                angular.mock.inject(function(_restrictionsFact_) {
                    restrictionsFact = _restrictionsFact_;
                });
            });

            it('getEqualsFnc', function(){
                var eqVal = 5,
                    testFnc = restrictionsFact.getEqualsFnc(eqVal);

                expect(angular.isFunction(testFnc.check)).toBe(true);
                expect(testFnc.check(eqVal)).toBe(true);
                expect(testFnc.check(eqVal+1)).toBe(false);

            });

            it('getMinMaxFnc', function(){
                var minVal = 5,
                    delta = 100,
                    testFnc = restrictionsFact.getMinMaxFnc(minVal, minVal+delta);

                expect(angular.isFunction(testFnc.check)).toBe(true);
                expect(testFnc.check(minVal+delta/2)).toBe(true);
                expect(testFnc.check(minVal+delta+1)).toBe(false);

            });

            it('getReqexpValidationFnc', function(){
                var patternStr = 'A',
                    testFnc = restrictionsFact.getReqexpValidationFnc(patternStr);

                expect(angular.isFunction(testFnc.check)).toBe(true);
                expect(testFnc.check('ABC')).toBe(true);
                expect(testFnc.check('XYZ')).toBe(false);
            });
        });

        describe('yangUtils', function() {

            var yangUtils, yinParser, nodeWrapper, $httpBackend, $timeout, apiConnector, yangParser, reqBuilder;

            beforeEach(function() {

                angular.mock.inject(function(_yangUtils_) {
                    yangUtils = _yangUtils_;
                });

                angular.mock.inject(function(_yinParser_) {
                    yinParser = _yinParser_;
                });

                angular.mock.inject(function(_nodeWrapper_) {
                    nodeWrapper = _nodeWrapper_;
                });

                angular.mock.inject(function(_$httpBackend_) {
                    $httpBackend = _$httpBackend_;
                });

                angular.mock.inject(function(_$timeout_) {
                    $timeout = _$timeout_;
                });

                angular.mock.inject(function(_apiConnector_) {
                    apiConnector = _apiConnector_;
                });

                angular.mock.inject(function(_reqBuilder_) {
                    reqBuilder = _reqBuilder_;
                });

                yangParser = yinParser.__test.yangParser;
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
            });

            it('getRequestString', function(){
                var node = yangParser.createNewNode('ports','leaf', null, constants.NODE_UI_DISPLAY),
                    reqStr,
                    isValidJSON = true,
                    jsonData;

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(yangUtils.getRequestString)).toBe(true);
                node.value = 'dummyValue';
                reqStr = yangUtils.getRequestString(node);

                try {
                    jsonData = JSON.parse(reqStr);
                } catch (e) {
                    isValidJSON = false;
                }

                expect(isValidJSON).toBe(true);
                expect(jsonData.ports).toBe('dummyValue');

                node.value = '';

                reqStr = yangUtils.getRequestString(node);
                expect(reqStr).toBe('');
            });

            it('processModules', function(){
                var modules = {module: [{ 'name': 'MA'}, { 'name': 'MB'}, { 'name': 'MC'}, { 'name': 'MD'}]},
                    mA = '<module name="MA">' +
                         '   <leaf name="LA"></leaf>' +
                         '   <container name="CA"></container>' +
                         '</module>',
                    mB = '<module name="MB">' +
                         '</module>',
                    mC = '<module name="MC">' +
                         '   <import module="MA">' +
                         '      <prefix value="MApref"/>' +
                         '   </import>' +
                         '   <import module="MB">' +
                         '      <prefix value="MBpref"/>' +
                         '   </import>' +
                         '   <leaf name="LC"></leaf>' +
                         '   <augment target-node="/MApref:CA">' +
                         '       <leaf name="LAUG1"></leaf>' +
                         '   </augment>' +
                         '   <augment target-node="/MBpref:CA">' +
                         '       <leaf name="LAUG2"></leaf>' +
                         '   </augment>' +
                         '</module>',
                    nodes = [];

                $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
                $httpBackend.when('GET', './assets/yang2xml/MB.yang.xml').respond(mB);
                $httpBackend.when('GET', './assets/yang2xml/MC.yang.xml').respond(mC);
                $httpBackend.when('GET', './assets/yang2xml/MD.yang.xml').respond(404);

                yangUtils.processModules(modules, function(loadedNodes) {
                    nodes = loadedNodes;
                });
                $httpBackend.flush();
                $timeout.flush();

                expect(nodes.length).toBe(3);
                expect(nodes[1].children.length).toBe(1);
            });

            it('generateNodesToApis', function(){
                var hostPort = 'http://localhost:8080',
                    baseUrl = hostPort+'/restconf',
                    modules = {modules: {module: [{ 'name': 'MA'}, { 'name': 'MB'}, { 'name': 'MC'}]}},
                    mA = '<module name="MA">' +
                         '   <leaf name="LA"></leaf>' +
                         '</module>',
                    mB = '<module name="MB">' +
                         '   <leaf name="LB"></leaf>' +
                         '</module>',
                    mC = '<module name="MC">' +
                         '   <leaf name="LC"></leaf>' +
                         '</module>',
                    apis =  {apis: [{path: hostPort+'/apidoc/apis/MA(rev1)'},
                                    {path: hostPort+'/apidoc/apis/MB(rev2)'}]},
                    apiA = {
                        baseUrl: baseUrl,
                        apis: [
                            {
                                path: '/config/MA:LA/',
                                operations: [ {method: 'GET' }, {method: 'PUT' }]
                            }
                        ]
                    },
                    apiB = {
                        baseUrl: baseUrl,
                        apis: [
                            {
                                path: '/config/MB:LB/',
                                operations: [ {method: 'GET' }, {method: 'DELETE' }]
                            }
                        ]
                    },
                    loadedNodes = [],
                    loadedApis = [];

                $httpBackend.when('GET', hostPort+'/apidoc/apis/').respond(apis);
                $httpBackend.when('GET', hostPort+'/apidoc/apis/MA(rev1)').respond(apiA);
                $httpBackend.when('GET', hostPort+'/apidoc/apis/MB(rev2)').respond(apiB);
                $httpBackend.when('GET', baseUrl+'/modules/').respond(modules);
                $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
                $httpBackend.when('GET', './assets/yang2xml/MB.yang.xml').respond(mB);
                $httpBackend.when('GET', './assets/yang2xml/MC.yang.xml').respond(mC);

                yangUtils.generateNodesToApis(function(apis, nodes) {
                    loadedApis = apis;
                    loadedNodes = nodes;
                }, function() {

                });

                $httpBackend.flush();
                $timeout.flush();
                $timeout.flush();

                expect(loadedApis.length).toBe(2);
                expect(loadedNodes.length).toBe(3);
            });

            it('generateNodesToApis - Http error', function(){
                var hostPort = 'http://localhost:8080',
                    baseUrl = hostPort+'/restconf',
                    loadedNodes = [],
                    loadedApis = [];

                $httpBackend.when('GET', hostPort+'/apidoc/apis/').respond(404);
                $httpBackend.when('GET', baseUrl+'/modules/').respond(404);

                yangUtils.generateNodesToApis(function(apis, nodes) {
                    loadedApis = apis;
                    loadedNodes = nodes;
                }, function() {});

                $httpBackend.flush();
                $timeout.flush();

                expect(loadedApis.length).toBe(0);
                expect(loadedNodes.length).toBe(0);
            });

            it('generateNodesToApis - exception error', function(){
                var hostPort = 'http://localhost:8080',
                    baseUrl = hostPort+'/restconf',
                    errorCallbackCalled = false;

                $httpBackend.when('GET', hostPort+'/apidoc/apis/').respond(404);
                $httpBackend.when('GET', baseUrl+'/modules/').respond(404);

                expect(function() { 
                    yangUtils.generateNodesToApis('error', function() {
                        errorCallbackCalled = true;
                    });
                    $httpBackend.flush();
                    $timeout.flush();
                }).toThrow();

                expect(errorCallbackCalled).toBe(true);
            });

            //commented api validation tests until it's fixed in lithium or implemented more reliable method
             describe('generateApiTreeData', function(){

                var subApiPathA, subApiPathB, dataTree, responseDummyData, apis, nodeType, yangParser;

                beforeEach(function(){
                    subApiPathA = '/config/MA:LA/{id}/';
                    subApiPathB = '/config/MA:LB/';
                    nodeType = constants.NODE_UI_DISPLAY;
                    yangParser = yinParser.__test.yangParser;

                    subApiA = new apiConnector.__test.SubApi(subApiPathA, ['GET']);
                    subApiB = new apiConnector.__test.SubApi(subApiPathB, ['PUT']);

                    responseDummyData = {
                        data: true
                    };

                    apis = [
                        {
                            module: 'MA',
                            revision: 'rev1',
                            basePath: 'dummyPath',
                            subApis : [subApiA, subApiB]
                        },
                        {
                            module: 'MA',
                            revision: 'rev2',
                            basePath: 'dummyPath',
                            subApis : []
                        }
                    ];
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('MA', 'R', 'NS'));
                });

                it('general', function(){

                    var nodeMA = yangParser.createNewNode('LA','leaf', null, nodeType),
                        nodeMB = yangParser.createNewNode('LB','leaf', null, nodeType);

                    nodeWrapper.wrapAll(nodeMA);
                    nodeWrapper.wrapAll(nodeMB);

                    apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                    // $httpBackend.when('PUT', 'dummyPath/config/MA:LB').respond(responseDummyData);

                    yangUtils.generateApiTreeData(apis, function(treeApis) {
                        dataTree = treeApis;
                        
                        expect(dataTree.length).toBe(2);
                        expect(dataTree[0].children.length).toBe(1);
                        expect(dataTree[0].children[0].children.length).toBe(2);
                        expect(dataTree[0].label).toBe('MA rev.rev1');
                        expect(dataTree[0].children[0].label).toBe('config');
                        expect(dataTree[0].children[0].children[0].identifier).toBe(' {id}');

                    });

                    // $httpBackend.flush();
                    // $timeout.flush();

                    
                });

                // it('list && leaves', function(){

                //     var nodeMA = yangParser.createNewNode('LA','leaf', null, nodeType),
                //         nodeMB = yangParser.createNewNode('LB','list', null, nodeType),
                //         nodeMC = yangParser.createNewNode('LC','leaf', nodeMB, nodeType);
                    
                //     nodeWrapper.wrapAll(nodeMA);
                //     nodeWrapper.wrapAll(nodeMB);
                //     nodeMB.addListElem();

                //     apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                //     $httpBackend.when('PUT', 'dummyPath/config/MA:LB').respond(responseDummyData);

                //     yangUtils.generateApiTreeData(apis, function(treeApis) {
                //         dataTree = treeApis;

                //         // console.log('dataTree',dataTree);
                //         var checkNode = apis[dataTree[0].children[0].children[1].indexApi].subApis[dataTree[0].children[0].children[1].indexSubApi].node;
                //         // console.log('checkNode',checkNode);

                //         expect(dataTree[0].children.length).toBe(1);
                //         expect(dataTree[0].children[0].children.length).toBe(2);
                //         expect(dataTree[0].label).toBe('MA rev.rev1');
                //         expect(dataTree[0].children[0].label).toBe('config');
                //         expect(checkNode.actElemStructure.children[0].value).toBe('0');

                //     });

                //     $httpBackend.flush();
                //     $timeout.flush();

                // });

                // it('non list && leaves', function(){

                //     var nodeMA = yangParser.createNewNode('LA','leaf', null, nodeType),
                //         nodeMB = yangParser.createNewNode('LB','container', null, nodeType),
                //         nodeMC = yangParser.createNewNode('LC','leaf', nodeMB, nodeType);
                    
                //     nodeWrapper.wrapAll(nodeMA);
                //     nodeWrapper.wrapAll(nodeMB);

                //     apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                //     $httpBackend.when('PUT', 'dummyPath/config/MA:LB').respond(responseDummyData);

                //     yangUtils.generateApiTreeData(apis, function(treeApis) {
                //         dataTree = treeApis;

                //         // console.log('dataTree',dataTree);
                //         var checkNode = apis[dataTree[0].children[0].children[1].indexApi].subApis[dataTree[0].children[0].children[1].indexSubApi].node;
                //         // console.log('checkNode',checkNode);

                //         expect(dataTree[0].children.length).toBe(1);
                //         expect(dataTree[0].children[0].children.length).toBe(2);
                //         expect(dataTree[0].label).toBe('MA rev.rev1');
                //         expect(dataTree[0].children[0].label).toBe('config');
                //         expect(checkNode.children[0].value).toBe('0');

                //     });

                //     $httpBackend.flush();
                //     $timeout.flush();

                // });

                // it('list && non leaves', function(){

                //     var nodeMA = yangParser.createNewNode('LA','leaf', null, nodeType),
                //         nodeMB = yangParser.createNewNode('LB','list', null, nodeType),
                //         nodeMC = yangParser.createNewNode('LC','container', nodeMB, nodeType);
                //         nodeMD = yangParser.createNewNode('LD','leaf', nodeMC, nodeType);
                    
                //     nodeWrapper.wrapAll(nodeMA);
                //     nodeWrapper.wrapAll(nodeMB);
                //     nodeMB.addListElem();

                //     apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                //     $httpBackend.when('PUT', 'dummyPath/config/MA:LB').respond(responseDummyData);

                //     yangUtils.generateApiTreeData(apis, function(treeApis) {
                //         dataTree = treeApis;

                //         // console.log('dataTree',dataTree);
                //         var checkNode = apis[dataTree[0].children[0].children[1].indexApi].subApis[dataTree[0].children[0].children[1].indexSubApi].node;
                //         // console.log('checkNode',checkNode);

                //         expect(dataTree[0].children.length).toBe(1);
                //         expect(dataTree[0].children[0].children.length).toBe(2);
                //         expect(dataTree[0].label).toBe('MA rev.rev1');
                //         expect(dataTree[0].children[0].label).toBe('config');
                //         expect(checkNode.actElemStructure.children[0].children[0].value).toBe('0');

                //     });

                //     $httpBackend.flush();
                //     $timeout.flush();

                // });

                // it('non list && non leaves', function(){

                //     var nodeMA = yangParser.createNewNode('LA','leaf', null, nodeType),
                //         nodeMB = yangParser.createNewNode('LB','container', null, nodeType),
                //         nodeMC = yangParser.createNewNode('LC','container', nodeMB, nodeType),
                //         nodeMD = yangParser.createNewNode('LD','list', nodeMC, nodeType),
                //         nodeME = yangParser.createNewNode('LE','leaf', nodeMD, nodeType);
                    
                //     nodeWrapper.wrapAll(nodeMA);
                //     nodeWrapper.wrapAll(nodeMB);
                //     nodeMD.addListElem();

                //     apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                //     $httpBackend.when('PUT', 'dummyPath/config/MA:LB').respond(responseDummyData);

                //     yangUtils.generateApiTreeData(apis, function(treeApis) {
                //         dataTree = treeApis;

                //         // console.log('dataTree',dataTree);
                //         var checkNode = apis[dataTree[0].children[0].children[1].indexApi].subApis[dataTree[0].children[0].children[1].indexSubApi].node;
                //         // console.log('checkNode',checkNode);

                //         expect(dataTree[0].children.length).toBe(1);
                //         expect(dataTree[0].children[0].children.length).toBe(2);
                //         expect(dataTree[0].label).toBe('MA rev.rev1');
                //         expect(dataTree[0].children[0].label).toBe('config');
                //         expect(checkNode.children[0].children[0].actElemStructure.children[0].value).toBe('0');

                //     });

                //     $httpBackend.flush();
                //     $timeout.flush();

                // });

                // it('non response', function(){

                //     var nodeMA = yangParser.createNewNode('LA','leaf', null, nodeType),
                //         nodeMB = yangParser.createNewNode('LB','list', null, nodeType),
                //         nodeMC = yangParser.createNewNode('LC','leaf', nodeMB, nodeType);
                    
                //     nodeWrapper.wrapAll(nodeMA);
                //     nodeWrapper.wrapAll(nodeMB);
                //     nodeMB.addListElem();

                //     apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                //     $httpBackend.when('PUT', 'dummyPath/config/MA:LB').respond(401,'error');

                //     yangUtils.generateApiTreeData(apis, function(treeApis) {
                //         dataTree = treeApis;

                //         // console.log('dataTree',dataTree);
                //         expect(dataTree.length).toBe(0);

                //     });

                //     $httpBackend.flush();
                //     $timeout.flush();

                // });

            });

            it('transformTopologyData', function(){
                var testData = {
                        'network-topology': {
                            'topology': [{
                                'id': 'dummyID1',
                                'node': [
                                    {
                                        'node-id': 'A'
                                    },
                                    {
                                        'node-id': 'B'
                                    }
                                ],
                                'link': [
                                    {
                                        source: {
                                            'source-node': 'A',
                                            'source-tp': 'TP1'
                                        },
                                        destination: {
                                            'dest-node': 'B',
                                            'dest-tp': 'TP2'
                                        }
                                    },
                                    {
                                        source: {
                                            'source-node': 'A',
                                            'source-tp': 'TP3'
                                        },
                                        destination: {
                                            'dest-node': 'C',
                                            'dest-tp': 'TP4'
                                        }
                                    }
                                ]
                            }]
                        }
                    },
                    blankData = {
                        'network-topology': {
                            'topology': [{
                                'id': 'dummyID2'
                            }]
                        }
                    },
                    blankData2 = {},
                    topoData;

                topoData = yangUtils.transformTopologyData(blankData);
                expect(topoData.nodes.length).toBe(0);
                expect(topoData.links.length).toBe(0);

                topoData = yangUtils.transformTopologyData(testData);
                expect(topoData.nodes.length).toBe(2);
                expect(topoData.links.length).toBe(2);

                topoData = yangUtils.transformTopologyData(blankData2);
                expect(topoData.nodes.length).toBe(0);
                expect(topoData.links.length).toBe(0);
            });

        });

        describe('apiConnector', function(){

            var apiConnector, pathUtils, yinParser, $httpBackend, $timeout, yangParser;

            beforeEach(function() {
                angular.mock.inject(function(_apiConnector_) {
                    apiConnector = _apiConnector_;
                });

                angular.mock.inject(function(_pathUtils_) {
                    pathUtils = _pathUtils_;
                });

                angular.mock.inject(function(_yinParser_) {
                    yinParser = _yinParser_;
                });

                angular.mock.inject(function(_$httpBackend_) {
                    $httpBackend = _$httpBackend_;
                });

                angular.mock.inject(function(_$timeout_) {
                    $timeout = _$timeout_;
                });

                yangParser = yinParser.__test.yangParser;
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
            });

            describe('SubApi', function() {
                var subApi;

                beforeEach(function() {
                    subApi = new apiConnector.__test.SubApi('/config/MA:LA/', ['GET', 'PUT']);
                });

                it('hasSetData', function(){
                    expect(subApi.hasSetData()).toBe(false);
                });

                it('setNode', function(){
                    var node = yangParser.createNewNode('N', 'T', null, 0);
                    subApi.setNode(node);
                    expect(subApi.node).toBe(node);
                });

                it('setPathArray', function(){
                    var pathArray = [new pathUtils.__test.PathElem('A1','MA'),
                                     new pathUtils.__test.PathElem('A2','MA'),
                                     new pathUtils.__test.PathElem('A3',null)];
                    subApi.setPathArray(pathArray);
                    expect(subApi.pathArray).toBe(pathArray);
                });

                it('buildApiRequestString', function(){
                    var pathArray = [new pathUtils.__test.PathElem('A1','MA'),
                                     new pathUtils.__test.PathElem('A2','MA'),
                                     new pathUtils.__test.PathElem('A3',null)];
                    subApi.setPathArray(pathArray);
                    expect(subApi.buildApiRequestString()).toBe('MA:A1/MA:A2/A3');
                });

                it('addCustomFunctionality', function(){
                    var fnc = function() {},
                        node = yangParser.createNewNode('N', 'T', null, 0);

                    subApi.setNode(node);

                    subApi.addCustomFunctionality('A');
                    expect(subApi.custFunct.length).toBe(0);

                    subApi.addCustomFunctionality('A', fnc);

                    expect(subApi.custFunct.length).toBe(1);
                    expect(subApi.custFunct[0].callback).toBe(fnc);
                });
            });

            it('apiPathElemsToString', function(){
                var pathElems = [],
                    expectedStr = 'MA:A1/MA:A2/A3';

                pathElems.push(new pathUtils.__test.PathElem('A1','MA'));
                pathElems.push(new pathUtils.__test.PathElem('A2','MA'));
                pathElems.push(new pathUtils.__test.PathElem('A3',null));

                expect(apiConnector.__test.apiPathElemsToString(pathElems)).toBe(expectedStr);
            });

            it('parseApiPath', function(){
                var module = 'M',
                    revision = 'R',
                    apiPath = 'dummyText1/dummyText2:dummyText3/'+module+'('+revision+')';

                data = apiConnector.__test.parseApiPath(apiPath);
                expect(data.module).toBe(module);
                expect(data.revision).toBe(revision);
            });

            it('getRootNodeByPath', function(){
                var nodeList = [],
                    module = 'M',
                    label = 'L',
                    type = 'T',
                    nodeType = 0;

                yangParser.setCurrentModuleObj(new yinParser.__test.Module(module, 'R', 'NS'));
                
                var expectedNode = yangParser.createNewNode(label, type, null, nodeType);
                nodeList.push(yangParser.createNewNode(label+'1', type, null, nodeType));
                yangParser.setCurrentModuleObj(new yinParser.__test.Module((module+1).toString(), 'R', 'NS'));
                nodeList.push(yangParser.createNewNode(label, type, null, nodeType));
                yangParser.setCurrentModuleObj(new yinParser.__test.Module(module, 'R', 'NS'));
                nodeList.push(expectedNode);
                nodeList.push(yangParser.createNewNode(label+'2', type, null, nodeType));

                expect(apiConnector.__test.getRootNodeByPath('MX', label, nodeList)).toBe(null);
                expect(apiConnector.__test.getRootNodeByPath(module, label, nodeList)).toBe(expectedNode);
            });

            it('processApis', function(){
                var hostPort = 'localhost:8080',
                    baseUrl = hostPort+'/restconf',
                    apis =  [{path: hostPort+'/apidoc/apis/MA(rev1)'},
                             {path: hostPort+'/apidoc/apis/MB(rev2)'},
                             {path: hostPort+'/apidoc/apis/MC(rev3)'}],
                    apiA = {
                        baseUrl: baseUrl,
                        apis: [
                            {
                                path: '/config/MA:LA/',
                                operations: [ {method: 'GET' }, {method: 'PUT' }]
                            }
                        ]
                    },
                    apiB = {
                        baseUrl: baseUrl,
                        apis: [
                            {
                                path: '/config/MB:LB/',
                                operations: [ {method: 'GET' }, {method: 'DELETE' }]
                            }
                        ]
                    },
                    processedApis = [];

                $httpBackend.when('GET', hostPort+'/apidoc/apis/MA(rev1)').respond(apiA);
                $httpBackend.when('GET', hostPort+'/apidoc/apis/MB(rev2)').respond(apiB);
                $httpBackend.when('GET', hostPort+'/apidoc/apis/MC(rev3)').respond(404);

                apiConnector.processApis(apis, function(result) {
                    processApis = result;
                });

                $httpBackend.flush();
                $timeout.flush();

                expect(processApis.length).toBe(2);
                expect(processApis[0].subApis.length).toBe(1);
                expect(processApis[1].subApis.length).toBe(1);
            });

            it('linkApisToNodes', function(){
                var yangParser = yinParser.__test.yangParser,
                    type = 'leaf',
                    nodeType = 0,
                    subApi1 = new apiConnector.__test.SubApi('/config/MA:LA/{id}/MA:identifier/MA:node/{id}/', ['GET', 'PUT']),
                    subApi2 = new apiConnector.__test.SubApi('/config/MB:LB/', ['GET', 'DELETE']),
                    apis = [
                        {
                            module: 'MA',
                            revision: 'rev1',
                            subApis: [subApi1]
                        },
                        {
                            module: 'MB',
                            revision: 'rev2',
                            subApis: [subApi2]
                        }
                    ],
                    linkedApis = [],
                    nodes = [];

                yangParser.setCurrentModuleObj(new yinParser.__test.Module('MA', 'R', 'NS'));
                var nodeMA = yangParser.createNewNode('LA',type, null, nodeType),
                    nodeMAlist = yangParser.createNewNode('identifier','list', nodeMA, nodeType),
                    nodeMAleaf = yangParser.createNewNode('node','leaf', nodeMAlist, nodeType);
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('MB', 'R', 'NS'));
                var nodeMB = yangParser.createNewNode('LB',type, null, nodeType);

                nodes.push(nodeMA);
                nodes.push(nodeMB);

                linkedApis = apiConnector.linkApisToNodes(apis, nodes);

                expect(linkedApis[0].subApis[0].node).toBe(nodeMAleaf);
                expect(linkedApis[1].subApis[0].node).toBe(nodeMB);

                subApi1 = new apiConnector.__test.SubApi('/config/MA:LC/{id}/MA:identifier/MA:node/{id}/', ['GET', 'PUT']);
                apis = [
                        {
                            module: 'MA',
                            revision: 'rev1',
                            subApis: [subApi1]
                        }
                    ];
                
                linkedApis = apiConnector.linkApisToNodes(apis, nodes);
                expect(linkedApis[0].subApis.length).toBe(0);
            });

            it('createCustomFunctionalityApis', function(){
                var yangParser = yinParser.__test.yangParser,
                    type = 'leaf',
                    nodeType = 0,
                    subApi1 = new apiConnector.__test.SubApi('/config/MA:LA/', ['GET', 'PUT']),
                    subApi2 = new apiConnector.__test.SubApi('/config/MB:LB/', ['GET', 'DELETE']),
                    apis = [
                        {
                            module: 'MA',
                            revision: 'rev1',
                            subApis: [subApi1]
                        },
                        {
                            module: 'MB',
                            revision: 'rev2',
                            subApis: [subApi2]
                        }
                    ],
                    linkedApis = [],
                    nodes = [];

                yangParser.setCurrentModuleObj(new yinParser.__test.Module('MA', 'R', 'NS'));
                var nodeMA = yangParser.createNewNode('LA',type, null, nodeType);
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('MB', 'R', 'NS'));
                var nodeMB = yangParser.createNewNode('LB',type, null, nodeType);

                nodes.push(nodeMA);
                nodes.push(nodeMB);

                linkedApis = apiConnector.linkApisToNodes(apis, nodes);
                apiConnector.createCustomFunctionalityApis(linkedApis, 'MB', 'rev2', '/config/MB:LB/', 'FNC', function() {});
                expect(linkedApis[1].subApis[0].custFunct.length).toBe(1);
                apiConnector.createCustomFunctionalityApis(linkedApis, null, null, '/config/MB:LB/', 'FNC2', function() {});
                expect(linkedApis[1].subApis[0].custFunct.length).toBe(2);
                apiConnector.createCustomFunctionalityApis(linkedApis, 'MB', null, '/config/MA:LA/', 'FNC3', function() {});
                expect(linkedApis[0].subApis[0].custFunct.length).toBe(0);
                expect(linkedApis[1].subApis[0].custFunct.length).toBe(2);
            });
        });

        describe('nodeWrapper', function(){

            var propName = 'test:elementName',
                elemName = 'elementName',
                nodeWrapper, yinParser, reqBuilder, yangParser, typeWrapper;

            var reqsEqual = function(expected, builded) {
                expect(Object.keys(expected).length).toBe(Object.keys(builded).length);
                
                for(var prop in expected) {
                    if(expected[prop] instanceof Array) {
                        expect(builded[prop] instanceof Array).toBe(true);
                        expect(expected[prop].length).toBe(builded[prop].length);
                            
                        for(var index = 0; index < expected[prop].length; index++) {
                            reqsEqual(expected[prop][index], builded[prop][index]);
                        }
                    } else if (expected[prop] instanceof Object) {
                        expect(builded[prop] instanceof Object).toBe(true);
                        reqsEqual(expected[prop], builded[prop]);
                    } else {
                        expect(expected[prop]).toBe(builded[prop]);
                    }
                }
            };

            beforeEach(function() {

                angular.mock.inject(function(_nodeWrapper_) {
                    nodeWrapper = _nodeWrapper_;
                });

                angular.mock.inject(function(_yinParser_) {
                    yinParser = _yinParser_;
                });

                angular.mock.inject(function(_reqBuilder_) {
                    reqBuilder = _reqBuilder_;
                });

                angular.mock.inject(function(_typeWrapper_) {
                    typeWrapper = _typeWrapper_;
                });

                yangParser = yinParser.__test.yangParser;
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
            });

            it('comparePropToElemByName', function(){
                var compareResult;

                expect(angular.isFunction(nodeWrapper.__test.comparePropToElemByName)).toBe(true);
                compareResult = nodeWrapper.__test.comparePropToElemByName(propName, elemName);
                expect(compareResult).toBe(true);
                propName = 'test:test';
                compareResult = nodeWrapper.__test.comparePropToElemByName(propName, elemName);
                expect(compareResult).toBe(false);

            });

            it('equalArrays', function(){
                var arrA = [1, 'A'],
                    arrB = [1, 'A'],
                    arrC = [1, 'A', 2];
                    arrD = [1, 'B'];

                expect(nodeWrapper.__test.equalArrays(arrA, arrB)).toBe(true);
                expect(nodeWrapper.__test.equalArrays(arrB, arrA)).toBe(true);

                expect(nodeWrapper.__test.equalArrays(arrA, arrC)).toBe(false);
                expect(nodeWrapper.__test.equalArrays(arrC, arrA)).toBe(false);

                expect(nodeWrapper.__test.equalArrays(arrA, arrD)).toBe(false);
                expect(nodeWrapper.__test.equalArrays(arrD, arrA)).toBe(false);
            });

            it('equalListElems', function(){
                var dataA = {
                        'id': 1,
                        'name': 'A',
                        'attr': 'X'
                    },
                    dataB = {
                        'id': 1,
                        'name': 'A',
                        'attr': 'X'
                    },
                    dataC = {
                        'M:id': 1,
                        'M:name': 'A',
                        'attr': 'X'
                    },
                    dataD = {
                        'M:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    dataX = {
                        'attr':'X'
                    },
                    yangParser = yinParser.__test.yangParser,
                    refKey;

                refKey = [yangParser.createNewNode('id', 'dummy', null, 0), yangParser.createNewNode('name', 'dummy', null, 0)];

                expect(nodeWrapper.__test.equalListElems(dataA, dataB, refKey)).toBe(true);
                expect(nodeWrapper.__test.equalListElems(dataA, dataC, refKey)).toBe(true);
                expect(nodeWrapper.__test.equalListElems(dataA, dataD, refKey)).toBe(false);
                expect(nodeWrapper.__test.equalListElems(dataC, dataD, refKey)).toBe(false);
                expect(nodeWrapper.__test.equalListElems(dataC, dataX, refKey)).toBe(false);
            });

            it('checkListElemKeys', function(){
                var listData = [],
                    yangParser = yinParser.__test.yangParser,
                    refKey,
                    duplicates;
                // checkListElemKeys(listData, refKey)
                refKey = [yangParser.createNewNode('id', 'dummy', null, 0), yangParser.createNewNode('name', 'dummy', null, 0)];

                expect(nodeWrapper.__test.checkListElemKeys(listData, refKey).length).toBe(0);

                listData = [
                    {
                        'id': 1,
                        'name': 'A',
                        'attr': 'X'
                    },
                    {
                        'id': 2,
                        'name': 'A',
                        'attr': 'X'
                    },
                    {
                        'M:id': 1,
                        'm:name': 'B',
                        'attr': 'X'
                    },
                    {
                        'M:id': 2,
                        'name': 'B',
                        'attr': 'X'
                    }
                ];

                expect(nodeWrapper.__test.checkListElemKeys(listData, refKey).length).toBe(0);

                listData = [
                    {
                        'id': 1,
                        'name': 'A',
                        'attr': 'X'
                    },
                    {
                        'id': 1,
                        'name': 'A',
                        'attr': 'X'
                    },
                    {
                        'M:id': 1,
                        'M:name': 'A',
                        'attr': 'X'
                    },
                    {
                        'M:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    {
                        'M:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    {
                        'M:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    {
                        'M:id': 2,
                        'name': 'B',
                        'attr': 'X'
                    }
                ];

                expect(nodeWrapper.__test.checkListElemKeys(listData, refKey).length).toBe(6);
            });

            it('parseRestrictText', function(){
                var input = "1|10..100",
                    restrictions = nodeWrapper.__test.parseRestrictText(input);
                 
                expect(restrictions.length).toBe(2);
                expect(restrictions[0].check('1')).toBe(true);
                expect(restrictions[0].check('2')).toBe(false);
                expect(restrictions[0].check('X')).toBe(false);

                expect(restrictions[1].check('10')).toBe(true);
                expect(restrictions[1].check('100')).toBe(true);
                expect(restrictions[1].check('50')).toBe(true);
                expect(restrictions[1].check('9')).toBe(false);
                expect(restrictions[1].check('101')).toBe(false);
                expect(restrictions[1].check('X')).toBe(false);
            });

            it('getTypes', function(){
                var nodeLeaf = yangParser.createNewNode('L','leaf',null, constants.NODE_UI_DISPLAY),
                    nodeUnion = yangParser.createNewNode('union','type',nodeLeaf, constants.NODE_ALTER),
                    nodeString = yangParser.createNewNode('string','type',nodeUnion, constants.NODE_ALTER),
                    nodePattern = yangParser.createNewNode('^[a-k]+$','pattern', nodeString, constants.NODE_RESTRICTIONS),
                    nodeLen = yangParser.createNewNode('1..5','length', nodeString, constants.NODE_RESTRICTIONS),
                    nodeUint16 = yangParser.createNewNode('uint16','type',nodeUnion, constants.NODE_ALTER),
                    nodeRange = yangParser.createNewNode('1..100','range', nodeUint16, constants.NODE_RESTRICTIONS),
                    output = nodeWrapper.__test.getTypes(nodeLeaf);

                expect(output.length).toBe(3);
                expect(output[0].label).toBe('union');
                expect(output[1].label).toBe('string');
                expect(output[2].label).toBe('uint16');
                expect(output[1].children[0].type).toBe('pattern');
                expect(output[1].children[1].type).toBe('length');
                expect(output[2].children[0].type).toBe('range');
            });

            describe('leaf', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;


                beforeEach(function() {
                    node = yangParser.createNewNode('L','leaf',null, constants.NODE_UI_DISPLAY);
                });


                it('buildRequest', function(){

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    node.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                    node.value = null;
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);

                });
                

                it('fill', function(){

                    var data = 'dummyData';

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);
                    propName = 'dummyProp:L';
                    match = node.fill(propName,data);
                    expect(node.value).toBe('dummyData');
                    expect(match).toBe(true);

                });

                it('clear', function(){

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    node.clear();
                    expect(node.value).toBe('');
                    
                });
                
                
                describe('leaf with type', function(){


                    it('fill', function(){
                        var data = '1',
                            nodeBits = yangParser.createNewNode('bits', 'type', node, constants.NODE_ALTER);

                        yangParser.createNewNode('BIT_1', 'bit', nodeBits, constants.NODE_ALTER);
                        nodeWrapper.wrapAll(node);
                        typeWrapper.wrapAll(node);

                        match = node.fill(propName, data);
                        expect(match).toBe(true);
                        expect(nodeBits.bitsValues.length).toBe(1);
                        expect(nodeBits.bitsValues[0]).toBe('1');

                    });

                    it('clear', function(){
                        var data = '1',
                            nodeBits = yangParser.createNewNode('bits', 'type', node, constants.NODE_ALTER);

                        yangParser.createNewNode('BIT_1', 'bit', nodeBits, constants.NODE_ALTER);
                        nodeWrapper.wrapAll(node);
                        typeWrapper.wrapAll(node);

                        node.fill(propName, data);
                        node.clear();
                        expect(nodeBits.bitsValues.length).toBe(1);
                        expect(nodeBits.bitsValues[0]).toBe(0);
                        
                    });

                    it('checkValueType', function(){
                        nodeWrapper.wrapAll(node);
                        typeWrapper.wrapAll(node);

                        node.value = '1';
                        node.checkValueType();
                        expect(node.valueIsValid).toBe(true);
                        
                        node.value = '';
                        node.checkValueType();
                        expect(node.valueIsValid).toBe(true);

                        node.value = 'x';
                        node.checkValueType();
                        expect(node.valueIsValid).toBe(true);

                        nodeInt8 = yangParser.createNewNode('int8', 'type', node, constants.NODE_ALTER);

                        nodeWrapper.wrapAll(node);
                        typeWrapper.wrapAll(node);

                        node.value = '1';
                        node.checkValueType();
                        expect(node.valueIsValid).toBe(true);
                        
                        node.value = '';
                        node.checkValueType();
                        expect(node.valueIsValid).toBe(true);

                        node.value = 'x';
                        node.checkValueType();
                        expect(node.valueIsValid).toBe(false);
                    });

                });
                
            });
/*
            describe('length', function(){
                var node, nodeChild;
                
                it('test', function(){
                    node = yinParser.__test.yangParser.createNewNode('string','type',null, constants.NODE_UI_DISPLAY);
                    nodeChild = yinParser.__test.yangParser.createNewNode('1|10..100','length', node, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(node);
                   
                    expect(nodeChild.restrict.info).toBe('length - 1|10..100');
                    expect(nodeChild.restrict.ifs.length).toBe(2);
                    expect(angular.isFunction(nodeChild.restrict.ifs[0])).toBe(true);
                    expect(angular.isFunction(nodeChild.restrict.ifs[1])).toBe(true);
                });
            });
            
            describe('range', function(){
                var node, nodeChild;
                
                it('test', function(){
                    node = yinParser.__test.yangParser.createNewNode('string','type',null, constants.NODE_UI_DISPLAY);
                    nodeChild = yinParser.__test.yangParser.createNewNode('1|10..100','range', node, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(node);
                   
                    expect(nodeChild.restrict.info).toBe('range - 1|10..100');
                    expect(nodeChild.restrict.ifs.length).toBe(2);
                    expect(angular.isFunction(nodeChild.restrict.ifs[0])).toBe(true);
                    expect(angular.isFunction(nodeChild.restrict.ifs[1])).toBe(true);
                });
            });

            describe('pattern', function(){
                var node, nodeChild;
                
                it('test', function(){
                    node = yinParser.__test.yangParser.createNewNode('string','type',null, constants.NODE_UI_DISPLAY);
                    nodeChild = yinParser.__test.yangParser.createNewNode('\\d{4}-\\d{2}-\\d{2}','pattern', node, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(node);
                    
                    expect(nodeChild.restrict.info).toBe('pattern - \\d{4}-\\d{2}-\\d{2}');
                    expect(nodeChild.restrict.ifs.length).toBe(1);
                    expect(angular.isFunction(nodeChild.restrict.ifs[0])).toBe(true);
                });
            });
*/
            describe('container', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('ports','container',null, constants.NODE_UI_DISPLAY);

                });

                it('toggleExpand', function(){

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.toggleExpand)).toBe(true);
                    node.toggleExpand();
                    expect(node.expanded).toBe(true);

                });

                it('buildRequest', function(){

                    var nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('ports','container', node, constants.NODE_UI_DISPLAY),
                        nodeChildThird = yangParser.createNewNode('ports','leaf', nodeChildSec, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChildThird.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                    node.children = [];
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);
                });

                it('clear', function(){

                    var nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('ports','container', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChild.value = 'dummyValue';
                    nodeChildSec.value = 'dummyValueSec';
                    node.clear();
                    expect(nodeChild.value).toBe('');
                    expect(nodeChildSec.value).toBe('dummyValueSec');

                });

                it('fill', function(){

                    var data = { 'dummyProp:ports': 'dummyData'},
                        nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);

                    propName = 'dummyProp:ports';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');      

                });

                it('isFilled', function(){
                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY),
                        isFilled;

                    nodeWrapper.wrapAll(node);
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(false);
                    nodeChild.value = 'dummyData';
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(true);

                });

            });

            describe('rpc', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('ports','rpc',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){
                    var added;
                    
                    nodeWrapper.wrapAll(node);
                    added = node.buildRequest(reqBuilder, req);
                    expect(added).toBe(true);

                    var nodeChild = yangParser.createNewNode('input','input', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('name','leaf', nodeChild, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChildSec.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('clear', function(){

                    var nodeChild = yangParser.createNewNode('input','input', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('name','leaf', nodeChild, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChildSec.value = 'dummyValue';
                    node.clear();
                    expect(nodeChildSec.value).toBe('');

                    node.children = [];
                    node.clear();
                });

                it('fill', function(){

                    var data = { 'dummyProp:name': 'dummyData'},
                        nodeChild = yangParser.createNewNode('input','input', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('name','leaf', nodeChild, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);

                    propName = 'dummyProp:input';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChildSec.value).toBe('dummyData');

                });

                it('isFilled', function(){
                    var nodeChild = yangParser.createNewNode('input','input', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('name','leaf', nodeChild, constants.NODE_UI_DISPLAY),
                        isFilled;

                    nodeWrapper.wrapAll(node);
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(false);
                    nodeChildSec.value = 'dummyData';
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(true);

                });



            });

            describe('input', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('input','input',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){
                    var added;
                    
                    nodeWrapper.wrapAll(node);
                    added = node.buildRequest(reqBuilder, req);
                    expect(added).toBe(true);

                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChild.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('clear', function(){

                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChild.value = 'dummyValue';
                    node.clear();
                    expect(nodeChild.value).toBe('');

                    node.children = [];
                    node.clear();
                });

                it('fill', function(){

                    var data = { 'dummyProp:name': 'dummyData'},
                        nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);

                    propName = 'dummyProp:input';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');

                    data = { 'name': 'dummyData'};

                    propName = 'input';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');
                });

                it('isFilled', function(){
                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY),
                        isFilled;

                    nodeWrapper.wrapAll(node);
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(false);
                    nodeChild.value = 'dummyData';
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(true);

                });



            });

            describe('output', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('output','output',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){
                    var added;
                    
                    nodeWrapper.wrapAll(node);
                    added = node.buildRequest(reqBuilder, req);
                    expect(added).toBe(true);

                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChild.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('clear', function(){

                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChild.value = 'dummyValue';
                    node.clear();
                    expect(nodeChild.value).toBe('');

                    node.children = [];
                    node.clear();
                });

                it('fill', function(){

                    var data = { 'dummyProp:name': 'dummyData'},
                        nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);

                    propName = 'dummyProp:output';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');

                    data = { 'name': 'dummyData'};

                    propName = 'output';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');
                });

                it('isFilled', function(){
                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY),
                        isFilled;

                    nodeWrapper.wrapAll(node);
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(false);
                    nodeChild.value = 'dummyData';
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(true);

                });



            });

            describe('case', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('ports','case',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){

                    var nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('ports','case', node, constants.NODE_UI_DISPLAY),
                        nodeChildThird = yangParser.createNewNode('ports','leaf', nodeChildSec, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChildThird.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('fill', function(){

                    var data = 'dummyData',
                        filled,
                        nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    filled = node.fill(propName, data);
                    expect(filled).toBe(false);

                    propName = 'dummyProp:ports';
                    filled = node.fill(propName,data);
                    expect(filled).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');      

                });

                it('clear', function(){

                    var nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yangParser.createNewNode('ports','case', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChild.value = 'dummyValue';
                    nodeChildSec.value = 'dummyValueSec';
                    node.clear();
                    expect(nodeChild.value).toBe('');
                    expect(nodeChildSec.value).toBe('dummyValueSec');   

                }); 

                it('isFilled', function(){
                    var nodeChild = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY),
                        isFilled;

                    nodeWrapper.wrapAll(node);
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(false);
                    nodeChild.value = 'dummyData';
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(true);

                });

            });

            describe('choice', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('ports','choice',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){

                    nodeWrapper.wrapAll(node);
                    node.choice =  yangParser.createNewNode('ports','case', null, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(node.choice);
                    
                    var nodeChoiceChild = yangParser.createNewNode('ports','leaf', node.choice, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(nodeChoiceChild);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChoiceChild.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                    node.choice = null;
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                });

                it('fill', function(){

                    var nodeChild = yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        data = 'dummyData',
                        filled;
                        
                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    filled = node.fill(propName, data);
                    expect(filled).toBe(false);

                    propName = 'dummyProp:ports';
                    filled = node.fill(propName,data);
                    expect(filled).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');  

                });

                it('clear', function(){

                    nodeWrapper.wrapAll(node);
                    yangParser.createNewNode('ports','case', node, constants.NODE_UI_DISPLAY);
                    node.choice = node.children[0];
                    nodeWrapper.wrapAll(node.choice);

                    var nodeChoiceChild = yangParser.createNewNode('ports','leaf', node.children[0], constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(nodeChoiceChild);
                            
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChoiceChild.value = 'dummyValueSec';
                    node.clear();
                    expect(nodeChoiceChild.value).toBe('');
                    expect(node.choice).toBe(null);

                    node.choice = null;
                    node.clear();
                });

                it('isFilled', function(){
                    var isFilled;

                    nodeWrapper.wrapAll(node);
                    isFilled = node.isFilled();
                    expect(isFilled).toBe(false);

                    var nodeChoice = yangParser.createNewNode('name','leaf', null, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(nodeChoice);
                    node.choice = nodeChoice;

                    isFilled = node.isFilled();
                    expect(isFilled).toBe(true);
                    

                });

            });

            describe('leaf-list', function(){
                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {
                    node = yangParser.createNewNode('ports','leaf-list',null, constants.NODE_UI_DISPLAY);

                });

                it('toggleExpand', function(){

                    nodeWrapper.wrapAll(node);
                    expect(node.expanded).toBe(true);
                    node.toggleExpand();
                    expect(node.expanded).toBe(false);

                });

                it('addListElem', function(){

                    nodeWrapper.wrapAll(node);
                    expect(node.value.length).toBe(0);
                    node.addListElem();
                    expect(node.value.length).toBe(1);

                });

                it('removeListElem', function(){

                    nodeWrapper.wrapAll(node);
                    expect(node.value.length).toBe(0);
                    node.addListElem();
                    node.addListElem();
                    node.removeListElem(1);
                    expect(node.value.length).toBe(1);

                });

                it('buildRequest', function(){

                    nodeWrapper.wrapAll(node);
                    
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    node.addListElem();
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('fill', function(){
                    var array = ['dummyValue', 'dummyValue2'],
                        match;
                    nodeWrapper.wrapAll(node);
                    match = node.fill('dummyProp', array);
                    expect(match).toBe(false);
                    match = node.fill('ports', array);
                    expect(match).toBe(true);
                    expect(node.value[1].value).toBe('dummyValue2');

                });

                it('clear', function(){
                    var array = ['dummyValue', 'dummyValue2'];

                    nodeWrapper.wrapAll(node);
                    node.fill('ports', array);
                    expect(node.value.length).toBe(2);
                    node.clear();
                    expect(node.value.length).toBe(0);

                });

                it('isFilled', function(){
                    var array = ['dummyValue', 'dummyValue2'];
                    nodeWrapper.wrapAll(node);

                    expect(node.isFilled()).toBe(false);
                    node.fill('ports', array);
                    expect(node.isFilled()).toBe(true);

                });

            });
            
            describe ('key', function() {
                var node, nodeChildKey, nodeChildLeaf1, nodeChildLeaf2, nodeChildLeaf3;
                
                it('execution - parent has refKey', function(){
                    node = yangParser.createNewNode('LiA','list',null, constants.NODE_UI_DISPLAY);
                    nodeChildKey = yangParser.createNewNode('ID name','key', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf1 = yangParser.createNewNode('ID','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf2 = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf3 = yangParser.createNewNode('attr','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                   
                    expect(node.refKey.length).toBe(2);
                    expect(node.refKey[0].label).toBe('ID');
                    expect(node.refKey[1].label).toBe('name');
                });

                it('execution - parent doesn\'t have refKey', function(){
                    node = yangParser.createNewNode('LiA','leaf',null, constants.NODE_UI_DISPLAY);
                    nodeChildKey = yangParser.createNewNode('ID name','key', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf1 = yangParser.createNewNode('ID','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf2 = yangParser.createNewNode('name','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf3 = yangParser.createNewNode('attr','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                   
                    expect(node.hasOwnProperty('refKey')).toBe(false);
                });
            });

            describe('list', function(){
                var node, nodeChildLeaf, nodeChildContainer, containerChildLeaf, yangParser;

                beforeEach(function() {
                    yangParser = yinParser.__test.yangParser;
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
                    node = yangParser.createNewNode('LiA','list',null, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf = yangParser.createNewNode('LA','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildContainer = yangParser.createNewNode('CA','container', node, constants.NODE_UI_DISPLAY);
                    containerChildLeaf = yangParser.createNewNode('LB','leaf', nodeChildContainer, constants.NODE_UI_DISPLAY);
                    nonExistentChild = yangParser.createNewNode('D','dummy', nodeChildContainer, -1);

                    nodeWrapper.wrapAll(node);
                });

                it('nodeEqual-utility', function(){
                    copy = node.deepCopy();
                    nodeWrapper.wrapAll(copy);
                    nodesEqual(node, copy);
                    nodesEqual(copy, node);

                    //TODO negative test cases?
                    // copy.children[0].label = 'X';
                    // nodesEqual(node, copy);
                    // expect(nodesEqual(copy, node)).toThrow();

                    // copy.children[0].label = null;
                    // delete node.children[0].label;
                    // node.children[0].dummy = 'dummyProperty';
                    // expect(nodesEqual(node, copy)).toThrow();
                    // expect(nodesEqual(copy, node)).toThrow();
                });

                it('test utility - reqEqual', function(){
                    reqA = { A:'A'};
                    reqB = { A:'A'};

                    reqsEqual(reqA, reqB);
                    reqsEqual(reqB, reqA);

                    reqA.L = [{B: 'B'}, {C: 'C'}];
                    reqB.L = [{B: 'B'}, {C: 'C'}];

                    reqsEqual(reqA, reqB);
                    reqsEqual(reqB, reqA);

                    //TODO negative test cases?
                    // reqB.L = [{B: 'B'}, {C: 'C'}, {X: 'X'}];
                    // expect(reqsEqual(reqA, reqB)).toThrow();
                    // expect(reqsEqual(reqB, reqA)).toThrow();

                    // reqA = { A:'A', B: { C: 'C', D: [{E: 'E'}]}};
                    // reqB = { A:'A', B: { C: 'C', D: 'D'}};

                    // expect(reqsEqual(reqA, reqB)).toThrow();
                    // expect(reqsEqual(reqB, reqA)).toThrow();

                    // reqA = {'A': [{'B': 'b'},{'B': 'b', 'C': {'D': 'x'}}]};
                    // reqB = {'A': [{'B': 'b'},{'B': 'b', 'C': {'E': 'x'}}]};

                    // expect(reqsEqual(reqA, reqB)).toThrow();
                    // expect(reqsEqual(reqB, reqA)).toThrow();

                });

                it('wrapAll', function(){
                    expect(angular.isFunction(node.addListElem)).toBe(true);
                    expect(angular.isFunction(node.removeListElem)).toBe(true);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    expect(angular.isFunction(node.clear)).toBe(true);
                });

                it('addListElem', function(){
                    expect(node.listData.length).toBe(0);
                    node.addListElem();
                    node.addListElem();
                    expect(node.listData.length).toBe(2);
                });

                it('removeListElem', function(){
                    node.addListElem();
                    node.addListElem();
                    node.addListElem();
                    node.addListElem();
                    expect(node.listData.length).toBe(4);
                    node.listData[0] = { LA: '0'};
                    node.listData[1] = { LA: '1'};
                    node.listData[2] = { LA: '2'};
                    node.listData[3] = { LA: '3'};


                    expect(node.actElemIndex === node.listData.length - 1).toBe(true);
                    node.removeListElem(0);
                    expect(node.actElemIndex === node.listData.length - 1).toBe(true);
                    expect(node.actElemStructure.getChildren('leaf','LA')[0].value).toBe('3'); 

                    node.actElemIndex = 0;
                    node.removeListElem(0);
                    expect(node.actElemIndex === node.listData.length - 1).toBe(true);
                    expect(node.actElemIndex === 0).toBe(false);

                    node.removeListElem(node.listData.length - 1);
                    expect(node.actElemStructure.getChildren('leaf','LA')[0].value).toBe('2');
                    node.removeListElem(0);
                    expect(node.actElemStructure).toBe(null);
                    expect(node.actElemIndex).toBe(-1);
                });

                it('buildRequest', function(){
                    var dummyReq = reqBuilder.createObj(),
                        added,
                        dummyValueA = 'dummyValueA',
                        dummyValueB = 'dummyValueB',
                        expectedReq = {};

                    added = node.buildRequest(reqBuilder, dummyValueB);
                    
                    expect(added).toBe(false);
                    expect($.isEmptyObject(dummyReq)).toBe(true);
                    reqsEqual(dummyReq, expectedReq);

                    node.addListElem();
                    added = node.buildRequest(reqBuilder, dummyReq);
                    
                    expect(added).toBe(false);
                    expect($.isEmptyObject(dummyReq)).toBe(true);
                    reqsEqual(dummyReq, expectedReq);

                    node.actElemStructure.children[1].children[0].value = dummyValueA;
                    node.actElemStructure.children[0].buildRequest = function(builder, req) {
                        builder.insertPropertyToObj(req, '$$hashKey', dummyValueB);
                        return true;
                    };

                    added = node.buildRequest(reqBuilder, dummyReq);
                    expectedReq = {LiA: [{CA : { LB: dummyValueA }}]};
                    
                    expect(added).toBe(true);
                    expect($.isEmptyObject(dummyReq)).toBe(false);
                    reqsEqual(dummyReq, expectedReq);
                });

                it('fill', function(){
                    var dummyValueA = 'dummyValueA',
                        dummyValueB = 'dummyValueB',
                        fillDataObjA = {'NS:LA': dummyValueA},
                        fillDataObjB = {'NS:CA': {'NS:LB': dummyValueB}},
                        fillDataObjC = {'NS:LA': dummyValueA, 'NS:CA': {'NS:LB': dummyValueB}},
                        fillName = 'LiX0',
                        filled,
                        comparedElem,
                        leaf = function(node) { return node.children[0];},
                        cont = function(node) { return node.children[1];},
                        unsetVal = '';

                    filled = node.fill(fillName, [fillDataObjA, fillDataObjB, fillDataObjC]);
                    expect(filled).toBe(false);
                    expect(node.listData.length).toBe(0);

                    fillName = 'NS:'+node.label;

                    filled = node.fill(fillName, [fillDataObjA, fillDataObjB, fillDataObjC]);
                    expect(filled).toBe(true);
                    expect(node.listData.length).toBe(3);

                    comparedElem = node.actElemStructure;
                    node.changeActElementData(0);

                    expect(leaf(comparedElem).value).toBe(dummyValueA);
                    expect(leaf(cont(comparedElem)).value).toBe(unsetVal);

                    node.changeActElementData(1);
                    expect(leaf(comparedElem).value).toBe(unsetVal);
                    expect(leaf(cont(comparedElem)).value).toBe(dummyValueB);

                    node.changeActElementData(2);
                    expect(leaf(comparedElem).value).toBe(dummyValueA);
                    expect(leaf(cont(comparedElem)).value).toBe(dummyValueB);
                });

                it('clear', function(){
                    node.addListElem();
                    node.clear();
                    expect(node.actElemStructure === null).toBe(true);
                    expect(node.listData.length).toBe(0);
                });

                it('toggleExpand', function(){
                    expect(node.expanded).toBe(true);
                    node.toggleExpand();
                    expect(node.expanded).toBe(false);
                });

                it('isFilled', function(){
                    expect(node.isFilled()).toBe(false);
                    node.addListElem();
                    expect(node.isFilled()).toBe(true);
                });
                
                it('createListName', function(){
                    var dummyValue1 = 'dummyValueKey1',
                        dummyValue2 = 'dummyValueKey2',
                        nodeChildKey, nodeChildLeafK1, nodeChildLeafK2;
                        
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
                    nodeChildKey = yangParser.createNewNode('LC LD','key', node, constants.NODE_ALTER);
                    nodeChildLeafK1 = yangParser.createNewNode('LC','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildLeafK2 = yangParser.createNewNode('LD','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(node);
                    node.addListElem();
                    node.listData[0] = {
                            'LA': 'A',
                            'LB': 'B'
                    };
                    expect(node.createListName(0)).toBe('');

                    node.listData[0] = {
                            'LA': 'A',
                            'LC': 'B'
                    };
                    node.actElemIndex = 1;
                    expect(node.createListName(0)).toBe(' <LC:B>');

                    node.listData = [];
                    node.addListElem();
                    node.actElemStructure.children[3].value = dummyValue1;
                    node.actElemStructure.children[4].value = dummyValue2;
                    node.changeActElementData(0);
                    expect(node.createListName(0)).toBe(' <LC:dummyValueKey1 LD:dummyValueKey2>');

                    node.listData[0] = {
                            'M:LC': 'A',
                            'M:LD': 'B'
                    };
                    node.actElemIndex = 1;
                    expect(node.createListName(0)).toBe(' <LC:A LD:B>');
                   
                    node.listData[0] = {};
                    expect(node.createListName(0)).toBe('');
                    expect(node.createListName(-1)).toBe('');
                });
            });

            describe('listElem', function(){
                var node, dummyValueA, dummyValueB, dummyReq;

                    beforeEach(function() {
                        node = yangParser.createNewNode('LiA','list',null, constants.NODE_UI_DISPLAY);

                        yangParser.createNewNode('LA','leaf', node, constants.NODE_UI_DISPLAY);
                        yangParser.createNewNode('LB','leaf', node, constants.NODE_UI_DISPLAY);

                        nodeWrapper.wrapAll(node);
                        node.addListElem();

                        dummyValueA = 'dummyValueA';
                        dummyValueB = 'dummyValueB';
                        dummyReq = {};
                    });

                    it('_listElem', function(){
                        expect(angular.isFunction(node.actElemStructure.listElemBuildRequest)).toBe(true);
                        expect(angular.isFunction(node.actElemStructure.fillListElement)).toBe(true);
                    });

                    it('listElemBuildRequest', function(){
                        var dummyList = [],
                            added,
                            LA = node.actElemStructure.children[0],
                            LB = node.actElemStructure.children[1];

                        added = node.actElemStructure.listElemBuildRequest(reqBuilder, dummyList);
                        expect(dummyList.length).toBe(0);
                        expect(added).toBe(false);

                        LA.value = dummyValueA;
                        // console.info('node',node);
                        dummyReq[LA.label] = dummyValueA;
                        added = node.actElemStructure.listElemBuildRequest(reqBuilder, dummyList);

                        expect(dummyList.length).toBe(1);
                        reqsEqual(dummyList, [dummyReq]);
                        expect(added).toBe(true);

                        LB.value = dummyValueB;
                        dummyList = [];
                        dummyReq[LB.label] = dummyValueB;
                        added = node.actElemStructure.listElemBuildRequest(reqBuilder, dummyList);

                        expect(dummyList.length).toBe(1);
                        reqsEqual(dummyList, [dummyReq]);
                        expect(added).toBe(true);
                    });

                    it('fillListElement', function(){
                        var filled,
                            LA = node.actElemStructure.children[0],
                            LB = node.actElemStructure.children[1];

                        filled = node.actElemStructure.fillListElement('NS:'+LA.label, dummyValueA);
                        expect(filled).toBe(true);
                        expect(LA.value).toBe(dummyValueA);
                        expect(LB.value).toBe('');
                        
                        filled = node.actElemStructure.fillListElement('NS:'+LB.label, dummyValueB);
                        expect(filled).toBe(true);
                        expect(LB.value).toBe(dummyValueB);
                    });

                    it('clear', function(){
                        node.actElemStructure.children[0].value = 'X';
                        node.actElemStructure.clear();
                        expect(node.actElemStructure.children[0].value).toBe('');

                        node.clear();
                        node.children = [];
                        node.addListElem();
                        expect(node.actElemStructure !== null).toBe(true);
                        node.actElemStructure.clear();
                    });

                    it('isFilled', function(){
                        var LA = node.actElemStructure.children[0];

                        expect(node.actElemStructure.isFilled()).toBe(false);
                        node.actElemStructure.fillListElement('NS:'+LA.label, dummyValueA);
                        expect(node.actElemStructure.isFilled()).toBe(true);

                    });
            });
        });


        describe('typeWrapper', function(){

            var typeWrapper, nodeWrapper, yinParser, yangParser,
                node, nodeUnion, nodeString, nodePattern, nodeLen, nodeRange, nodeRange8, nodeRange16,  nodeDecimal64,
                nodeInt8, nodeInt16, nodeInt32, nodeInt64, nodeUint8, nodeUint16, nodeUint32, nodeUint64,
                nodeBits, nodeB1, nodeB2, nodeB3, nodeB4, nodeB5,
                nodeEnumeration, nodeE1, nodeE2, nodeE3;

            beforeEach(function() {

                angular.mock.inject(function(_typeWrapper_) {
                    typeWrapper = _typeWrapper_;
                });

                angular.mock.inject(function(_nodeWrapper_) {
                    nodeWrapper = _nodeWrapper_;
                });

                angular.mock.inject(function(_yinParser_) {
                    yinParser = _yinParser_;
                });
                
                yangParser = yinParser.__test.yangParser;
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));

                node = yangParser.createNewNode('L','leaf',null, constants.NODE_UI_DISPLAY);
                nodeUnion = yangParser.createNewNode('union','type',node, constants.NODE_ALTER);
                nodeString = yangParser.createNewNode('string','type',nodeUnion, constants.NODE_ALTER);
                nodePattern = yangParser.createNewNode('^[a-k]+$','pattern', nodeString, constants.NODE_RESTRICTIONS);
                nodeLen = yangParser.createNewNode('1..5|10..15','length', nodeString, constants.NODE_RESTRICTIONS);
                nodeUint16 = yangParser.createNewNode('uint16','type',nodeUnion, constants.NODE_ALTER);
                nodeRange = yangParser.createNewNode('1..100|201..300|401..500','range', nodeUint16, constants.NODE_RESTRICTIONS);
                nodeUint32 = yangParser.createNewNode('uint32','type',nodeUnion, constants.NODE_ALTER);

                nodeDecimal64 = yangParser.createNewNode('decimal64','type',nodeUnion, constants.NODE_ALTER);
                nodeInt8 = yangParser.createNewNode('int8','type', nodeUnion, constants.NODE_ALTER);
                nodeInt16 = yangParser.createNewNode('int16','type',nodeUnion, constants.NODE_ALTER);
                nodeRange16 = yangParser.createNewNode('10..15', 'range', nodeInt16, constants.NODE_RESTRICTIONS);
                nodeInt32 = yangParser.createNewNode('int32','type',nodeUnion, constants.NODE_ALTER);
                nodeInt64 = yangParser.createNewNode('int64','type',nodeUnion, constants.NODE_ALTER);
                nodeUint8 = yangParser.createNewNode('uint8','type',nodeUnion, constants.NODE_ALTER);
                nodeRange8 = yangParser.createNewNode('100..150', 'range', nodeUint8, constants.NODE_RESTRICTIONS);
                nodeUint64 = yangParser.createNewNode('uint64','type',nodeUnion, constants.NODE_ALTER);


                nodeBits = yangParser.createNewNode('bits','type',nodeUnion, constants.NODE_ALTER);
                nodeB1 = yangParser.createNewNode('CHECK_OVERLAP','bit',nodeBits, constants.NODE_ALTER);
                nodeB2 = yangParser.createNewNode('RESET_COUNTS','bit',nodeBits, constants.NODE_ALTER);
                nodeB3 = yangParser.createNewNode('NO_PKT_COUNTS','bit',nodeBits, constants.NODE_ALTER);
                nodeB4 = yangParser.createNewNode('NO_BYT_COUNTS','bit',nodeBits, constants.NODE_ALTER);
                nodeB5 = yangParser.createNewNode('SEND_FLOW_REM','bit',nodeBits, constants.NODE_ALTER);

                nodeEnumeration = yangParser.createNewNode('enumeration','type',nodeUnion, constants.NODE_ALTER);
                nodeE1 = yangParser.createNewNode('E1','enum',nodeEnumeration, constants.NODE_ALTER);
                nodeE2 = yangParser.createNewNode('E2','enum',nodeEnumeration, constants.NODE_ALTER);
                nodeE3 = yangParser.createNewNode('E3','enum',nodeEnumeration, constants.NODE_ALTER);

                nodeWrapper.wrapAll(node);
                typeWrapper.wrapAll(node);
            });

            it('findLeafParent', function(){
                var retNode;
                
                retNode = typeWrapper.__test.findLeafParent(nodeRange);
                expect(retNode.label + retNode.type).toBe('Lleaf');

                retNode = typeWrapper.__test.findLeafParent(node);
                expect(retNode.label + retNode.type).toBe('Lleaf');
                
                var nodeList = yangParser.createNewNode('ListA','list',null, constants.NODE_UI_DISPLAY);
                retNode = typeWrapper.__test.findLeafParent(nodeList);
                expect(retNode).toBe(null);
            });

            describe('wrapper', function(){

                it('wrapAll', function(){
                    typeWrapper.wrapAll(node);
                    expect(angular.isFunction(nodeString.performRestrictionsCheck)).toBe(true);
                    expect(angular.isFunction(nodeUint16.performBuildInChecks)).toBe(true);
                    expect(nodeUint16.builtInChecks.length).toBe(2);
                });

                describe('_setDefaultProperties', function(){

                    it('performRestrictionsCheck', function(){
                        expect(nodeString.performRestrictionsCheck('baba')).toBe(true);
                        expect(nodeString.performRestrictionsCheck('bababa')).toBe(false);
                        expect(nodeUint16.performRestrictionsCheck('1')).toBe(true);
                        expect(nodeUint16.performRestrictionsCheck('101')).toBe(false);
                        expect(nodeUint32.performRestrictionsCheck('X')).toBe(true);
                    });

                    it('performBuildInChecks', function(){
                        expect(nodeString.performBuildInChecks('')).toBe(true);
                        expect(nodeString.performBuildInChecks('babaxxx')).toBe(true);
                        expect(nodeUint16.performBuildInChecks('0.000000000001')).toBe(false);
                        expect(nodeUint16.performBuildInChecks('9999')).toBe(true);

                    });

                    it('check', function(){
                        expect(nodeUint16.check('1a2')).toBe(false);
                        expect(nodeUint16.check('101')).toBe(false);
                        expect(nodeUint16.check('0')).toBe(false);
                        expect(nodeUint16.check('50')).toBe(true);
                    });
                });

                describe('bits', function(){

                    it('wrapAll', function(){
                        expect(nodeBits.leafParent).toBe(node);
                        expect(nodeBits.maxBitsLen).toBe(5);
                        for (var i = 0; i < nodeBits.maxBitsLen; i++) {
                            expect(nodeBits.bitsValues[i]).toBe('');
                        }
                        expect(angular.isFunction(nodeBits.clear)).toBe(true);
                        expect(angular.isFunction(nodeBits.fill)).toBe(true);
                        expect(angular.isFunction(nodeBits.setLeafValue)).toBe(true);
                    });
                    
                    it('clear', function(){
                        nodeBits.clear();
                        
                        for (var i = 0; i < nodeBits.bitsValues.length; i++) {
                            expect(nodeBits.bitsValues[i]).toBe(0);
                        }
                    });

                    it('fill', function(){
                        nodeBits.leafParent.value = '1';
                        nodeBits.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('1,,,,');

                        nodeBits.leafParent.value = '2';
                        nodeBits.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('0,1,,,');

                        nodeBits.leafParent.value = '16';
                        nodeBits.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('0,0,0,0,1');

                        nodeBits.leafParent.value = '19';
                        nodeBits.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('1,1,0,0,1');

                        nodeBits.leafParent.value = 'aaa';
                        nodeBits.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('0,,,,');
                    });

                    it('setLeafValue', function(){
                        nodeBits.bitsValues = ['1','','','',''];
                        nodeBits.setLeafValue(nodeBits.bitsValues);
                        expect(nodeBits.leafParent.value).toBe('1');

                        nodeBits.bitsValues = ['0','1','','',''];
                        nodeBits.setLeafValue(nodeBits.bitsValues);
                        expect(nodeBits.leafParent.value).toBe('2');

                        nodeBits.bitsValues = ['0','0','0','0','1'];
                        nodeBits.setLeafValue(nodeBits.bitsValues);
                        expect(nodeBits.leafParent.value).toBe('16');

                        nodeBits.bitsValues = ['1','1','0','0','1'];
                        nodeBits.setLeafValue(nodeBits.bitsValues);
                        expect(nodeBits.leafParent.value).toBe('19');
                    });
                });

                describe('enumeration', function(){

                    it('wrapAll', function(){
                        expect(nodeEnumeration.leafParent).toBe(node);
                        expect(angular.isFunction(nodeEnumeration.clear)).toBe(true);
                        expect(angular.isFunction(nodeEnumeration.fill)).toBe(true);
                        expect(angular.isFunction(nodeEnumeration.setLeafValue)).toBe(true);
                    });
                    
                    it('clear', function(){
                        nodeEnumeration.selEnum = nodeE1;
                        nodeEnumeration.clear();
                        expect(nodeEnumeration.selEnum).toBe(null);
                    });

                    it('fill', function(){
                        nodeEnumeration.fill(nodeE1.label);
                        expect(nodeEnumeration.selEnum).toBe(nodeE1);

                        nodeEnumeration.fill('EX');
                        expect(nodeEnumeration.selEnum).toBe(null);
                    });

                    it('setLeafValue - nonExistingChild', function(){
                        nodeEnumeration.selEnum = nodeE1;
                        nodeEnumeration.setLeafValue(nodeEnumeration.selEnum.label);
                        expect(nodeEnumeration.leafParent.value).toBe(nodeE1.label);
                    });
                });

                describe('union', function(){
                    
                    it('wrapAll', function(){
                        expect(angular.isFunction(nodeUnion.clear)).toBe(true);
                        expect(angular.isFunction(nodeUnion.fill)).toBe(true);
                        expect(angular.isFunction(nodeUnion.check)).toBe(true);
                        
                        expect(nodeBits.leafParent).toBe(node);
                        expect(nodeBits.maxBitsLen).toBe(5);
                        for (var i = 0; i < nodeBits.maxBitsLen; i++) {
                            expect(nodeBits.bitsValues[i]).toBe('');
                        }
                        expect(angular.isFunction(nodeBits.clear)).toBe(true);
                        expect(angular.isFunction(nodeBits.fill)).toBe(true);
                        expect(angular.isFunction(nodeBits.setLeafValue)).toBe(true);
                    });
                    
                    it('clear', function(){
                        nodeUnion.clear();
                        
                        for (var i = 0; i < nodeBits.bitsValues.length; i++) {
                            expect(nodeBits.bitsValues[i]).toBe(0);
                        }
                    });

                    it('fill', function(){
                        node.value = '1';
                        nodeUnion.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('1,,,,');

                        node.value = '2';
                        nodeUnion.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('0,1,,,');

                        node.value = '16';
                        nodeUnion.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('0,0,0,0,1');

                        node.value = '19';
                        nodeUnion.fill();
                        expect(nodeBits.bitsValues.toString()).toBe('1,1,0,0,1');
                    });

                    describe('checking union', function(){
                        it('basic', function(){
                            expect(nodeUnion.check('XXX123')).toBe(false);
                            expect(nodeUnion.check('abc')).toBe(true);
                            expect(nodeUnion.check('2')).toBe(true);
                        });
                        
                        it('string with length true, int false, union true', function(){
                            expect(nodeUnion.check('bbbbbbbbbbb')).toBe(true);
                            expect(nodeString.check('bbbbbbbbbbb')).toBe(true);
                            expect(nodeUint16.check('bbbbbbbbbbb')).toBe(false);
                            
                            expect(nodeDecimal64.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeInt8.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeInt16.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeInt32.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeInt64.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeUint8.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeUint64.check('bbbbbbbbbbb')).toBe(false);                            
                            
                            expect(nodeBits.check('bbbbbbbbbbb')).toBe(false);                            
                            expect(nodeEnumeration.check('bbbbbbbbbbb')).toBe(false);                         
                        });
                        
                        it('string true with length false, int false, union false', function(){
                            expect(nodeUnion.check('bbbbbb')).toBe(false);
                            expect(nodeString.check('bbbbbb')).toBe(false);
                            expect(nodeUint16.check('bbbbbb')).toBe(false);
                            
                            expect(nodeDecimal64.check('bbbbbb')).toBe(false);                            
                            expect(nodeInt8.check('bbbbbb')).toBe(false);                            
                            expect(nodeInt16.check('bbbbbb')).toBe(false);                            
                            expect(nodeInt32.check('bbbbbb')).toBe(false);                            
                            expect(nodeInt64.check('bbbbbb')).toBe(false);                            
                            expect(nodeUint8.check('bbbbbb')).toBe(false);                            
                            expect(nodeUint64.check('bbbbbb')).toBe(false);                            
                            
                            expect(nodeBits.check('bbbbbb')).toBe(false); 
                            expect(nodeEnumeration.check('bbbbbb')).toBe(false);                           
                        });

                        it('string false, int true, union true', function(){
                            expect(nodeUnion.check('2')).toBe(true);
                            expect(nodeString.check('2')).toBe(false);
                            expect(nodeUint16.check('2')).toBe(true);
                            
                            expect(nodeDecimal64.check('2')).toBe(true);                            
                            expect(nodeInt8.check('2')).toBe(true);                            
                            expect(nodeInt16.check('2')).toBe(false);                            
                            expect(nodeInt32.check('2')).toBe(true);                            
                            expect(nodeInt64.check('2')).toBe(true);                            
                            expect(nodeUint8.check('2')).toBe(false);                            
                            expect(nodeUint64.check('2')).toBe(true);                            
                            
                            expect(nodeBits.check('2')).toBe(true); 
                            expect(nodeEnumeration.check('2')).toBe(false);                           
                        });

                        it('string false, int false, enum true, union true', function(){
                            expect(nodeUnion.check('E1')).toBe(true);
                            expect(nodeString.check('E1')).toBe(false);
                            expect(nodeUint16.check('E1')).toBe(false);
                            
                            expect(nodeDecimal64.check('E1')).toBe(false);                            
                            expect(nodeInt8.check('E1')).toBe(false);                            
                            expect(nodeInt16.check('E1')).toBe(false);                            
                            expect(nodeInt32.check('E1')).toBe(false);                            
                            expect(nodeInt64.check('E1')).toBe(false);                            
                            expect(nodeUint8.check('E1')).toBe(false);                            
                            expect(nodeUint64.check('E1')).toBe(false);                            
                            
                            expect(nodeBits.check('E1')).toBe(false); 
                            expect(nodeEnumeration.check('E1')).toBe(true);                           
                        });

                    });

                });

                it('decimal64 - buildInCheck', function(){
                    expect(nodeDecimal64.performBuildInChecks('99.99')).toBe(true);
                    expect(nodeDecimal64.performBuildInChecks('9x.99')).toBe(false);
                });

                it('int8 - buildInCheck', function(){
                    expect(nodeInt8.performBuildInChecks('64')).toBe(true);
                    expect(nodeInt8.performBuildInChecks('9x.')).toBe(false);
                });

                it('int16 - buildInCheck', function(){
                    expect(nodeInt16.performBuildInChecks('64')).toBe(true);
                    expect(nodeInt16.performBuildInChecks('9x.')).toBe(false);
                });

                it('int32 - buildInCheck', function(){
                    expect(nodeInt32.performBuildInChecks('64')).toBe(true);
                    expect(nodeInt32.performBuildInChecks('9x.')).toBe(false);
                });

                it('int64 - buildInCheck', function(){
                    expect(nodeInt64.performBuildInChecks('64')).toBe(true);
                    expect(nodeInt64.performBuildInChecks('9x.')).toBe(false);
                });

                it('uint8 - buildInCheck', function(){
                    expect(nodeUint8.performBuildInChecks('64')).toBe(true);
                    expect(nodeUint8.performBuildInChecks('9x.')).toBe(false);
                });

                it('uint16 - buildInCheck', function(){
                    expect(nodeUint16.performBuildInChecks('64')).toBe(true);
                    expect(nodeUint16.performBuildInChecks('9x.')).toBe(false);
                });

                it('uint32 - buildInCheck', function(){
                    expect(nodeUint32.performBuildInChecks('64')).toBe(true);
                    expect(nodeUint32.performBuildInChecks('9x.')).toBe(false);
                });

                it('uint64 - buildInCheck', function(){
                    expect(nodeUint64.performBuildInChecks('64')).toBe(true);
                    expect(nodeUint64.performBuildInChecks('9x.')).toBe(false);
                });
            
            });
        
        });

        describe('restrictionsFact', function(){

            var restrictionsFact;

            beforeEach(angular.mock.inject(function(_restrictionsFact_){
                restrictionsFact = _restrictionsFact_;
            }));

            it('getEqualsFnc', function(){
                expect(restrictionsFact.getEqualsFnc(3).check('3')).toBe(true);
                expect(restrictionsFact.getEqualsFnc(170).check('0xAA')).toBe(true);
                expect(restrictionsFact.getEqualsFnc(15).check('017')).toBe(true);
            });

            it('getMinMaxFnc', function(){
                expect(restrictionsFact.getMinMaxFnc(1,3).check('3')).toBe(true);
            });

            it('getReqexpValidationFnc', function(){
                expect(restrictionsFact.getReqexpValidationFnc('^[a-k]+$').check('b')).toBe(true);
            });

            it('getIsNumberFnc', function(){
                expect(restrictionsFact.getIsNumberFnc().check('-3')).toBe(true);
                expect(restrictionsFact.getIsNumberFnc().check('+3')).toBe(true);
                expect(restrictionsFact.getIsNumberFnc().check('3')).toBe(true);
            });

            it('getIsUNumberFnc', function(){
                expect(restrictionsFact.getIsUNumberFnc().check('3')).toBe(true);
                expect(restrictionsFact.getIsUNumberFnc().check('a')).toBe(false);
            });

            it('getIsDecimalFnc', function(){
                expect(restrictionsFact.getIsDecimalFnc().check('3.3')).toBe(true);
                expect(restrictionsFact.getIsDecimalFnc().check('3,3')).toBe(true);
                expect(restrictionsFact.getIsDecimalFnc().check('-3.3')).toBe(true);
            });

        });

        describe('arrayUtils', function(){

            var arrayUtils;

            beforeEach(angular.mock.inject(function(_arrayUtils_){
                arrayUtils = _arrayUtils_;
            }));

            it('getFirstElementByCondition', function(){

                var list = [1,2,3,4],
                    item = arrayUtils.getFirstElementByCondition(list, function(conditionItem){
                        return conditionItem > 2;
                    });

                expect(item).toBe(3);

                item = arrayUtils.getFirstElementByCondition(null, function(){
                    return true;
                });
                expect(item).toBe(null);

                item = arrayUtils.getFirstElementByCondition(list);
                expect(item).toBe(null);
            });

        });

        describe('pathUtils', function(){

            var pathUtils,
                nodeWrapper,
                constants;

            beforeEach(angular.mock.inject(function(_pathUtils_, _yinParser_, _constants_, _nodeWrapper_){
                pathUtils = _pathUtils_;
                yinParser = _yinParser_;
                constants = _constants_;
                nodeWrapper = _nodeWrapper_;
            }));

            describe('PathElem', function(){

                var pathElem;

                beforeEach(function(){
                    pathElem = new pathUtils.__test.PathElem('MA', 'A1');

                    yangParser = yinParser.__test.yangParser;
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('MA', 'R', 'NS'));
                });

                it('hasIdentifier', function(){

                    var pathElemSec = new pathUtils.__test.PathElem('MA', 'A2', 'dummyIndetifier');

                    expect(pathElem.hasIdentifier()).toBe(false);
                    expect(pathElemSec.hasIdentifier()).toBe(true);

                });

                it('toString', function(){

                    var pathElemToString = pathElem.toString(),
                        pathElemSec = new pathUtils.__test.PathElem('MA'),
                        pathElemThird = new pathUtils.__test.PathElem('MA', 'A2', 'dummyIndetifier');

                    pathElemThird.identifierValue = 'dummyData';

                    expect(pathElemToString).toBe('A1:MA/');

                    pathElemToString = pathElemSec.toString();
                    expect(pathElemToString).toBe('MA/');

                    pathElemToString = pathElemThird.toString();
                    expect(pathElemToString).toBe('A2:MA/dummyData/');

                });

                it('checkNode', function(){

                    var node = yangParser.createNewNode('MA','leaf',null, constants.NODE_UI_DISPLAY),
                        pathElemSec = new pathUtils.__test.PathElem(false, false);

                    node.module = 'A1';
                    expect(pathElem.checkNode(node)).toBe(true);
                    node.label = 'M';
                    expect(pathElem.checkNode(node)).toBe(false);
                    node.label = 'MA';
                    node.module = 'A2';
                    expect(pathElem.checkNode(node)).toBe(false);

                    expect(pathElemSec.checkNode(node)).toBe(true);

                });

            });

            it('getModuleNodePair', function(){

                var pathString = 'dummyPath',
                    defaultModule = 'dummyModule',
                    nodePairValue;

                nodePairValue = pathUtils.__test.getModuleNodePair(pathString, defaultModule);
                expect(nodePairValue[0]).toBe('dummyModule');
                expect(nodePairValue[1]).toBe('dummyPath');

                pathString = 'path:secPath';
                nodePairValue = pathUtils.__test.getModuleNodePair(pathString, defaultModule);
                expect(nodePairValue[0]).toBe('path');
                expect(nodePairValue[1]).toBe('secPath');

            });

            it('isIndentifier', function(){
                var item = '{id}',
                    isIdentifierStatus;

                isIdentifierStatus = pathUtils.__test.isIdentifier(item);
                expect(isIdentifierStatus).toBe(true);
                isIdentifierStatus = pathUtils.__test.isIdentifier('id');
                expect(isIdentifierStatus).toBe(false);

            });

            it('createPathElement', function(){

                var element,
                    pathString = 'path:secPath',
                    identifierString = 'dummyIndetifier',
                    prefixConverter = function(prefix){
                        return prefix;
                    };

                element = pathUtils.__test.createPathElement(pathString, identifierString, prefixConverter, null);
                expect(element.name).toBe('secPath');
                expect(element.identifierName).toBe('dummyIndetifier');
                expect(element.module).toBe('path');
                expect(angular.isFunction(element.checkNode)).toBe(true);
                expect(angular.isFunction(element.toString)).toBe(true);
                expect(angular.isFunction(element.hasIdentifier)).toBe(true);

            });

            it('search', function(){

                var conNode = yangParser.createNewNode('C','container', null, constants.NODE_UI_DISPLAY),
                    parentNode = yangParser.createNewNode('Li','list', conNode, constants.NODE_UI_DISPLAY),
                    node = yangParser.createNewNode('LA','leaf', parentNode, constants.NODE_UI_DISPLAY),
                    nodeSec = yangParser.createNewNode('LB','leaf', conNode, constants.NODE_UI_DISPLAY),
                    pathElem = new pathUtils.__test.PathElem('..', 'A1'),
                    pathElemSec = new pathUtils.__test.PathElem('..', 'A1'),
                    pathElemFinal = new pathUtils.__test.PathElem('LB', 'A1'),
                    pathElemNonExistent = new pathUtils.__test.PathElem('X', 'A1'),
                    selNode;

                nodeWrapper.wrapAll(parentNode);
                nodeWrapper.wrapAll(conNode);
                nodeWrapper.wrapAll(node);
                nodeWrapper.wrapAll(nodeSec);
                nodeSec.module = 'A1';
                selNode = pathUtils.search(node, [pathElem, pathElemSec, pathElemFinal]);
                expect(selNode).toBe(nodeSec);
                selNode = pathUtils.search(node, [pathElem, pathElemSec, pathElemNonExistent]);
                expect(selNode).toBe(null);
            });

            it('translate', function(){

                var pathString = '../path/element',
                    pathElems,
                    elemsNames,
                    elemsModulesNames;

                pathElems = pathUtils.translate(pathString);
                expect(pathElems[0].name).toBe('..');
                expect(pathElems[1].name).toBe('path');
                expect(pathElems[2].name).toBe('element');

                pathString = '/M:E1/M:E2/E3/{I1}';
                pathElems = pathUtils.translate(pathString);

                expect(pathElems[0].name).toBe('E1');
                expect(pathElems[0].module).toBe('M');
                expect(pathElems[1].identifierName).toBe(undefined);
                expect(pathElems[1].name).toBe('E2');
                expect(pathElems[1].module).toBe('M');
                expect(pathElems[1].identifierName).toBe(undefined);
                expect(pathElems[2].name).toBe('E3');
                expect(pathElems[2].module).toBe(undefined);
                expect(pathElems[2].identifierName).toBe('I1');
            });

        });

        describe('syncFact', function(){
            var sync, $timeout;

            beforeEach(angular.mock.inject(function(_syncFact_, _$timeout_){
                $timeout = _$timeout_;
                sync = _syncFact_.generateObj();
            }));

            it('spawnRequest', function(){
                sync.spawnRequest('A');
                expect(sync.runningRequests.length).toBe(1);

                sync.spawnRequest('B');
                expect(sync.runningRequests.length).toBe(2);

                expect(sync.runningRequests[0]).toBe('A0');
                expect(sync.runningRequests[1]).toBe('B1');
            });

            it('removeRequest', function(){
                var reqA = sync.spawnRequest('A'),
                    reqB = sync.spawnRequest('B'),
                    reqC = sync.spawnRequest('C');
                
                sync.removeRequest(reqB);
                sync.removeRequest('C');

                expect(sync.runningRequests.length).toBe(2);
                expect(sync.runningRequests[0]).toBe('A0');
                expect(sync.runningRequests[1]).toBe('C2');
            });

            it('waitFor', function(){
                var called = false,
                    reqA = sync.spawnRequest('A'),
                    dummyCbk = function() { 
                        called = true;
                    };

                sync.waitFor(dummyCbk);
                $timeout.flush();
                expect(called).toBe(false);

                sync.removeRequest(reqA);
                $timeout.flush();
                expect(called).toBe(true);
            });

        });

        describe('moduleConnector', function(){
            var moduleConnector, yinParser, yangParser, modules,
                MA, MAL, MAGRP, MAGRPL, MAGRPLT, MATPD, MATPDSTR,
                MB, MBIMPA, MBGRP, MBGRPU, MBGRPL, MBGRPLT,
                MC, MCIMPB, MCGRP1, MCGRP1L, MCGRP2, MCGRP2L, MCC, MCCU1, MCCU2,
                MD, MDIMPC, MDAUG, MDAUGU;

            beforeEach(angular.mock.inject(function(_moduleConnector_, _yinParser_){
                moduleConnector = _moduleConnector_;
                yinParser = _yinParser_;
                yangParser = yinParser.__test.yangParser;

                modules = [new yinParser.__test.Module('MA','R1','NSA'),
                           new yinParser.__test.Module('MB','R2','NSB'),
                           new yinParser.__test.Module('MC','R3','NSC'),
                           new yinParser.__test.Module('MD','R4','NSD')];

                MA = modules[0];
                MB = modules[1];
                MC = modules[2];
                MD = modules[3];

                yangParser.setCurrentModuleObj(MA);
                MAL = yangParser.createNewNode('MAL', 'leaf', MA, constants.NODE_UI_DISPLAY);
                MAGRP = yangParser.createNewNode('grp-ma', 'grouping', MA, constants.NODE_LINK_TARGET);
                MAGRPL = yangParser.createNewNode('LGRP', 'leaf', MAGRP, constants.NODE_UI_DISPLAY);
                MATPD = yangParser.createNewNode('tpd-ma', 'typedef', MA, constants.NODE_LINK_TARGET);
                MAGRPLT = yangParser.createNewNode(MATPD.label, 'type', MAGRPL, constants.NODE_UI_DISPLAY);
                MATPDT = yangParser.createNewNode('uint32', 'type', MATPD, constants.NODE_ALTER);

                yangParser.setCurrentModuleObj(MB);
                MBIMPA = yangParser.createNewNode('MA', 'import', MB, constants.NODE_ALTER);
                MBIMPA._prefix = 'prefMA';
                MBGRP = yangParser.createNewNode('grp-mb', 'grouping', MB, constants.NODE_LINK_TARGET);
                MBGRPU = yangParser.createNewNode(MBIMPA._prefix+':'+MAGRP.label, 'uses', MBGRP, constants.NODE_LINK);
                MBGRPL = yangParser.createNewNode('MBGRPL', 'leaf', MBGRP, constants.NODE_UI_DISPLAY);
                MBGRPLT = yangParser.createNewNode(MBIMPA._prefix+':'+MAGRPLT.label, 'type', MBGRPL, constants.NODE_ALTER);

                yangParser.setCurrentModuleObj(MC);
                MCIMPB = yangParser.createNewNode('MB', 'import', MC, constants.NODE_ALTER);
                MCIMPB._prefix = 'prefMB';
                MCGRP1 = yangParser.createNewNode('grp-mc1', 'grouping', MC, constants.NODE_LINK_TARGET);
                MCGRP1L = yangParser.createNewNode('MCGRP1L', 'leaf', MCGRP1, constants.NODE_UI_DISPLAY);
                MCGRP2 = yangParser.createNewNode('grp-mc2', 'grouping', MC, constants.NODE_LINK_TARGET);
                MCGRP2L = yangParser.createNewNode('MCGRP2L', 'leaf', MCGRP2, constants.NODE_UI_DISPLAY);
                MCC = yangParser.createNewNode('MCC', 'container', MC, constants.NODE_UI_DISPLAY);
                MCCU1 = yangParser.createNewNode(MCGRP1.label, 'uses', MCC, constants.NODE_LINK);
                MCCU2 = yangParser.createNewNode(MCIMPB._prefix+':'+MBGRP.label, 'uses', MCC, constants.NODE_LINK);

                yangParser.setCurrentModuleObj(MD);
                MDIMPC = yangParser.createNewNode('MC', 'import', MD, constants.NODE_ALTER);
                MDIMPC._prefix = 'prefMC';
                MDAUG = yangParser.createNewNode('augment1', 'augment', MD, constants.NODE_ALTER);
                MDAUG.pathString = '/'+MDIMPC._prefix+':'+MCGRP2.label;
                MDAUGU = yangParser.createNewNode(MDIMPC._prefix+':'+MCGRP2.label, 'uses', MDAUG, constants.NODE_LINK);
                MDC = yangParser.createNewNode('MDC', 'container', MD, constants.NODE_UI_DISPLAY);
                MDU = yangParser.createNewNode('UX:UY', 'uses', MDC, constants.NODE_LINK);
                MDTPD = yangParser.createNewNode('TX:TY', 'typedef', MDC, constants.NODE_LINK);
            }));

            it('isBuildInType', function(){
                expect(moduleConnector.__test.isBuildInType('string')).toBe(true);
                expect(moduleConnector.__test.isBuildInType('myderivedType')).toBe(false);
                expect(moduleConnector.__test.isBuildInType('otherModulePref:myderivedType')).toBe(false);
            });

            it('linkFunctions.uses', function(){
                expect(angular.isFunction(moduleConnector.__test.linkFunctions.uses)).toBe(true);
                moduleConnector.__test.linkFunctions.uses(MCCU2, MC)(modules);
                expect(MCC.children.length).toBe(3);
                expect(MCC.children[1]).toBe(MBGRPL);
                expect(MCC.children[2]).toBe(MAGRPL);

                moduleConnector.__test.linkFunctions.uses(MDU, MD)(modules);
            });

            it('linkFunctions.type', function(){
                expect(angular.isFunction(moduleConnector.__test.linkFunctions.type)).toBe(true);
                moduleConnector.__test.linkFunctions.type(MAGRPLT, MA)(modules);
                expect(MAGRPLT.parent.children[0]).toBe(MATPDT);

                moduleConnector.__test.linkFunctions.type(MDTPD, MD)(modules);
            });

            it('findLinkedStatement', function(){
                var data = moduleConnector.__test.findLinkedStatement(MAGRPLT, 'typedef', MA, modules);

                expect(data.node).toBe(MATPD);
                expect(data.module).toBe(MA);

                data = moduleConnector.__test.findLinkedStatement(MCCU2, 'grouping', MC, modules);

                expect(data.node).toBe(MBGRP);
                expect(data.module).toBe(MB);
            });

            it('findLinkedStatement - missing module', function(){
                modules.splice(modules.indexOf(MC), 1);
                var data = moduleConnector.__test.findLinkedStatement(MCCU1, 'grouping', MC, modules);

                expect(data.node).toBe(null);
                expect(data.module).toBe(null);
            });

            it('appendChildren', function(){
                var oldLength = MDC.children.length;
                moduleConnector.__test.appendChildren(MDC, MBGRP);
                expect(MDC.children.length).toBe(oldLength+MBGRP.children.length);
            });

            it('searchModule', function(){
                var moduleNameRev = moduleConnector.__test.searchModule(modules, MA._name, MA._revision),
                    moduleNAme = moduleConnector.__test.searchModule(modules, MA._name),
                    moduleNonExist = moduleConnector.__test.searchModule(modules, 'X', 'RX');

                expect(moduleNameRev).toBe(MA);
                expect(moduleNAme).toBe(MA);
                expect(moduleNonExist).toBe(null);
            });

            it('applyLinks', function(){
                moduleConnector.__test.applyLinks(MCC, MC, modules);
                expect(MCC.children.length).toBe(3);
                expect(MCC.children[0]).toBe(MCGRP1L);
                expect(MCC.children[1]).toBe(MBGRPL);
                expect(MCC.children[2]).toBe(MAGRPL);
            });

            it('interConnectModules', function(){
                var connectedModules = moduleConnector.__test.interConnectModules(modules);
                expect(connectedModules.length).toBe(4);
                expect(connectedModules[2]).toBe(MC);

                var mcRoots = MC.getRoots();
                expect(mcRoots.length).toBe(1);
                expect(mcRoots[0].label).toBe(MCC.label);
                expect(mcRoots[0].type).toBe(MCC.type);
                expect(mcRoots[0].module).toBe(MC._name);
                expect(mcRoots[0].nodeType).toBe(MCC.nodeType);

                expect(mcRoots[0].children[0].label).toBe(MCGRP1L.label);
                expect(mcRoots[0].children[0].type).toBe(MCGRP1L.type);
                expect(mcRoots[0].children[0].module).toBe(MC._name);
                expect(mcRoots[0].children[0].nodeType).toBe(MCGRP1L.nodeType);

                expect(mcRoots[0].children[1].label).toBe(MBGRPL.label);
                expect(mcRoots[0].children[1].type).toBe(MBGRPL.type);
                expect(mcRoots[0].children[1].module).toBe(MC._name);
                expect(mcRoots[0].children[1].nodeType).toBe(MBGRPL.nodeType);

                expect(mcRoots[0].children[2].label).toBe(MAGRPL.label);
                expect(mcRoots[0].children[2].type).toBe(MAGRPL.type);
                expect(mcRoots[0].children[2].module).toBe(MC._name);
                expect(mcRoots[0].children[2].nodeType).toBe(MAGRPL.nodeType);
            });

            it('applyModuleName', function(){
                var appliedNode = moduleConnector.__test.applyModuleName(MCC, MA._name);
                expect(appliedNode.module).toBe(MA._name);
            });

            it('processModuleObjs', function(){
                var data = moduleConnector.processModuleObjs(modules);
                expect(data.rootNodes.length).toBe(3);
                expect(data.augments.length).toBe(1);
            });
        });

        describe('yinParser', function(){

            var yinParser, yangParser, testProvider, pathUtils, $httpBackend, $timeout;

            beforeEach(angular.mock.inject(function(_yinParser_, _pathUtils_, _$timeout_, _$httpBackend_){
                $timeout = _$timeout_;
                yinParser = _yinParser_;
                $httpBackend = _$httpBackend_;
                testProvider = yinParser.__test;
                pathUtils = _pathUtils_;

                yangParser = testProvider.yangParser;
                yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
            }));

            afterEach(function() {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it('parentTag', function() {
                var dummyXml = document.createElement('module'),
                    dummyNodeA = document.createElement('A'),
                    dummyNodeB = document.createElement('B'),
                    dummyNodeC = document.createElement('C');

                dummyNodeB.appendChild(dummyNodeC);
                dummyNodeA.appendChild(dummyNodeB);
                dummyXml.appendChild(dummyNodeA);

                expect(testProvider.parentTag($(dummyNodeA))).toBe(dummyXml);
                expect(testProvider.parentTag($(dummyNodeB))).toBe(dummyXml);
                expect(testProvider.parentTag($(dummyNodeC))).toBe(dummyXml);
            });

            // it('isBuildInType', function() {
            //     expect(testProvider.isBuildInType('string')).toBe(true);
            //     expect(testProvider.isBuildInType('derived:type')).toBe(false);
            // });

            describe('Module', function() {
                var module;

                beforeEach(function() {
                    module = yangParser.moduleObj;
                });

                it('getRoots', function() {
                    var node = yangParser.createNewNode('P', 'T', module, 1),
                        roots = module.getRoots();

                    expect(roots.length).toBe(1);
                    expect(roots[0]).toBe(node);
                });

                it('getImportByPrefix', function() {
                    var prefix = 'pref';
                    expect(module.getImportByPrefix(prefix)).toBe(null);
                    
                    var node = yangParser.createNewNode('P', 'import', module, 1);
                    node._prefix = prefix;

                    expect(module.getImportByPrefix(prefix)).toBe(node);
                });

                it('getRawAugments', function() {
                    var node = yangParser.createNewNode('P', 'augment', module, constants.NODE_ALTER),
                        augs = module.getRawAugments();

                    expect(augs.length).toBe(1);
                    expect(augs[0]).toBe(node);
                });

                it('getAugments', function() {
                    var node = yangParser.createNewNode('P', 'augment', module, constants.NODE_ALTER);

                    node.pathString = '';
                    augs = module.getAugments();

                    expect(augs.length).toBe(1);
                    expect(augs[0] instanceof testProvider.Augmentation).toBe(true);
                });

                it('addChild', function() {
                    var aug = yangParser.createNewNode('P', 'augment', module, constants.NODE_ALTER),
                        root = yangParser.createNewNode('P', 'T', module, constants.NODE_UI_DISPLAY);

                    expect(module._statements.hasOwnProperty('augment')).toBe(true);
                    expect(module._statements.augment.length).toBe(1);
                    expect(module._augments.length).toBe(1);
                    expect(module._augments[0]).toBe(module._statements.augment[0]);
                    expect(module._augments[0]).toBe(aug);
                    expect(module._statements.augment[0]).toBe(aug);
                    
                    expect(module._statements.hasOwnProperty('T')).toBe(true);
                    expect(module._statements.T.length).toBe(1);
                    expect(module._roots.length).toBe(1);
                    expect(module._roots[0]).toBe(module._statements.T[0]);
                    expect(module._roots[0]).toBe(root);
                    expect(module._statements.T[0]).toBe(root);

                    module.addChild(root);
                    expect(module._statements.T.length).toBe(1);
                    expect(module._roots.length).toBe(1);
                    expect(module._roots[0]).toBe(root);
                    expect(module._statements.T[0]).toBe(root);
                });

                it('searchNode', function() {
                    var n1 = yangParser.createNewNode('P1', 'augment', module, constants.NODE_ALTER),
                        n2 = yangParser.createNewNode('P2', 'T1', module, constants.NODE_UI_DISPLAY),
                        n3 = yangParser.createNewNode('P3', 'T2', module, constants.NODE_UI_DISPLAY),
                        n3dup = yangParser.createNewNode('P3', 'T2', module, constants.NODE_ALTER),
                        n4 = yangParser.createNewNode('P4', 'T3', module, constants.NODE_UI_DISPLAY),
                        searchValid = module.searchNode('T1', 'P2'),
                        searchBadType = module.searchNode('T4', 'P2'),
                        searchBadName = module.searchNode('T3', 'P2'),
                        searchBadNameType = module.searchNode('X', 'Y'),
                        searchUndef = module.searchNode(),
                        searchDup = module.searchNode('T2', 'P3');

                    expect(searchValid).toBe(n2);
                    expect(searchBadType).toBe(null);
                    expect(searchBadName).toBe(null);
                    expect(searchBadNameType).toBe(null);
                    expect(searchUndef).toBe(null);
                    expect(searchDup).toBe(null);
                });

                // addChild 
                // searchNode
            });

            describe('Node', function() {
                var node;

                beforeEach(function() {
                    node = yangParser.createNewNode('N', 'T', null, 0);
                });

                it('appendTo', function() {
                    var parent = yangParser.createNewNode('P', 'T', null, 0);
                    node.appendTo(parent);
                    expect(parent.children[0]).toBe(node);
                });

                it('deepCopy', function() {
                    var copy = node.deepCopy();
                    nodesEqual(node, copy);
                });

                it('getChildren', function() {
                    var childA = yangParser.createNewNode('CHA', 'T1', node, 1),
                        childB = yangParser.createNewNode('CHB', 'T2', node, 0),
                        childC = yangParser.createNewNode('CHC', 'T3', node, 0),
                        filter;

                    expect(node.getChildren('T1')[0]).toBe(childA);
                    expect(node.getChildren(null, 'CHB')[0]).toBe(childB);
                    
                    filter = node.getChildren(null, null, 0);
                    expect(filter.length).toBe(2);
                    expect(filter[0]).toBe(childB);
                    expect(filter[1]).toBe(childC);

                    filter = node.getChildren(null, null, 0, 'label');
                    expect(filter.length).toBe(2);
                    expect(filter[0]).toBe(childB.label);
                    expect(filter[1]).toBe(childC.label);
                });
            });

            describe('Augmentation', function() {
                var node, augNode, augmentation, yangParser;

                beforeEach(function() {
                    yangParser = yinParser.__test.yangParser;
                    augNode = yangParser.createNewNode('A', 'AUG', null, 0);
                    node = yangParser.createNewNode('N', 'T', augNode, 0);
                    augNode.path = [new pathUtils.__test.PathElem('NA', 'MA'),
                                    new pathUtils.__test.PathElem('NB', 'MA'),
                                    new pathUtils.__test.PathElem('NC', 'MB')];
                    augmentation = new yinParser.__test.Augmentation(augNode);
                });

                it('constructor without node.path', function() {
                    var node = yangParser.createNewNode('N', 'T', augNode, 0),
                        augmentationWOPath = new yinParser.__test.Augmentation(node);

                    expect(augmentationWOPath.hasOwnProperty('path')).toBe(true);
                    expect(augmentationWOPath.path.length).toBe(0);
                });

                it('apply', function() {
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('MA', 'R', 'NS'));
                    var NP1 = yangParser.createNewNode('NA', 'T', null, 0),
                        N1 = yangParser.createNewNode('NB', 'T', NP1, 0);
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('MB', 'R', 'NS'));
                    var N2 = yangParser.createNewNode('NC', 'T', N1, 0),
                        NP2 = yangParser.createNewNode('ND', 'T', null, 0);

                    augmentation.apply([NP1, NP2]);
                    expect(N2.children.length).toBe(1);
                    expect(N2.children[0]).toBe(node);

                    N2.children = [];
                    augmentation.path = [new pathUtils.__test.PathElem('NA', 'MA'),
                                         new pathUtils.__test.PathElem('NB', 'MA'),
                                         new pathUtils.__test.PathElem('NC', 'MA')];
                    augmentation.apply([NP1, NP2]);
                    expect(N2.children.length).toBe(0);
                });

                it('getTargetNodeToAugment', function() {
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('MA', 'R', 'NS'));
                    var NP1 = yangParser.createNewNode('NA', 'T', null, 0),
                        N1 = yangParser.createNewNode('NB', 'T', NP1, 0);
                    yangParser.setCurrentModuleObj(new yinParser.__test.Module('MB', 'R', 'NS'));
                    var N2 = yangParser.createNewNode('NC', 'T', N1, 0),
                        NP2 = yangParser.createNewNode('ND', 'T', null, 0);

                    var target = augmentation.getTargetNodeToAugment([NP1, NP2]);
                    expect(target).toBe(N2);
                });

                it('getPathString', function() {
                    expect(augmentation.getPathString()).toBe('MA:NA/MA:NB/MB:NC');
                });
            });

            it('parseYang', function() {
                var dummyModule = 'dummy-module',
                    mockURL = '/'+dummyModule+'.yang.xml',
                    xmlString = '<module name="'+dummyModule+'">' +
                                '   <namespace uri="dummyNS"/>' +
                                '   <container name="CA">' +
                                '       <container name="CB">' +
                                '           <container name="CC">' +
                                '               <leaf name="LA">' +
                                '               </leaf>' +
                                '           </container>' +
                                '           <leaf name="LB">' +
                                '           </leaf>' +
                                '           <leaf name="LC">' +
                                '           </leaf>' +
                                '       </container>' +
                                '       <leaf name="LD">' +
                                '       </leaf>' +
                                '   </container>' +
                                '</module>',
                    parseResult;

                $httpBackend.when('GET', testProvider.path+mockURL).respond(xmlString);

                yinParser.parse(mockURL, function(result) {
                    parseResult = result;
                });
                
                $httpBackend.flush();

                expect(parseResult._name).toBe(dummyModule);
                expect(parseResult._namespace).toBe('dummyNS');
                expect(parseResult._revision).toBe(undefined);

                var CA = parseResult._statements.container[0];
                expect(CA.label).toBe('CA');
                expect(CA.type).toBe('container');
                expect(CA.children.length).toBe(2);

                var child = CA.children[0];
                expect(child.label).toBe('CB');
                expect(child.type).toBe('container');
                expect(child.children.length).toBe(3);

                child = child.children[0];
                expect(child.label).toBe('CC');
                expect(child.type).toBe('container');
                expect(child.children.length).toBe(1);

                child = child.children[0];
                expect(child.label).toBe('LA');
                expect(child.type).toBe('leaf');
                expect(child.children.length).toBe(0);
            });

            it('parseYang - error', function() {
                var dummyModule = 'dummy-module',
                    mockURL = '/'+dummyModule+'.yang.xml',
                    parseResult = false;

                $httpBackend.when('GET', testProvider.path+mockURL).respond(404);

                yinParser.parse(mockURL, function(result) {
                }, function() {
                    parseResult = true;
                });

                $httpBackend.flush();
                expect(parseResult).toBe(true);
            });

            describe('yangParser', function(){
                var parserProvider, module, name, type, revision;

                var checkNode = function(node, id, name, type, module, childrenCount, childrenObj) {
                    expect(node.id).toBe(id);
                    expect(node.label).toBe(name);
                    expect(node.localeLabel).toBe('YANGUI_'+name.toUpperCase());
                    expect(node.type).toBe(type);
                    expect(node.module).toBe(module);
                    expect(node.children.length).toBe(childrenCount);

                    for(var index in childrenObj) {
                        expect(node.children[index]).toBe(childrenObj[index]);
                    }
                };

                beforeEach(function() {
                    module = 'dummyModule';
                    name = 'dummyName';
                    type = 'dummyType';
                    revision = '1-1-1';

                    parserProvider = testProvider.yangParser;
                    parserProvider.setCurrentModuleObj(new yinParser.__test.Module(module, revision, 'NS'));
                });

                it('setCurrentModuleObj', function() {
                    expect(parserProvider.moduleObj._name).toBe(module);
                    expect(parserProvider.moduleObj._revision).toBe(revision);
                    expect(parserProvider.moduleObj._namespace).toBe('NS');
                });

                it('createNewNode', function() {
                    var node = parserProvider.createNewNode(name, type, parserProvider.moduleObj, constants.NODE_UI_DISPLAY);
                    var childNode = parserProvider.createNewNode(name, type, node, constants.NODE_UI_DISPLAY);

                    expect(parserProvider.moduleObj._statements[type][0]).toBe(node);
                    checkNode(node, 0, name, type, module, 1, {'0': childNode});
                });

                it('parse', function() {
                    var xmlString = '<module name="'+module+'">' +
                                '   <grouping name="GA">' +
                                '       <leaf name="GLA">' +
                                '       </leaf>' +
                                '   </grouping>' +
                                '   <leaf name="LA">' +
                                '   </leaf>' +
                                '   <container name="CA">' +
                                '   </container>' +
                                '   <list name="LiA">' +
                                '   </list>' +
                                '   <choice name="ChA">' +
                                '   </choice>' +
                                '   <uses name="GA">' +
                                '   </uses>' +
                                '</module>';

                    parserProvider.parse(xmlString, parserProvider.moduleObj);
                    expect(parserProvider.moduleObj._statements.grouping.length).toBe(1);
                    expect(parserProvider.moduleObj._statements.leaf.length).toBe(1);
                    expect(parserProvider.moduleObj._statements.container.length).toBe(1);
                    expect(parserProvider.moduleObj._statements.list.length).toBe(1);
                    expect(parserProvider.moduleObj._statements.choice.length).toBe(1);
                    expect(parserProvider.moduleObj._statements.uses.length).toBe(1);

                    checkNode(parserProvider.moduleObj._statements.grouping[0], 0, 'GA', 'grouping', module, 1, {});
                    checkNode(parserProvider.moduleObj._statements.leaf[0], 2, 'LA', 'leaf', module, 0, {});
                    checkNode(parserProvider.moduleObj._statements.container[0], 3, 'CA', 'container', module, 0, {});
                    checkNode(parserProvider.moduleObj._statements.list[0], 4, 'LiA', 'list', module, 0, {});
                    checkNode(parserProvider.moduleObj._statements.choice[0], 5, 'ChA', 'choice', module, 0, {});
                    checkNode(parserProvider.moduleObj._statements.uses[0], 6, 'GA', 'uses', module, 0, {});
                });

                it('leaf', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<leaf name="LA"></leaf>';

                    parserProvider.leaf(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LA', 'leaf', node.module, 0, {});
                });

                it('leaf-list', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<leaf-list name="LA"></leaf>';

                    parserProvider['leaf-list'](xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LA', 'leaf-list', node.module, 0, {});
                });

                it('container', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<container name="CA"></container>';

                    parserProvider.container(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'CA', 'container', node.module, 0, {});
                });

                it('choice', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<choice name="ChiA"><case name="CA"></case></choice>';

                    parserProvider.choice(xmlString, node);
                    expect(node.children.length).toBe(1);

                    var choiceNode = node.children[0];
                    checkNode(choiceNode, 1, 'ChiA', 'choice', node.module, 1, {});
                    checkNode(choiceNode.children[0], 2, 'CA', 'case', node.module, 0, {});
                });

                it('case', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<case name="CA"></case>';

                    parserProvider.case(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'CA', 'case', node.module, 0, {});
                });

                it('list', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<list name="LiA"></list>';

                    parserProvider.list(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LiA', 'list', node.module, 0, {});
                });

                it('key', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<key value="id"/>';

                    parserProvider.key(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'id', 'key', node.module, 0, {});
                });

                it('rpc', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<rpc name="reset"></rpc>';

                    parserProvider.rpc(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'reset', 'rpc', node.module, 0, {});
                });

                it('input', function() {
                    var xmlString = '<input></input>',
                        node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY);

                    parserProvider.input(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'input', 'input', node.module, 0, {});
                });

                it('output', function() {
                    var xmlString = '<output></output>',
                        node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY);

                    parserProvider.output(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'output', 'output', node.module, 0, {});
                });

                it('import', function(){
                    var node = parserProvider.createNewNode(name, type, parserProvider.moduleObj, constants.NODE_UI_DISPLAY),
                        xmlString = '<import module="A">' +
                                        '<prefix value="Apref"/>' +
                                        '<revision-date date="2013-11-26"/>' +
                                    '</import>';

                    parserProvider.import(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'A', 'import', parserProvider.moduleObj._name, 0, {});
                });

                it('grouping', function() {
                    var node = parserProvider.createNewNode(name, type, parserProvider.moduleObj, constants.NODE_UI_DISPLAY),
                        xmlString = '<grouping name="GA"><leaf name="LA"></leaf></grouping>';

                    parserProvider.grouping(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'GA', 'grouping', node.module, 1, {});
                });

                it('uses', function() {
                    var node = parserProvider.createNewNode(name, type, parserProvider.moduleObj, constants.NODE_UI_DISPLAY),
                        xmlString = '<module name="MA">' +
                                    '   <grouping name="GA">' +
                                    '       <leaf name ="LA"></leaf>' +
                                    '   </grouping>' +
                                    '   <uses name="GA"/>' +
                                    '</module>',
                        usesXmlPart = $(xmlString).children('uses:first')[0];

                    parserProvider.uses(usesXmlPart, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'GA', 'uses', node.module, 0, {});
                });

                it('augment', function(){
                    var ident = 'IDENTIFIER',
                        xmlString = '<module name="MA">' +
                                    '   <import module="MB">' +
                                    '       <prefix value="prefMB"/>' +
                                    '   </import>' +
                                    '   <augment target-node="/prefMB:N1/prefMB:N2">' +
                                    '       <leaf name="L"></leaf>' +
                                    '   </augment>' +
                                    '</module>',
                        xmlStringIdent = '<module name="MA"' +
                                         '        xmlns:ext="urn:opendaylight:yang:extension:yang-ext">' +
                                         '   <import module="MB">' +
                                         '       <prefix value="prefMB"/>' +
                                         '   </import>' +
                                         '   <augment target-node="/prefMB:N1/prefMB:N2">' +
                                         '       <ext:augment-identifier identifier="'+ident+'"/>' +
                                         '       <leaf name="L"></leaf>' +
                                         '   </augment>' +
                                         '</module>';

                    parserProvider.augment($(xmlString).children('augment:first'), parserProvider.moduleObj);
                    var augments = parserProvider.moduleObj.getRawAugments();

                    expect(augments.length).toBe(1);
                    checkNode(augments[0], 0, 'augment1', 'augment', parserProvider.moduleObj._name, 1, {});

                    parserProvider.augment($($.parseXML(xmlStringIdent).documentElement).children('augment:first'), parserProvider.moduleObj);
                    var augmentIdent = parserProvider.moduleObj.getRawAugments()[1];

                    checkNode(augmentIdent, 2, ident, 'augment', parserProvider.moduleObj._name, 1, {});
                });

                it('description', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<description><text>dummy text</text></description>';

                    parserProvider.description(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'dummy text', 'description', node.module, 0, {});
                });

                it('pattern', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_ALTER),
                        xmlString = '<pattern value="dummyRegexp"></pattern>';

                    parserProvider.pattern(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'dummyRegexp', 'pattern', node.module, 0, {});
                });

                it('range', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_ALTER),
                        xmlString = '<range value="10..20"></range>';

                    parserProvider.range(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, '10..20', 'range', node.module, 0, {});
                });

                it('length', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_ALTER),
                        xmlString = '<length value="10..20"></length>';

                    parserProvider.length(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, '10..20', 'length', node.module, 0, {});
                });

                it('enum', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_ALTER),
                        xmlString = '<enum name="unknown"><value value="0"/></enum>';

                    parserProvider.enum(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'unknown', 'enum', node.module, 0, {});
                });

                it('bit', function() {
                   var node = parserProvider.createNewNode(name, type, null, constants.NODE_ALTER),
                        xmlString = '<bit name="overload"><position value="0"/></bit>';

                    parserProvider.bit(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'overload', 'bit', node.module, 1, {});
                });

                it('position', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_ALTER),
                        xmlString = '<position value="0"/>';

                    parserProvider.position(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, '0', 'position', node.module, 0, {});
                });

                it('typedef', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<typedef name="td"></typedef>';

                    parserProvider.typedef(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'td', 'typedef', node.module, 0, {});
                });

                it('type', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<type name="string"></type>';

                    parserProvider.type(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'string', 'type', node.module, 0, {});
                });

            });

        });

    });

});