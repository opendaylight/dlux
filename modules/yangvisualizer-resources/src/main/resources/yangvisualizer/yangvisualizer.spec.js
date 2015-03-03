/**
 * Copyright (c) 4.7.2014 Cisco.  All rights reserved.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/yangvisualizer/yangvisualizer.test.module.loader', 'common/layout/layout.module'], function() {
    describe('yangvisualizer', function() {
      var yangUtils, yinParser, yangParser, constants, $httpBackend, $timeout, visualizerUtils;
      var port = 8181;
      
      beforeEach(angular.mock.module('app.common.layout'));
      beforeEach(angular.mock.module('app.yangvisualizer'));

      beforeEach(angular.mock.inject(function(_yangUtils_, _yinParser_, _constants_, _$httpBackend_, _$timeout_, _visualizerUtils_) {
          yangUtils = _yangUtils_;
          yinParser = _yinParser_;
          constants = _constants_;
          yangParser = yinParser.__test.yangParser;
          $httpBackend = _$httpBackend_;
          $timeout = _$timeout_;
          visualizerUtils = _visualizerUtils_;

      }));

      describe('yangvisualizerCtrl', function(){
        var yangvisualizerCtrl, $scope, sigmaElem;

        beforeEach( angular.mock.inject( function($controller, $rootScope, _$compile_) {
            $scope = $rootScope.$new();
            $compile = _$compile_;

            yangvisualizerCtrl = $controller('yangvisualizerCtrl', {$scope: $scope });
        }));

        it('triggerExpanded', function(){
          var nodes = {
            show: false
          };

          expect(nodes.show).toBe(false);
          $scope.triggerExpanded(nodes);
          expect(nodes.show).toBe(true);
        });

        it('status callbacks', function(){
            var e = 'dummyString';
            $scope.status = {};
            $scope.__test.processingNodesCallback();
            expect($scope.status.isWorking).toBe(true);
            $scope.status = {};
            $scope.__test.processingNodesSuccessCallback();
            expect($scope.status.type).toBe('success');
            $scope.status = {};
            $scope.__test.processingNodesErrorCallback(e);
            expect($scope.status.type).toBe('danger');
        });

        it('updateTopologyData', function(){
          yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));

          var nodeN1 = yangParser.createNewNode('list', 'list', null, constants.NODE_UI_DISPLAY),
              nodeN2 = yangParser.createNewNode('leaf', 'leaf', nodeN1, constants.NODE_UI_DISPLAY),
              nodeN3 = yangParser.createNewNode('list', 'list', nodeN2, constants.NODE_UI_DISPLAY),
              nodeN4 = yangParser.createNewNode('leaf', 'leaf', nodeN3, constants.NODE_UI_DISPLAY);

          $scope.currentTopologyNode = nodeN1;
          $scope.topologyData = null;
          $scope.selectedNode = 'dummyData';
          $scope.childrenNodes.list = ['dummyData', 'dummyData', 'dummyData'];
          $scope.parentNodes.list = ['dummyData', 'dummyData', 'dummyData', 'dummyData'];
          
          $scope.updateTopologyData();

          expect($scope.childrenNodes.list.length).toBe(0);
          expect($scope.parentNodes.list.length).toBe(0);
          expect($scope.selectedNode).toBe(null);
          expect($scope.topologyData.nodes.length).toBe(4);
          expect($scope.topologyData.links.length).toBe(3);

        });

        it('getAllNodes callbacks success', function(){
          var hostPort = 'http://localhost:' + port,
              baseUrl = hostPort+'/restconf',
              // modules = {"modules":{"module":[{"name":"MA"},{"name":"MB"},{"name":"MC"}]}},
              modules = {"modules":{module: [{ 'name': 'MA', revision: 'dummyRev'}, { 'name': 'MB', revision: 'dummyRev'}, { 'name': 'MC', revision: 'dummyRev'}]}},
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

          $scope.status = null;

          $httpBackend.when('GET', baseUrl+'/modules/').respond(modules);
          // $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
          // $httpBackend.when('GET', './assets/yang2xml/MB.yang.xml').respond(mB);
          // $httpBackend.when('GET', './assets/yang2xml/MC.yang.xml').respond(mC);
          $httpBackend.when('GET', hostPort + '/restconf/modules/module/MA/dummyRev/schema').respond(mA);
          $httpBackend.when('GET', hostPort + '/restconf/modules/module/MB/dummyRev/schema').respond(mB);
          $httpBackend.when('GET', hostPort + '/restconf/modules/module/MC/dummyRev/schema').respond(mC);
          
          $httpBackend.flush();
          $timeout.flush();

          expect($scope.filteredNodes.length).toBe(3);
          expect($scope.status.type).toBe('success');
          expect($scope.topologyData.nodes.length).toBe(1);
          expect($scope.topologyData.links.length).toBe(0);


        });

        it('getAllNodes callbacks failed', function(){
          var hostPort = 'http://localhost:' + port,
              baseUrl = hostPort+'/restconf';

              $scope.status = null;

              $httpBackend.when('GET', baseUrl+'/modules/').respond(404, 'error');
              $httpBackend.flush();
              expect($scope.status.type).toBe('danger');
              expect($scope.status.rawMsg).toBe('error');

        });

        describe('sigma func', function(){

          var nodeN1, nodeN2, nodeN3, nodeN4, expandNode,hostPort, baseUrl, modules, mA, sigmaElement;

          beforeEach(function(){

            yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));

            nodeN1 = yangParser.createNewNode('list', 'list', null, constants.NODE_UI_DISPLAY);
            nodeN2 = yangParser.createNewNode('leaf', 'leaf', nodeN1, constants.NODE_UI_DISPLAY);
            nodeN3 = yangParser.createNewNode('list', 'list', nodeN2, constants.NODE_UI_DISPLAY);
            nodeN4 = yangParser.createNewNode('leaf', 'leaf', nodeN3, constants.NODE_UI_DISPLAY);
            expandNode = {
              expand: true,
              node: nodeN2,
              size: 99,
              label: 'list'
            };
            hostPort = 'http://localhost:' + port;
            baseUrl = hostPort+'/restconf';
            // modules = {"modules":{"module":[{"name":"MA"}]}};
            modules = {"modules":{module: [{ 'name': 'MA', revision: 'dummyRev'}]}};
            mA = '<module name="MA">' +
                 '   <leaf name="LA"></leaf>' +
                 '   <container name="CA"></container>' +
                 '</module>';
            sigmaElement = '<sigma-topology topology-data="topologyData" topology-custfunc="topologyCustfunc"></sigma-toppology>';

            $httpBackend.when('GET', 'src/app/yangvisualizer/sigma.tpl.html').respond('<div id="graph-container"><+/div>');
            $httpBackend.when('GET', baseUrl+'/modules/').respond(modules);
            // $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
            $httpBackend.when('GET', hostPort + '/restconf/modules/module/MA/dummyRev/schema').respond(mA);
            $httpBackend.flush();

            if ( !$('#graph-container').length ) {
              $('<div id="graph-container"></div>').appendTo(document.body);


            }

            sigmaElement = $compile(sigmaElement)($scope);
            $scope.$digest();
            
            $scope.topologyData = visualizerUtils.getTopologyData(nodeN1, 4);
            $scope.$apply();


          });

          afterEach(function(){
            $scope.sigma.kill();
            // $('#graph-container').remove();
          });

          // it('expandNodeFunc', function(){

          //   expect($scope.sigma.graph.nodes().length).toBe(4);

          //   $scope.topologyData = visualizerUtils.getTopologyData(nodeN1, 1);
          //   $scope.$apply();

          //   expect($scope.sigma.graph.nodes().length).toBe(2);
          //   $scope.__test.expandNodeFunc(expandNode, 4);

          //   var nodes = $scope.sigma.graph.nodes();
          //   expect(nodes.length).toBe(4);
          //   expect($scope.sigma.isForceAtlas2Running()).toBe(true);

          //   $scope.topologyData = visualizerUtils.getTopologyData(nodeN1, 0);
          //   $scope.$apply();

          //   expandNode.node = nodeN1;
          //   $scope.__test.expandNodeFunc(expandNode, 4);
          //   expect(expandNode.size).toBe(20);

          // });

          // it('collapseNodeFunc', function(){

          //   $scope.__test.collapseNodeFunc(expandNode);
          //   expect($scope.sigma.graph.nodes().length).toBe(2);
          //   expect($scope.sigma.isForceAtlas2Running()).toBe(true);
          //   expect(expandNode.size).toBe(12);
          //   expandNode.node = nodeN1;

          //   $scope.__test.collapseNodeFunc(expandNode);
          //   expect($scope.sigma.graph.nodes().length).toBe(1);
          //   expect($scope.sigma.isForceAtlas2Running()).toBe(true);
          //   expect(expandNode.size).toBe(20);

          //   $scope.topologyData = visualizerUtils.getTopologyData(nodeN1, 4);
          //   $scope.$apply();

          //   expandNode.node = nodeN4;
          //   $scope.__test.collapseNodeFunc(expandNode);
          //   expect($scope.sigma.graph.nodes().length).toBe(4);

          // });

          // it('setColorScheme', function(){
          //   var html = '<div class="yangVisualizerWrapper">'+
          //                 '<div class="viewNav">'+
          //                   '<ul>'+
          //                     '<li>'+
          //                       '<span class="active">'+
          //                       '</span>'+
          //                     '</li>'+
          //                     '<li>'+
          //                       '<span>'+
          //                       '</span>'+
          //                     '</li>'+
          //                   '</ul>'+
          //                 '</div>'+
          //               '</div>',
          //       e = {
          //         target: '.yangVisualizerWrapper div.viewNav li:eq(1) span'
          //       };

          //   $(html).appendTo(document.body);

          //   $scope.currentTopologyNode = nodeN1;
          //   $scope.setColorScheme(e, 'namespace');
          //   expect($('.yangVisualizerWrapper div.viewNav li:eq(1) span').hasClass('active')).toBe(true);
          //   expect($('.yangVisualizerWrapper div.viewNav li:eq(0) span').hasClass('active')).toBe(false);
          //   expect($scope.legend.NS).toBe('#243f6a');

          // });

          // it('zoomToNode', function(){
          //   $scope.topologyData = visualizerUtils.getTopologyData(nodeN1, 1);
          //   $scope.$apply();

          //   expect($scope.sigma.isForceAtlas2Running()).toBe(true);

          //   $scope.zoomToNode('dummyID');
          //   expect($scope.sigma.camera.x).toBe(0);
          //   expect($scope.sigma.camera.y).toBe(0);

          //   var node = $scope.sigma.graph.nodes()[1];

          //   $scope.zoomToNode(node.id);
          //   expect($scope.sigma.isForceAtlas2Running()).toBe(null);

          //   expect($scope.sigma.camera.x).toBe(node['read_cam0:x']);
          //   expect($scope.sigma.camera.y).toBe(node['read_cam0:y']);

          //   node = $scope.sigma.graph.nodes()[0];
          //   $scope.zoomToNode(node.id);
          //   expect(node.expand).toBe(false);
          //   expect($scope.sigma.graph.nodes().length).toBe(4);

          // });

          // it('expandAllNodes', function(){

          //   $scope.currentTopologyNode = nodeN1;

          //   $scope.topologyData = visualizerUtils.getTopologyData(nodeN1, 1);
          //   $scope.$apply();

          //   $scope.expandAllNodes();
          //   $scope.$apply();

          //   expect($scope.sigma.graph.nodes().length).toBe(4);
          //   expect($scope.expandedNodes).toBe(true);
            
          //   $scope.expandAllNodes();
          //   $scope.$apply();

          //   expect($scope.sigma.graph.nodes().length).toBe(1);
          //   expect($scope.expandedNodes).toBe(false);
          // });

        });

      

        

        /*it('topologyCustfunc', function(){
          var hostPort = 'http://localhost:8080',
              baseUrl = hostPort+'/restconf',
              modules = {"modules":{"module":[{"name":"MA"}]}},
              mA = '<module name="MA">' +
                   '   <leaf name="LA"></leaf>' +
                   '   <container name="CA"></container>' +
                   '</module>',
              element = '<sigma-topology topology-data="topologyData" topology-custfunc="topologyCustfunc"></sigma-toppology>';

          $httpBackend.when('GET', 'src/app/yangvisualizer/sigma.tpl.html').respond('<div id="graph-container"></div>');
          $httpBackend.when('GET', baseUrl+'/modules/').respond(modules);
          $httpBackend.when('GET', './assets/yang2xml/MA.yang.xml').respond(mA);
          $httpBackend.flush();

          element = $compile(element)($scope);
          $scope.$digest();

          yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
          var nodeN1 = yangParser.createNewNode('list', 'list', null, constants.NODE_UI_DISPLAY),
              nodeN2 = yangParser.createNewNode('leaf', 'leaf', nodeN1, constants.NODE_UI_DISPLAY),
              nodeN3 = yangParser.createNewNode('list', 'list', nodeN2, constants.NODE_UI_DISPLAY),
              nodeN4 = yangParser.createNewNode('leaf', 'leaf', nodeN3, constants.NODE_UI_DISPLAY);

          $scope.currentTopologyNode = nodeN1;
          $scope.updateTopologyData();
          // element.$scope.$apply();

          
          // $httpBackend.flush();
          // $timeout.flush();

          
          // element.click();
          // browserTrigger(element,'click');

        });*/
      

      });

      describe('yangvisualizerServices', function(){
        var nodeN1,nodeN2,nodeN3,nodeN4,nodeN5,topologyData = null;

        beforeEach(function(){
            yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
            nodeN1 = yangParser.createNewNode('list1', 'list', null, constants.NODE_UI_DISPLAY);
            nodeN2 = yangParser.createNewNode('leaf2', 'leaf', nodeN1, constants.NODE_UI_DISPLAY);
            nodeN3 = yangParser.createNewNode('list3', 'list', nodeN2, constants.NODE_UI_DISPLAY);
            nodeN4 = yangParser.createNewNode('leaf2', 'leaf', nodeN3, constants.NODE_UI_DISPLAY);
            nodeN5 = yangParser.createNewNode('leaf123456789123456789', 'leaf', null, constants.NODE_UI_DISPLAY);

            topologyData = visualizerUtils.getTopologyData(nodeN1, Infinity);
        });

        //visualizerUtils
        it('getTopologyData', function(){
          // console.log(topologyData);
          expect(topologyData.nodes.length).toBe(4);
          expect(topologyData.links.length).toBe(3);
          topologyData = visualizerUtils.getTopologyData(nodeN5);
          expect(topologyData.nodes[0].label.length).toBe(20);

          topologyData = visualizerUtils.getTopologyData(nodeN1, 2);
          expect(topologyData.nodes[0].size).toBe(12);

          topologyData = visualizerUtils.getTopologyData(nodeN3, 1, false, 3);
          expect(topologyData.nodes[0].label).toBe('[1] list3');

        });

        it('updateSelectedEdgesColors', function(){

          topologyData.links.forEach(function(link){
            link.color = 'dummyColor';
          });
          
          visualizerUtils.updateSelectedEdgesColors(topologyData.links, topologyData.nodes[1]);

          expect(topologyData.links[0].color).toBe('#3ea64d');
          expect(topologyData.links[1].color).toBe('#BE3E3B');
          expect(topologyData.links[2].color).toBe('#BE3E3B');

        });

        it('clearEdgeColors', function(){
          
          visualizerUtils.updateSelectedEdgesColors(topologyData.links, topologyData.nodes[3]);

          expect(visualizerUtils.__test.edgesToClear.edges[0].color).toBe('#3ea64d');
          visualizerUtils.clearEdgeColors();
          expect(visualizerUtils.__test.edgesToClear.edges[0].color).toBe('#856700');
          expect(visualizerUtils.__test.edgesToClear.node.size).toBe(20);

          visualizerUtils.updateSelectedEdgesColors(topologyData.links, topologyData.nodes[1]);
          visualizerUtils.clearEdgeColors();
          expect(visualizerUtils.__test.edgesToClear.node.size).toBe(7);

          topologyData.nodes[0].expand = true;
          visualizerUtils.updateSelectedEdgesColors(topologyData.links, topologyData.nodes[0]);
          visualizerUtils.clearEdgeColors();
          expect(visualizerUtils.__test.edgesToClear.node.size).toBe(12);

          // console.log(visualizerUtils.__test.edgesToClear);

        });

        // it('getChildrenNode', function(){
        //   var testNode = topologyData.nodes[3],
        //       childrenNode = null;

        //   childrenNode = visualizerUtils.getChildrenNode(testNode.id);
        //   expect(childrenNode.length).toBe(1);

        //   testNode = topologyData.nodes[0];
        //   childrenNode = visualizerUtils.getChildrenNode(testNode.id);
        //   expect(childrenNode.length).toBe(0);

        // });

        it('getParentNodes', function(){
          var parentArray = [];

          parentArray = visualizerUtils.getParentNodes(nodeN4, parentArray);
          expect(parentArray.length).toBe(3);

          parentArray = visualizerUtils.getParentNodes();
          expect(parentArray.length).toBe(0);

        });

        it('generateColor', function(){
          var color = visualizerUtils.__test.generateColor(1);
          expect(color).toBe('#243f6a');
        });

        it('getColors', function(){
          var propertyArray = ['dummyVal1','dummyVal2','dummyVal3','dummyVal2'],
              colorArray = visualizerUtils.__test.getColors(propertyArray);

          expect(colorArray.dummyVal1).toBe('#243f6a');
          expect(colorArray.dummyVal2).toBe('#487ed4');
          expect(colorArray.dummyVal3).toBe('#6cbe3f');
        });

        it('getPropertyNodes', function(){
          var  propertyNodesArray = visualizerUtils.__test.getPropertyNodes('label', nodeN1);
          expect(propertyNodesArray[0]).toBe('list1');
          expect(propertyNodesArray[1]).toBe('leaf2');
          expect(propertyNodesArray[2]).toBe('list3');
          expect(propertyNodesArray.length).toBe(3);

        });

        it('updateNodesColor', function(){
          var propertyNodesArray = visualizerUtils.__test.getPropertyNodes('type', nodeN1),
              colorsArray = visualizerUtils.__test.getColors(propertyNodesArray),
              monochromeColorsArray = visualizerUtils.__test.getMonochromeColors('#487ed4', 3);
              nodes = [
                {
                  color: '#ddd',
                  lvl: 0,
                  node: {
                    type: 'leaf'
                  }
                }
              ];

          visualizerUtils.__test.updateNodesColor('type', nodes, colorsArray, monochromeColorsArray);
          expect(nodes[0].color).toBe('#487ed4');
          visualizerUtils.__test.updateNodesColor('type', nodes, colorsArray, monochromeColorsArray, true);
          expect(nodes[0].color).toBe(monochromeColorsArray[0]);
          
        });

        it('setNodesColor', function(){
          var nodes = [
            {
              color: '#ddd',
              lvl: 0,
              node: nodeN1
            },
            {
              color: '#ddd',
              lvl: 1,
              node: nodeN2
            },
            {
              color: '#ddd',
              lvl: 2,
              node: nodeN3
            },
            {
              color: '#ddd',
              lvl: 3,
              node: nodeN4
            }
          ],
          colorsArray = visualizerUtils.setNodesColor('module', nodes, nodeN2);
          expect(colorsArray.M).toBe('#243f6a');

          colorsArray = visualizerUtils.setNodesColor('default', nodes, nodeN2);
          expect(colorsArray).toBe(null);

          colorsArray = visualizerUtils.setNodesColor('dymmyProperty', nodes, nodeN2);
          expect(colorsArray).toBe(null);
        });

        it('getMonochromeColors', function(){
          var hex = '#243f6a',
              lvls = 3,
              monochromeColors = [];

          monochromeColors = visualizerUtils.__test.getMonochromeColors(hex, lvls, false);
          expect(monochromeColors[0]).toBe('#667997');
          expect(monochromeColors.length).toBe(3);

          monochromeColors = visualizerUtils.__test.getMonochromeColors(hex, lvls, true);
          expect(monochromeColors[0]).toBe('#20395f');

          hex = 'dummyHex';
          monochromeColors = visualizerUtils.__test.getMonochromeColors(hex, lvls, false);
          expect(monochromeColors).toBe(null);

          hex = '#010203';
          monochromeColors = visualizerUtils.__test.getMonochromeColors(hex, lvls, false);
          expect(monochromeColors[0]).toBe('#4d4e4f');


        });

        it('getMaxLvl', function(){
          var maxLvl = visualizerUtils.__test.getMaxLvl(nodeN1, 0);
          expect(maxLvl).toBe(3);
        });

        it('getEdge', function(){
          var edge = visualizerUtils.getEdge(nodeN1, nodeN2);
          expect(edge.source).toBe('n1');
          expect(edge.target).toBe('n2');
        });

        it('getAllChildrenArray', function(){
          var node = {
                node : nodeN1
              },
              result = visualizerUtils.getAllChildrenArray(node);
          expect(result.numOfChildren).toBe(3);
          expect(result.nodesArray.length).toBe(3);
          result = visualizerUtils.getAllChildrenArray(node);
          expect(result.nodesArray.length).toBe(0);
        });

      });


    });


          

});
