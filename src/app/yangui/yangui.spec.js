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

});
