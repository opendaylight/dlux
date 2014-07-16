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

    var constants;
    beforeEach(angular.mock.module('common.yangUtils'));

    beforeEach(function() {
        angular.mock.inject(function(_constants_) {
            constants = _constants_;
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

        var yangUtils, yinParser, nodeWrapper, $httpBackend;

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

        });

        it('processNodes', function() {
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
                var reqs = node.buildRequest(reqBuilder, req);
                
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
                reqsEqual(dummyReq, expectedReq);// - key issue
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
                var node = yinParser.__test.yangParser.createNewNode('LiA','list',null, constants.NODE_UI_DISPLAY);

                yinParser.__test.yangParser.createNewNode('LA','leaf', node, constants.NODE_UI_DISPLAY);
                yinParser.__test.yangParser.createNewNode('LB','leaf', node, constants.NODE_UI_DISPLAY);

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

            it('_case', function() {
                var node = parserProvider.createNewNode(name, type, null, constants.NODE_UI_DISPLAY),
                    xmlString = '<case name="CA"></case>';

                parserProvider._case(xmlString, node);
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

        });

    });


});