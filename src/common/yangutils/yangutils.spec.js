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

describe('common.yangUtils', function(){

	beforeEach(angular.mock.module('common.yangUtils'));

	describe('reqBuilder service tests', function() {

		var reqBuilder, testObject, testListArray;

		// executed before each it
		beforeEach(function() {
			// injecting service for testing
			angular.mock.inject(function(_reqBuilder_) {
				reqBuilder = _reqBuilder_;
			});

		});

		it('should have an createList function', function() {
			expect(angular.isFunction(reqBuilder.createList)).toBe(true);
		});

		it('namespace should have value', function() {
			expect(reqBuilder.namespace).toBe('flow-node-inventory');
		});

		it('test for pushing object to array', function() {
			testObject = reqBuilder.createObj();
			testListArray = reqBuilder.createList();

			expect(testListArray.length).toBe(0);
			reqBuilder.insertObjToList(testListArray, testObject);
			expect(testListArray[0]).toBe(testObject);

		});

		it('insertPropertyToObj set to object property with value', function() {

			var testProperty = 'testProp';
			var testValue = 'testValue';

			expect(testObject[testProperty]).toBeUndefined();
			reqBuilder.insertPropertyToObj(testObject, testProperty, testValue);
			expect(testObject[testProperty]).toBe(testValue);

		});

		it('resultToString should return string', function() {

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

	describe('yangUtils service tests', function() {

		var yangUtils, yinParser, nodeWrapper, $httpBackend;

        beforeEach(function() {

            angular.mock.module('common.yangUtils');
            angular.mock.inject(function(_yangUtils_) {
                yangUtils = _yangUtils_;
            });

            angular.mock.inject(function(_yinParser_) {
                yinParser = _yinParser_;
            });

            angular.mock.inject(function(_nodeWrapper_) {
                nodeWrapper = _nodeWrapper_;
            });

        });

		it('processNodes return array of nodes', function() {
            var nodes = [];
			var invData = {
					nodes : {
						node: [
							{id: 1},{id: 2},{id: 3}
						]
					}
				};
		
			expect(angular.isFunction(yangUtils.processNodes)).toBe(true);
			nodes = yangUtils.processNodes(invData.nodes);
			expect(nodes[0]).toEqual(1);
			expect(nodes[1]).toEqual(2);
			expect(nodes[2]).toEqual(3);
			
		});

		it('processFlows return array of flows', function(){
            var flows = [];
			var nodeData = [];
			nodeData['flow-node-inventory:table'] = [
				{
					'flow-node-inventory:id' : 1,
					'flow-node-inventory:flow': [
						{
							'flow-node-inventory:id': 1,
							'flow-node-inventory:test': 'testData11',
						},
						{
							'flow-node-inventory:id': 2,
							'flow-node-inventory:test': 'testData12',
						}
					]				
				},
				{
					'flow-node-inventory:id' : 2,
					'flow-node-inventory:flow': [
						{
							'flow-node-inventory:id': 1,
							'flow-node-inventory:test': 'testData21',
						},
						{
							'flow-node-inventory:id': 2,
							'flow-node-inventory:test': 'testData22',
						}
					]				
				},
				{
					'flow-node-inventory:id' : 3
				},
				{
					'flow-node-inventory:id' : 4
				}
			];
		
			flows = yangUtils.processFlows(nodeData);

			expect(angular.isFunction(yangUtils.processFlows)).toBe(true);
			expect(flows[0].data).toBe(nodeData['flow-node-inventory:table'][0]['flow-node-inventory:flow'][0]);
			expect(flows.length).toEqual(4);
			expect(flows[3].table).toBe(nodeData['flow-node-inventory:table'][1]['flow-node-inventory:id']);

		});

		it('yangUtils buildRequest method test', function(){
            var node = yinParser.__test.yangParser.createNewNode('flows','leaf', null);
			nodeWrapper.wrapAll(node);
			expect(angular.isFunction(yangUtils.buildRequest)).toBe(true);
			node.value = 'dummyValue';
			var flows = yangUtils.buildRequest(node);
			expect(flows).toBe('dummyValue');

		});

		it('yangUtils getRequestString method test', function(){
            var node = yinParser.__test.yangParser.createNewNode('ports','leaf', null),
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

        it('processModules', function(_yinParser_) {
            var dummyModuleA = 'dummy-module-a',
                mockURLA = '/yang2xml/'+dummyModuleA+'.yang.xml',
                xmlStringA = '<module name="'+dummyModuleA+'">' +
                            '   <leaf name="LA"></leaf>' +
                            '</module>',
                dummyModuleB = 'dummy-module-b',
                mockURLB = '/yang2xml/'+dummyModuleB+'.yang.xml',
                xmlStringB = '<module name="'+dummyModuleB+'">' +
                            '   <leaf name="LB"></leaf>' +
                            '</module>',
                parseResult = [],
                testPath,
                $httpBackend;

            angular.mock.inject(function(_$httpBackend_) {
                $httpBackend = _$httpBackend_;
            });

            angular.mock.inject(function(_yinParser_) {
                testPath = _yinParser_.__test.path;
            });

            $httpBackend.when('GET', testPath+mockURLA).respond(xmlStringA);
            $httpBackend.when('GET', testPath+mockURLB).respond(xmlStringB);

            yangUtils.processModules({ 'module': [{ 'name': dummyModuleA}, {'name': dummyModuleB}]}, function(data) {
                parseResult.push(data);
            });

            $httpBackend.flush();
            expect(parseResult.length).toEqual(2);
        });

	});


	describe('nodeWrapper service tests', function(){

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

		it('compare property to element by name function', function(){
			var compareResult;

			expect(angular.isFunction(nodeWrapper.__test.comparePropToElemByName)).toBe(true);
			compareResult = nodeWrapper.__test.comparePropToElemByName(propName, elemName);
			expect(compareResult).toBe(true);
			propName = 'test:test';
			compareResult = nodeWrapper.__test.comparePropToElemByName(propName, elemName);
			expect(compareResult).toBe(false);

		});

        describe('nodeWrapper leaf wrapping', function(){

            var req = {},
                propName = 'test:elementName',
                elemName = 'elementName',
                match,
                node;


            beforeEach(function() {

                node = yinParser.__test.yangParser.createNewNode('ports','leaf',null);

            });


            it('leaf buildRequest method', function(){

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.buildRequest)).toBe(true);
                expect(node.buildRequest(reqBuilder, req)).toBe(false);
                node.value = 'dummyTest';
                expect(node.buildRequest(reqBuilder, req)).toBe(true);

            });
            

            it('leaf fill method', function(){

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

            it('leaf clear method', function(){

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.clear)).toBe(true);
                node.clear();
                expect(node.value).toBe('');

            });

        });

        describe('nodeWrapper container wrapping', function(){

            var req = {},
                propName = 'test:elementName',
                elemName = 'elementName',
                match,
                node;

            beforeEach(function() {

                node = yinParser.__test.yangParser.createNewNode('ports','container',null);

            });

            it('container toggleExpand method', function(){

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.toggleExpand)).toBe(true);
                node.toggleExpand();
                expect(node.expanded).toBe(true);

            });

            it('container buildRequest method', function(){

                var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node),
                    nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','container', node),
                    nodeChildThird = yinParser.__test.yangParser.createNewNode('ports','leaf', nodeChildSec);

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.buildRequest)).toBe(true);
                expect(node.buildRequest(reqBuilder, req)).toBe(false);
                nodeChildThird.value = 'dummyTest';
                expect(node.buildRequest(reqBuilder, req)).toBe(true);

            });

            it('container clear method', function(){

                var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node),
                    nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','container', node);

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.clear)).toBe(true);
                nodeChild.value = 'dummyValue';
                nodeChildSec.value = 'dummyValueSec';
                node.clear();
                expect(nodeChild.value).toBe('');
                expect(nodeChildSec.value).toBe('dummyValueSec');

            });

            it('container fill method', function(){

                var data = { 'dummyProp:ports': 'dummyData'},
                    nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node);

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

        describe('nodeWrapper case wrapping', function(){

            var req = {},
                propName = 'test:elementName',
                elemName = 'elementName',
                match,
                node;

            beforeEach(function() {

                node = yinParser.__test.yangParser.createNewNode('ports','case',null);

            });

            it('case buildRequest method', function(){

                var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node),
                    nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','case', node),
                    nodeChildThird = yinParser.__test.yangParser.createNewNode('ports','leaf', nodeChildSec);

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.buildRequest)).toBe(true);
                expect(node.buildRequest(reqBuilder, req)).toBe(false);
                nodeChildThird.value = 'dummyTest';
                expect(node.buildRequest(reqBuilder, req)).toBe(true);

            });

            it('case fill method', function(){

                var data = 'dummyData',
                    filled,
                    nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node);

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.fill)).toBe(true);
                filled = node.fill(propName, data);
                expect(filled).toBe(false);

                propName = 'dummyProp:ports';
                filled = node.fill(propName,data);
                expect(filled).toBe(true);
                expect(nodeChild.value).toBe('dummyData');      

            });

            it('case clear method', function(){

                var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node),
                    nodeChildSec = yinParser.__test.yangParser.createNewNode('ports','case', node);

                nodeWrapper.wrapAll(node);
                expect(angular.isFunction(node.clear)).toBe(true);
                nodeChild.value = 'dummyValue';
                nodeChildSec.value = 'dummyValueSec';
                node.clear();
                expect(nodeChild.value).toBe('');
                expect(nodeChildSec.value).toBe('dummyValueSec');   

            }); 

        });

        describe('nodeWrapper choice wrapping', function(){

            var req = {},
                propName = 'test:elementName',
                elemName = 'elementName',
                match,
                node;

            beforeEach(function() {

                node = yinParser.__test.yangParser.createNewNode('ports','choice',null);

            });

            it('choice buildRequest method', function(){

                nodeWrapper.wrapAll(node);
                node.choice =  yinParser.__test.yangParser.createNewNode('ports','case', null);
                nodeWrapper.wrapAll(node.choice);
                
                var nodeChoiceChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node.choice);
                nodeWrapper.wrapAll(nodeChoiceChild);
                expect(angular.isFunction(node.buildRequest)).toBe(true);
                expect(node.buildRequest(reqBuilder, req)).toBe(false);
                nodeChoiceChild.value = 'dummyTest';
                expect(node.buildRequest(reqBuilder, req)).toBe(true);

            });

            it('choice fill method', function(){

                var nodeChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node),
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

            it('choice clear merhod', function(){

                nodeWrapper.wrapAll(node);
                yinParser.__test.yangParser.createNewNode('ports','case', node);
                node.choice = node.children[0];
                nodeWrapper.wrapAll(node.choice);

                var nodeChoiceChild = yinParser.__test.yangParser.createNewNode('ports','leaf', node.children[0]);
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
                node = yinParser.__test.yangParser.createNewNode('LiA','list',null);
                nodeChildLeaf = yinParser.__test.yangParser.createNewNode('LA','leaf', node);
                nodeChildContainer = yinParser.__test.yangParser.createNewNode('CA','container', node);
                containerChildLeaf = yinParser.__test.yangParser.createNewNode('LB','leaf', nodeChildContainer);

                nodeWrapper.wrapAll(node);
            });

            it('test utility - nodeEqual', function(){
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
                expect(node.needAddNewListElem).toBe(true);

                node.addListElem();
                node.addListElem();
                expect(node.needAddNewListElem).toBe(false);
                expect(node.listElems.length).toBe(2);

                expect(node.actElement === node.listElems[node.listElems.length - 1]).toBe(true);
                nodesEqual(node.listElems[0], node.listElems[1]);
                expect(node.listElems[0] === node.listElems[1]).toBe(false);
            });

            it('removeListElem', function(){
                //TODO rewrite to explicit index?
                node.addListElem();
                node.addListElem();
                node.addListElem();
                node.addListElem();
                expect(node.needAddNewListElem).toBe(false);
                expect(node.listElems.length).toBe(4);

                expect(node.actElement === node.listElems[node.listElems.length - 1]).toBe(true);
                node.removeListElem(node.listElems[0]);
                expect(node.actElement === node.listElems[node.listElems.length - 1]).toBe(true);
                
                var elemToDelete = node.listElems[1]; 
                
                node.actElement = elemToDelete;
                node.removeListElem(node.actElement);
                expect(node.actElement === node.listElems[node.listElems.length - 1]).toBe(true);
                expect(node.actElement === elemToDelete).toBe(false);
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

                // {'LiA': [{LA.label:: dummyValueA}]};
                expectedReq = {};
                arrayObjA = {};
                arrayObjA[LA.label] = dummyValueA;
                expectedReq[node.label] = [arrayObjA];

                node.actElement.children[0].value = dummyValueA;
                added = node.buildRequest(reqBuilder, dummyReq);
                
                expect(added).toBe(true);
                expect($.isEmptyObject(dummyReq)).toBe(false);
                reqsEqual(dummyReq, expectedReq);

                // expectedReq = {'LiA': [{'LA': dummyValueA},{'LA': dummyValueA, 'CA': {'ahoj': dummyValueB}}]};
                expectedReq = {};
                arrayObjA = {};
                arrayObjB = {};
                arrayObjA[LA.label] = dummyValueA;
                arrayObjB[LA.label] = dummyValueA;
                arrayObjB[CA.label] = {};
                arrayObjB[CA.label][LB.label] = dummyValueB;
                expectedReq[node.label] = [arrayObjA, arrayObjB];

                node.addListElem();
                node.actElement.children[0].value = dummyValueA;
                node.actElement.children[1].children[0].value = dummyValueB;
                added = node.buildRequest(reqBuilder, dummyReq);
                
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
                expect(node.listElems.length).toBe(0);

                fillName = 'NS:'+node.label;

                filled = node.fill(fillName, [fillDataObjA, fillDataObjB, fillDataObjC]);
                expect(filled).toBe(true);
                expect(node.listElems.length).toBe(3);
                
                comparedElem = node.listElems[0];
                expect(leaf(comparedElem).value).toBe(dummyValueA);
                expect(cont(comparedElem).expanded).toBe(false);
                expect(leaf(cont(comparedElem)).value).toBe(unsetVal);

                comparedElem = node.listElems[1];
                expect(leaf(comparedElem).value).toBe(unsetVal);
                expect(cont(comparedElem).expanded).toBe(true);
                expect(leaf(cont(comparedElem)).value).toBe(dummyValueB);

                comparedElem = node.listElems[2];
                expect(leaf(comparedElem).value).toBe(dummyValueA);
                expect(cont(comparedElem).expanded).toBe(true);
                expect(leaf(cont(comparedElem)).value).toBe(dummyValueB);
            });

            it('clear', function(){
                node.addListElem();
                node.clear();
                expect(node.actElement === null).toBe(false);
                expect(node.needAddNewListElem).toBe(true);
                expect(node.listElems.length).toBe(0);
            });
        });

        describe('listElem', function(){
            var listElem, dummyValueA, dummyValueB, dummyReq;

            beforeEach(function() {
                var node = yinParser.__test.yangParser.createNewNode('LiA','list',null);

                yinParser.__test.yangParser.createNewNode('LA','leaf', node);
                yinParser.__test.yangParser.createNewNode('LB','leaf', node);

                nodeWrapper.wrapAll(node);
                node.addListElem();
                listElem = node.listElems[0];

                dummyValueA = 'dummyValueA';
                dummyValueB = 'dummyValueB';
                dummyReq = {};
            });

            it('_listElem', function(){
                expect(angular.isFunction(listElem.listElemBuildRequest)).toBe(true);
                expect(angular.isFunction(listElem.fillListElement)).toBe(true);
            });

            it('listElemBuildRequest', function(){
                var dummyList = [],
                    added,
                    LA = listElem.children[0],
                    LB = listElem.children[1];

                added = listElem.listElemBuildRequest(reqBuilder, dummyList);
                expect(dummyList.length).toBe(0);
                expect(added).toBe(false);

                LA.value = dummyValueA;
                dummyReq[LA.label] = dummyValueA;
                added = listElem.listElemBuildRequest(reqBuilder, dummyList);

                expect(dummyList.length).toBe(1);
                reqsEqual(dummyList, [dummyReq]);
                expect(added).toBe(true);

                LB.value = dummyValueB;
                dummyList = [];
                dummyReq[LB.label] = dummyValueB;
                added = listElem.listElemBuildRequest(reqBuilder, dummyList);

                expect(dummyList.length).toBe(1);
                reqsEqual(dummyList, [dummyReq]);
                expect(added).toBe(true);
            });

            it('fillListElement', function(){
                var filled,
                    LA = listElem.children[0],
                    LB = listElem.children[1];

                filled = listElem.fillListElement('NS:'+LA.label, dummyValueA);
                expect(filled).toBe(true);
                expect(LA.value).toBe(dummyValueA);
                expect(LB.value).toBe('');
                
                filled = listElem.fillListElement('NS:'+LB.label, dummyValueB);
                expect(filled).toBe(true);
                expect(LB.value).toBe(dummyValueB);
            });
        });

	});

    describe('yinParser', function(){

        var yinParser, testProvider, $httpBackend, $timeout;

        beforeEach(angular.mock.inject(function(_yinParser_, _$timeout_, _$httpBackend_){
            $timeout = _$timeout_;
            yinParser = _yinParser_;
            $httpBackend = _$httpBackend_;
            testProvider = yinParser.__test;
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('spawnRequest', function(){
            testProvider.spawnRequest('A');
            expect(testProvider.runningRequests.length).toBe(1);

            testProvider.spawnRequest('B');
            expect(testProvider.runningRequests.length).toBe(2);

            expect(testProvider.runningRequests[0]).toBe('A0');
            expect(testProvider.runningRequests[1]).toBe('B1');
        });

        it('removeRequest', function(){
            var reqA = testProvider.spawnRequest('A'),
                reqB = testProvider.spawnRequest('B'),
                reqC = testProvider.spawnRequest('C');
            
            testProvider.removeRequest(reqB);

            expect(testProvider.runningRequests.length).toBe(2);
            expect(testProvider.runningRequests[0]).toBe('A0');
            expect(testProvider.runningRequests[1]).toBe('C2');
        });

        it('waitFor', function(){
            var called = false,
                reqA = testProvider.spawnRequest('A'),
                dummyCbk = function() { 
                    called = true;
                };

            testProvider.waitFor(dummyCbk);
            $timeout.flush();
            expect(called).toBe(false);

            testProvider.removeRequest(reqA);
            $timeout.flush();
            expect(called).toBe(true);
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

            testProvider.parseYang(mockURL, function(result) {
                parseResult = result;
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


            it('reset', function() {
                parserProvider.setCurrentModule(module);
                parserProvider.createNewNode(name, type, null);

                parserProvider.reset();
                expect(parserProvider.rootNode).toBe(null);
                expect(parserProvider.nodeIndex).toBe(0);
                expect(parserProvider.currentModule).toBe(null);
            });

            it('setCurrentModule', function() {
                parserProvider.setCurrentModule(module);
                expect(parserProvider.currentModule).toBe(module);
            });

            it('createNewNode', function() {
                parserProvider.setCurrentModule(module);

                var node = parserProvider.createNewNode(name, type, null);
                var childNode = parserProvider.createNewNode(name, type, node);

                expect(parserProvider.rootNode).toBe(node);
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

                var node = parserProvider.createNewNode(name, type, null);

                parserProvider.parse(xmlString, node);
                checkNode(node, 0, name, type, module, 5, {});
                checkNode(node.children[0], 1, 'LA', 'leaf', module, 0, {});
                checkNode(node.children[1], 2, 'CA', 'container', module, 0, {});
                checkNode(node.children[2], 3, 'LiA', 'list', module, 0, {});
                checkNode(node.children[3], 4, 'ChA', 'choice', module, 0, {});
                checkNode(node.children[4], 5, 'GLA', 'leaf', module, 0, {});
            });

            it('leaf', function() {
                var node = parserProvider.createNewNode(name, type, null),
                    xmlString = '<leaf name="LA"></leaf>';

                parserProvider.leaf(xmlString, node);
                expect(node.children.length).toBe(1);
                checkNode(node.children[0], 1, 'LA', 'leaf', node.module, 0, {});
            });

            it('container', function() {
                var node = parserProvider.createNewNode(name, type, null),
                    xmlString = '<container name="CA"></container>';

                parserProvider.container(xmlString, node);
                expect(node.children.length).toBe(1);
                checkNode(node.children[0], 1, 'CA', 'container', node.module, 0, {});
            });

            it('choice', function() {
                var node = parserProvider.createNewNode(name, type, null),
                    xmlString = '<choice name="ChiA"><case name="CA"></case></choice>';

                parserProvider.choice(xmlString, node);
                expect(node.children.length).toBe(1);

                var choiceNode = node.children[0];
                checkNode(choiceNode, 1, 'ChiA', 'choice', node.module, 1, {});
                checkNode(choiceNode.children[0], 2, 'CA', 'case', node.module, 0, {});
            });

            it('_case', function() {
                var node = parserProvider.createNewNode(name, type, null),
                    xmlString = '<case name="CA"></case>';

                parserProvider._case(xmlString, node);
                expect(node.children.length).toBe(1);
                checkNode(node.children[0], 1, 'CA', 'case', node.module, 0, {});
            });

            it('list', function() {
                var node = parserProvider.createNewNode(name, type, null),
                    xmlString = '<list name="LiA"></list>';

                parserProvider.list(xmlString, node);
                expect(node.children.length).toBe(1);
                checkNode(node.children[0], 1, 'LiA', 'list', node.module, 0, {});
            });

            it('_grouping', function() {
                var node = parserProvider.createNewNode(name, type, null),
                    xmlString = '<module><grouping name="GA"><leaf name="LA"></leaf></grouping></module>';

                parserProvider._grouping(xmlString, node, 'GA');
                expect(node.children.length).toBe(1);
                checkNode(node.children[0], 1, 'LA', 'leaf', node.module, 0, {});
            });

            it('uses - same module', function() {
                var node = parserProvider.createNewNode(name, type, null),
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
                var node = parserProvider.createNewNode(name, type, null),
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
                parserProvider.uses(usesXmlPart, node);

                $httpBackend.flush();
                $timeout.flush();

                expect(node.children.length).toBe(1);
                checkNode(node.children[0], 1, 'LB', 'leaf', otherModuleName, 0, {});
            });

        });

    });


});