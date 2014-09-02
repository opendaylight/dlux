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

            var custFunct, yinParser;

            beforeEach(function(){
                angular.mock.inject(function(_custFunct_, _yinParser_){
                    custFunct = _custFunct_;
                    yinParser = _yinParser_;

                });
            });

            it('createNewFunctionality', function(){
                var node = yinParser.__test.yangParser.createNewNode('flows','leaf', null, constants.NODE_UI_DISPLAY),
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

            it('namespace', function() {
                expect(reqBuilder.namespace).toBe('flow-node-inventory');
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

        describe('yangUtils', function() {

            var yangUtils, yinParser, nodeWrapper, $httpBackend, $timeout, apiConnector;

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
            });

            it('buildRequest', function(){
                var node = yinParser.__test.yangParser.createNewNode('flows','leaf', null, constants.NODE_UI_DISPLAY);
                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(yangUtils.buildRequest)).toBe(true);
                node.value = 'dummyValue';
                var flows = yangUtils.buildRequest(node);
                expect(flows).toBe('dummyValue');

            });

            it('getRequestString', function(){
                var node = yinParser.__test.yangParser.createNewNode('ports','leaf', null, constants.NODE_UI_DISPLAY),
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

            });

            it('processModules', function(){
                var modules = {module: [{ 'name': 'MA'}, { 'name': 'MB'}, { 'name': 'MC'}]},
                    mA = '<module name="MA">' +
                         '   <leaf name="LA"></leaf>' +
                         '</module>',
                    mB = '<module name="MB">' +
                         '   <leaf name="LB"></leaf>' +
                         '</module>',
                    mC = '<module name="MC">' +
                         '   <leaf name="LC"></leaf>' +
                         '</module>',
                    nodes = [];

                $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
                $httpBackend.when('GET', './assets/yang2xml/MB.yang.xml').respond(mB);
                $httpBackend.when('GET', './assets/yang2xml/MC.yang.xml').respond(mC);

                yangUtils.processModules(modules, function(loadedNodes) {
                    nodes = loadedNodes;
                });
                $httpBackend.flush();
                $timeout.flush();
                expect(nodes.length).toBe(3);
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

            it('generateApiTreeData', function(){
                var YangParser = yinParser.__test.yangParser,
                    type = 'leaf',
                    nodeType = 0,
                    subApiPathA = '/config/MA:LA/',
                    subApiPathB = '/config/MA:LB/',
                    apis = [
                        {
                            module: 'MA',
                            revision: 'rev1',
                            basePath: 'dummyPath',
                            subApis : [
                                new apiConnector.__test.SubApi(subApiPathA, ['GET']),
                                new apiConnector.__test.SubApi(subApiPathB, ['PUT'])
                            ]
                        }
                    ],
                    dataTree;

                YangParser.setCurrentModule('MA');
                var nodeMA = YangParser.createNewNode('LA',type, null, nodeType);
                var nodeMB = YangParser.createNewNode('LB',type, null, nodeType);

                nodeWrapper.wrapAll(nodeMA);
                nodeWrapper.wrapAll(nodeMB);

                apiConnector.linkApisToNodes(apis, [nodeMA, nodeMB]);

                yangUtils.generateApiTreeData(apis, function(treeApis) {
                    dataTree = treeApis;

                    expect(dataTree[0].children.length).toBe(1);
                    expect(dataTree[0].children[0].children.length).toBe(2);
                    expect(dataTree[0].label).toBe('config rev.2013-04-05');
                    expect(dataTree[0].children[0].label).toBe('lvl0');
                    expect(dataTree[0].children[0].children[0].identifier).toBe(' {id}');
                });
            });

        });

        describe('apiConnector', function(){

            var apiConnector, pathUtils, yinParser, $httpBackend, $timeout;

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
                var YangParser = yinParser.__test.yangParser,
                    nodeList = [],
                    module = 'M',
                    label = 'L',
                    type = 'T',
                    nodeType = 0;

                YangParser.setCurrentModule(module);

                var expectedNode = YangParser.createNewNode(label, type, null, nodeType);
                nodeList.push(YangParser.createNewNode(label+'1', type, null, nodeType));
                YangParser.setCurrentModule(module+'1');
                nodeList.push(YangParser.createNewNode(label, type, null, nodeType));
                YangParser.setCurrentModule(module);
                nodeList.push(expectedNode);
                nodeList.push(YangParser.createNewNode(label+'2', type, null, nodeType));

                expect(apiConnector.__test.getRootNodeByPath(module, label, nodeList)).toBe(expectedNode);
            });

            it('processApis', function(){
                var hostPort = 'localhost:8080',
                    baseUrl = hostPort+'/restconf',
                    apis =  [{path: hostPort+'/apidoc/apis/MA(rev1)'},
                             {path: hostPort+'/apidoc/apis/MB(rev2)'}],
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
                var YangParser = yinParser.__test.yangParser,
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

                YangParser.setCurrentModule('MA');
                var nodeMA = YangParser.createNewNode('LA',type, null, nodeType);
                YangParser.setCurrentModule('MB');
                var nodeMB = YangParser.createNewNode('LB',type, null, nodeType);

                nodes.push(nodeMA);
                nodes.push(nodeMB);

                linkedApis = apiConnector.linkApisToNodes(apis, nodes);

                expect(linkedApis[0].subApis[0].node).toBe(nodeMA);
                expect(linkedApis[1].subApis[0].node).toBe(nodeMB);
            });
        });

        describe('nodeWrapper', function(){

            var propName = 'test:elementName',
                elemName = 'elementName',
                nodeWrapper,
                yinParser,
                reqBuilder;

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

                angular.mock.inject(function(_nodeWrapper_) {
                    nodeWrapper = _nodeWrapper_;
                });

                angular.mock.inject(function(_yinParser_) {
                    yinParser = _yinParser_;
                });

                angular.mock.inject(function(_reqBuilder_) {
                    reqBuilder = _reqBuilder_;
                });

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
                        'm:id': 1,
                        'm:name': 'A',
                        'attr': 'X'
                    },
                    dataD = {
                        'm:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    yangParser = yinParser.__test.yangParser,
                    refKey;

                yangParser.setCurrentModule('m');
                yangParser.setCurrentNamespace('urn:nsa:ns1');
                yangParser.setModuleRevision('1');

                refKey = [yangParser.createNewNode('id', 'dummy', null, 0), yangParser.createNewNode('name', 'dummy', null, 0)];

                expect(nodeWrapper.__test.equalListElems(dataA, dataB, refKey)).toBe(true);
                expect(nodeWrapper.__test.equalListElems(dataA, dataC, refKey)).toBe(true);
                expect(nodeWrapper.__test.equalListElems(dataA, dataD, refKey)).toBe(false);
                expect(nodeWrapper.__test.equalListElems(dataC, dataD, refKey)).toBe(false);
            });

            it('checkListElemKeys', function(){
                var listData = [],
                    yangParser = yinParser.__test.yangParser,
                    refKey,
                    duplicates;
                // checkListElemKeys(listData, refKey)
                yangParser.setCurrentModule('m');
                yangParser.setCurrentNamespace('urn:nsa:ns1');
                yangParser.setModuleRevision('1');

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
                        'm:id': 1,
                        'm:name': 'B',
                        'attr': 'X'
                    },
                    {
                        'm:id': 2,
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
                        'm:id': 1,
                        'm:name': 'A',
                        'attr': 'X'
                    },
                    {
                        'm:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    {
                        'm:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    {
                        'm:id': 1,
                        'name': 'B',
                        'attr': 'X'
                    },
                    {
                        'm:id': 2,
                        'name': 'B',
                        'attr': 'X'
                    }
                ];

                expect(nodeWrapper.__test.checkListElemKeys(listData, refKey).length).toBe(6);
            });

            describe('leaf', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;


                beforeEach(function() {

                    node = yinParser.__test.yangParser.createNewNode('ports','leaf',null, constants.NODE_UI_DISPLAY);

                });


                it('buildRequest', function(){

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    node.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });
                

                it('fill', function(){

                    var data = 'dummyData';

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);
                    propName = 'dummyProp:ports';
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

            });

            describe('container', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {

                    node = yinParser.__test.yangParser.createNewNode('ports','container',null, constants.NODE_UI_DISPLAY);

                });

                it('toggleExpand', function(){

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.toggleExpand)).toBe(true);
                    node.toggleExpand();
                    expect(node.expanded).toBe(true);

                });

                it('buildRequest', function(){

                    var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','container', node, constants.NODE_UI_DISPLAY),
                        nodeChildThird = yinParser.__test.yangParser.createNewNode('ports','leaf', nodeChildSec, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                        expect(angular.isFunction(node.buildRequest)).toBe(true);
                        expect(node.buildRequest(reqBuilder, req)).toBe(false);
                        nodeChildThird.value = 'dummyTest';
                        expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('clear', function(){

                    var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','container', node, constants.NODE_UI_DISPLAY);

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
                        nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.fill)).toBe(true);
                    match = node.fill(propName, data);
                    expect(match).toBe(false);

                    propName = 'dummyProp:ports';
                    match = node.fill(propName,data);
                    expect(match).toBe(true);
                    expect(nodeChild.value).toBe('dummyData');      

                });

            });

            describe('case', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {

                    node = yinParser.__test.yangParser.createNewNode('ports','case',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){

                    var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','case', node, constants.NODE_UI_DISPLAY),
                        nodeChildThird = yinParser.__test.yangParser.createNewNode('ports','leaf', nodeChildSec, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChildThird.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('fill', function(){

                    var data = 'dummyData',
                        filled,
                        nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY);

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

                    var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
                        nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','case', node, constants.NODE_UI_DISPLAY);

                    nodeWrapper.wrapAll(node);
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChild.value = 'dummyValue';
                    nodeChildSec.value = 'dummyValueSec';
                    node.clear();
                    expect(nodeChild.value).toBe('');
                    expect(nodeChildSec.value).toBe('dummyValueSec');   

                }); 

            });

            describe('choice', function(){

                var req = {},
                    propName = 'test:elementName',
                    elemName = 'elementName',
                    match,
                    node;

                beforeEach(function() {

                    node = yinParser.__test.yangParser.createNewNode('ports','choice',null, constants.NODE_UI_DISPLAY);

                });

                it('buildRequest', function(){

                    nodeWrapper.wrapAll(node);
                    node.choice =  yinParser.__test.yangParser.createNewNode('ports','case', null, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(node.choice);
                    
                    var nodeChoiceChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node.choice, constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(nodeChoiceChild);
                    expect(angular.isFunction(node.buildRequest)).toBe(true);
                    expect(node.buildRequest(reqBuilder, req)).toBe(false);
                    nodeChoiceChild.value = 'dummyTest';
                    expect(node.buildRequest(reqBuilder, req)).toBe(true);

                });

                it('fill', function(){

                    var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node, constants.NODE_UI_DISPLAY),
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
                    yinParser.__test.yangParser.createNewNode('ports','case', node, constants.NODE_UI_DISPLAY);
                    node.choice = node.children[0];
                    nodeWrapper.wrapAll(node.choice);

                    var nodeChoiceChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node.children[0], constants.NODE_UI_DISPLAY);
                    nodeWrapper.wrapAll(nodeChoiceChild);
                            
                    expect(angular.isFunction(node.clear)).toBe(true);
                    nodeChoiceChild.value = 'dummyValueSec';
                    node.clear();
                    expect(nodeChoiceChild.value).toBe('');
                    expect(node.choice).toBe(null);

                });

            });

            describe('list', function(){
                var node, nodeChildLeaf, nodeChildContainer, containerChildLeaf;

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
                        // console.info('comparing prop '+prop+': '+aPropToTest+' to '+bPropToTest+' === '+match);
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

                beforeEach(function() {
                    node = yinParser.__test.yangParser.createNewNode('LiA','list',null, constants.NODE_UI_DISPLAY);
                    nodeChildLeaf = yinParser.__test.yangParser.createNewNode('LA','leaf', node, constants.NODE_UI_DISPLAY);
                    nodeChildContainer = yinParser.__test.yangParser.createNewNode('CA','container', node, constants.NODE_UI_DISPLAY);
                    containerChildLeaf = yinParser.__test.yangParser.createNewNode('LB','leaf', nodeChildContainer, constants.NODE_UI_DISPLAY);

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

                    expect(node.actElemIndex === node.listData.length - 1).toBe(true);
                    node.removeListElem(node.listData[0]);
                    expect(node.actElemIndex === node.listData.length - 1).toBe(true);
                    
                    var elemToDelete = node.listData[0]; 
                    
                    node.actElemIndex = 0;
                    node.removeListElem(elemToDelete);
                    expect(node.actElemIndex === node.listData.length - 1).toBe(true);
                    expect(node.actElemIndex === 0).toBe(false);
                });

                it('buildRequest', function(){
                    var dummyReq = reqBuilder.createObj(),
                        added,
                        dummyValueA = 'dummyValueA',
                        dummyValueB = 'dummyValueB',
                        expectedReq = {},
                        LA = node.children[0],
                        CA = node.children[1],
                        LB = CA.children[0];

                    added = node.buildRequest(reqBuilder, dummyReq);
                    
                    expect(added).toBe(false);
                    expect($.isEmptyObject(dummyReq)).toBe(true);
                    reqsEqual(dummyReq, expectedReq);

                    node.addListElem();
                    added = node.buildRequest(reqBuilder, dummyReq);
                    
                    expect(added).toBe(false);
                    expect($.isEmptyObject(dummyReq)).toBe(true);
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
            });

            describe('listElem', function(){
                var node, dummyValueA, dummyValueB, dummyReq;

                    beforeEach(function() {
                        node = yinParser.__test.yangParser.createNewNode('LiA','list',null, constants.NODE_UI_DISPLAY);

                        yinParser.__test.yangParser.createNewNode('LA','leaf', node, constants.NODE_UI_DISPLAY);
                        yinParser.__test.yangParser.createNewNode('LB','leaf', node, constants.NODE_UI_DISPLAY);

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

                    var node = yinParser.__test.yangParser.createNewNode('MA','leaf',null, constants.NODE_UI_DISPLAY),
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

                var conNode = yinParser.__test.yangParser.createNewNode('portsList','container', null, constants.NODE_UI_DISPLAY),
                    parentNode = yinParser.__test.yangParser.createNewNode('portsList','list', conNode, constants.NODE_UI_DISPLAY),
                    node = yinParser.__test.yangParser.createNewNode('ports','leaf', parentNode, constants.NODE_UI_DISPLAY),
                    nodeSec = yinParser.__test.yangParser.createNewNode('searchElem','leaf', conNode, constants.NODE_UI_DISPLAY),
                    pathElem = new pathUtils.__test.PathElem('..', 'A1'),
                    pathElemSec = new pathUtils.__test.PathElem('..', 'A1'),
                    pathElemFinal = new pathUtils.__test.PathElem('searchElem', 'A1'),
                    selNode;

                nodeWrapper.wrapAll(parentNode);
                nodeWrapper.wrapAll(conNode);
                nodeWrapper.wrapAll(node);
                nodeWrapper.wrapAll(nodeSec);
                nodeSec.module = 'A1';
                selNode = pathUtils.search(node, [pathElem, pathElemSec, pathElemFinal]);
                expect(selNode.label).toBe('searchElem');

            });

            it('translate', function(){

                var pathString = '../path/element',
                    pathElems,
                    elemsNames,
                    elemsModulesNames;

                pathElems = pathUtils.translate(pathString);
                elemsNames = pathElems.map(function(item, index){
                    return item.name;
                });
                expect(elemsNames[0]).toBe('..');
                expect(elemsNames[1]).toBe('path');
                expect(elemsNames[2]).toBe('element');

                pathString = '/config:ports/config:port';
                pathElems = pathUtils.translate(pathString);
                elemsModulesNames = pathElems.map(function(item, index){
                    return {
                        name: item.name,
                        module: item.module
                    };
                });

                expect(elemsModulesNames[0].name).toBe('ports');
                expect(elemsModulesNames[0].module).toBe('config');
                expect(elemsModulesNames[1].name).toBe('port');
                expect(elemsModulesNames[1].module).toBe('config');

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

        describe('yinParser', function(){

            var yinParser, testProvider, pathUtils, $httpBackend, $timeout;

            beforeEach(angular.mock.inject(function(_yinParser_, _pathUtils_, _$timeout_, _$httpBackend_){
                $timeout = _$timeout_;
                yinParser = _yinParser_;
                $httpBackend = _$httpBackend_;
                testProvider = yinParser.__test;
                pathUtils = _pathUtils_;
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
                    parseResult = result[0];
                });
                
                $httpBackend.flush();

                expect(parseResult.label).toBe('CA');
                expect(parseResult.type).toBe('container');
                expect(parseResult.children.length).toBe(2);

                var child = parseResult.children[0];
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

            describe('yangParser', function(){
                var parserProvider, module, name, type;

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
                    parserProvider = testProvider.yangParser;
                    module = 'dummyModule';
                    name = 'dummyName';
                    type = 'dummyType';
                });


                it('setCurrentModule', function() {
                    parserProvider.setCurrentModule(module);
                    expect(parserProvider.currentModule).toBe(module);
                });

                it('createNewNode', function() {
                    parserProvider.setCurrentModule(module);

                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY);
                    var childNode = parserProvider.createNewNode(name, type, node, constants.NODE_UI_DISPLAY);

                    expect(parserProvider.rootNodes[0]).toBe(node);
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

                    parserProvider.setCurrentModule(module);

                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY);

                    parserProvider.parse(xmlString, node);
                    checkNode(node, 0, name, type, module, 5, {});
                    checkNode(node.children[0], 1, 'LA', 'leaf', module, 0, {});
                    checkNode(node.children[1], 2, 'CA', 'container', module, 0, {});
                    checkNode(node.children[2], 3, 'LiA', 'list', module, 0, {});
                    checkNode(node.children[3], 4, 'ChA', 'choice', module, 0, {});
                    checkNode(node.children[4], 5, 'GLA', 'leaf', module, 0, {});
                });

                it('leaf', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<leaf name="LA"></leaf>';

                    parserProvider.leaf(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LA', 'leaf', node.module, 0, {});
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

                it('rpc', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<rpc name="reset"></rpc>';

                    parserProvider.rpc(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'reset', 'rpc', node.module, 0, {});
                });

                it('input', function() {
                    var xmlString = '<input></input>',
                        name = 'input',
                        node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY);

                    parserProvider.input(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'input', 'input', node.module, 0, {});
                });

                it('output', function() {
                    var xmlString = '<output></output>',
                        name = 'output',
                        node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY);

                    parserProvider.output(xmlString, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'output', 'output', node.module, 0, {});
                });

                it('_namespace', function(){
                    var xmlString = '<module name="augment-container">' +
                                        '<namespace uri="ns:augment:container"/>' +
                                    '</module>',
                        namespace;

                    namespace = parserProvider._namespace(xmlString, true);
                    expect(namespace).toBe('augment-container');
                });

                it('_revision', function(){
                    var xmlString = '<module name="augment-container">' +
                                        '<revision date="2013-11-26"/>' +
                                    '</module>',
                        revision;

                    revision = parserProvider._revision(xmlString, true);
                    expect(revision).toBe('2013-11-26');
                });

                it('_grouping', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<module><grouping name="GA"><leaf name="LA"></leaf></grouping></module>';

                    parserProvider._grouping(xmlString, node, 'GA');
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LA', 'leaf', node.module, 0, {});
                });

                it('uses - same module', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        xmlString = '<module name="MA">' +
                                    '   <grouping name="GA">' +
                                    '       <leaf name ="LA"></leaf>' +
                                    '   </grouping>' +
                                    '   <uses name="GA"/>' +
                                    '</module>',
                        usesXmlPart = $(xmlString).children('uses:first')[0];

                    parserProvider.uses(usesXmlPart, node);
                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LA', 'leaf', node.module, 0, {});
                });

                it('uses - different module', function() {
                    var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                        otherModuleName = 'MB',
                        mockURL = '/yang2xml/'+otherModuleName+'.yang.xml',
                        xmlString = '<module name="MA">' +
                                    '   <import module="'+otherModuleName+'">' +
                                    '       <prefix value="prefMB"/>' +
                                    '   </import>' +
                                    '   <grouping name="GA">' +
                                    '       <leaf name ="LA"></leaf>' +
                                    '   </grouping>' +
                                    '   <uses name="prefMB:GB"/>' +
                                    '</module>',
                        xmlStringOtherModule = '<module name="'+otherModuleName+'">' +
                                               '   <grouping name="GB">' +
                                               '       <leaf name ="LB"></leaf>' +
                                               '   </grouping>' +
                                               '</module>';

                    usesXmlPart = $(xmlString).children('uses:first')[0];
                    $httpBackend.when('GET', testProvider.path+mockURL).respond(xmlStringOtherModule);
                    parserProvider.currentModule = 'MA';
                    parserProvider.uses(usesXmlPart, node);

                    $httpBackend.flush();
                    $timeout.flush();

                    expect(node.children.length).toBe(1);
                    checkNode(node.children[0], 1, 'LB', 'leaf', 'MA', 0, {});
                });

                it('augment', function(){

                    var type = 'augment',
                        nodeType = constants.NODE_ALTER,
                        moduleString = '<module name="augment-augment-module"' +
                        'xmlns="urn:ietf:params:xml:ns:yang:yin:1"' +
                        'xmlns:aamodule="augment:augment:module"' +
                        'xmlns:amodule="augment:module"' +
                        'xmlns:imodule="instance:identifier:module">',
                        prefixConverter = function (prefix) {
                            return parserProvider._import(moduleString, prefix).moduleName;
                        },
                        pathString = '/imodule:cont/imodule:list',
                        path = pathUtils.translate(pathString, prefixConverter, 'augment-augment-module'),
                        augmentRoot = parserProvider.createNewNode(pathString, type, null, nodeType),
                        getAugments = [];

                        parserProvider.setCurrentModule('imodule');
                        augmentRoot.path = path;

                    var augCont = parserProvider.createNewNode('cont', 'container', null, constants.NODE_UI_DISPLAY),
                        augList = parserProvider.createNewNode('list', 'list', augCont, constants.NODE_UI_DISPLAY),
                        leafNode = parserProvider.createNewNode('leaf', 'leaf', augmentRoot, constants.NODE_UI_DISPLAY);

                    var augumentObject = new yinParser.__test.Augmentation(augmentRoot);
                    
                    expect(augList.children.length).toBe(0);
                    augumentObject.apply([augCont]);
                    expect(augList.children.length).toBe(1);

                });

            });

        });


    });

});