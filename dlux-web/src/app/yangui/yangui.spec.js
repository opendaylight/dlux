/**
 * Copyright (c) 4.7.2014 Cisco.  All rights reserved.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/yangui/yangui.test.module.loader', 'common/layout/layout.module'], function() {
  describe('yangui', function() {
      var yangUtils, nodeWrapper, Restangular, reqBuilder, apiConnector, yinParser;
      

      beforeEach(angular.mock.module('app.common.layout'));
      beforeEach(angular.mock.module('app.yangui'));

      beforeEach(angular.mock.inject(function(_YangConfigRestangular_, _yangUtils_, _nodeWrapper_, _reqBuilder_, _apiConnector_, _yinParser_) {
          yangUtils = _yangUtils_;
          nodeWrapper = _nodeWrapper_;
          Restangular = _YangConfigRestangular_;
          reqBuilder = _reqBuilder_;
          apiConnector =_apiConnector_;
          yinParser = _yinParser_;
      }));

      describe('leafCtrl', function() {
          var leafCtrl, $scope, previewCalled;

          beforeEach( angular.mock.inject( function($controller, $rootScope ) {
              previewCalled = false;
              $scope = $rootScope.$new();

              $rootScope.preview = function() {
                  previewCalled = true;
              };

              leafCtrl = $controller('leafCtrl', {$scope: $scope });
          }));

          it('preview', function() {
              expect(previewCalled).toBe(false);
              $scope.changed();
              expect(previewCalled).toBe(true);
          });
      });

      describe( 'containerCtrl', function() {
          var containerCtrl, $scope;
          var node;

          beforeEach( inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              
              var node = yinParser.__test.yangParser.createNewNode('C', 'container', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;

              containerCtrl = $controller( 'containerCtrl', {$scope: $scope });
          }));

          it('toggleExpanded', inject( function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          }));

      });

      describe( 'caseCtrl', function() {
          var $scope, node;

          beforeEach( inject( function($rootScope ) {
              $scope = $rootScope.$new();
              
              node = yinParser.__test.yangParser.createNewNode('CASE', 'case', null);
              nodeWrapper.wrapAll(node);
              
              $scope.case = node;
          }));

          it('empty - 0 children', inject( function($controller) {
              var caseCtrl = $controller('caseCtrl', {$scope: $scope });
              expect($scope.empty).toBe(true);
          }));

          it('empty - 1 child w/ 0 children', inject( function($controller) {
              var nodeChild = yinParser.__test.yangParser.createNewNode('CONT', 'container', $scope.case);
              nodeWrapper.wrapAll(nodeChild);
              var caseCtrl = $controller( 'caseCtrl', {$scope: $scope });
              expect($scope.empty).toBe(true); 
          }));

          it('empty - 1 child w/ 1 children', inject( function($controller) {
              var nodeChild = yinParser.__test.yangParser.createNewNode('CONT', 'container', $scope.case);
              var nodeChildChild = yinParser.__test.yangParser.createNewNode('LEAF', 'leaf', nodeChild);
              nodeWrapper.wrapAll(nodeChild);
              nodeWrapper.wrapAll(nodeChildChild);
              var caseCtrl = $controller( 'caseCtrl', {$scope: $scope });
              expect($scope.empty).toBe(false); 
          }));

      });

      describe( 'listCtrl', function() {
          var node, listCtrl, $scope, testValue; 
          
          beforeEach(angular.mock.inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('LEAFLIST', 'leaf-list', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;
              $scope.preview = function() {
                  testValue = true;
              };

              leafListCtrl = $controller('leafListCtrl', {$scope: $scope });
          }));

          it('addListElem', function() {
              $scope.addListElem();
              $scope.addListElem();
              $scope.addListElem();

              expect($scope.node.value.length).toBe(3);
          });

          it('removeListElem', function() {
              $scope.addListElem();
              $scope.addListElem();
              $scope.addListElem();

              $scope.removeListElem($scope.node.value[1]);

              expect($scope.node.value.length).toBe(2);
          });

          it('changed', function() {
              testValue = false;
              $scope.changed();
              expect(testValue).toBe(true);
          });
      });

      describe( 'listCtrl', function() {
          var node, listCtrl, $scope, testValue; 
          
          beforeEach(angular.mock.inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('LIST', 'list', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;
              $scope.preview = function() {
                  testValue = true;
              };

              listCtrl = $controller( 'listCtrl', {$scope: $scope });
          }));

          it('addListElem', function() {
              $scope.addListElem();
              $scope.addListElem();

              expect($scope.node.actElemIndex).toBe(1);
              expect($scope.node.listData.length).toBe(2); 
          });

          it('removeListElem', function() {
              testValue = false;
              $scope.addListElem();
              $scope.addListElem();
              $scope.removeListElem($scope.node.listData[0]);

              expect($scope.node.listData.length).toBe(1); 
              expect(testValue).toBe(true);
          });

          it('toggleExpanded', inject( function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          }));

          it('showPrevElem', function() {
              $scope.addListElem();
              $scope.addListElem();
              $scope.addListElem();

              $scope.node.changeActElementData(1);
              $scope.showPrevElem();
              expect($scope.node.actElemIndex).toBe(0);
              expect($scope.node.listData.length).toBe(3); 
          });

          it('showNextElem', function() {
              $scope.addListElem();
              $scope.addListElem();
              $scope.addListElem();

              $scope.node.changeActElementData(1);
              $scope.showNextElem();
              expect($scope.node.actElemIndex).toBe(2);
              expect($scope.node.listData.length).toBe(3); 
          });

          it('showPrevButton', function() {
              $scope.addListElem();
              $scope.addListElem();
              $scope.addListElem();

              $scope.node.changeActElementData(1);
              expect($scope.showPrevButton()).toBe(true);
              $scope.node.changeActElementData(0);
              expect($scope.showPrevButton()).toBe(false);
          });

          it('showNextButton', function() {
              $scope.addListElem();
              $scope.addListElem();
              $scope.addListElem();

              $scope.node.changeActElementData(1);
              expect($scope.showNextButton()).toBe(true);
              $scope.node.changeActElementData(2);
              expect($scope.showNextButton()).toBe(false);
          });

          it('showModalWin', function() {
              var showModelBefore = $scope.showModalWin;

              $scope.showModalWin();
              expect($scope.showNextButton()).toBe(!showModelBefore);
          });
      });

      describe('yanguiCtrl', function() {
          var yanguiCtrl, $scope, $timeout, $httpBackend, Restangular, pathUtils, constants, custFunct;

          beforeEach(angular.mock.inject( function($controller, $rootScope, _$timeout_, _$http_, _$httpBackend_, _YangConfigRestangular_, _pathUtils_, _constants_, _custFunct_) {
              $scope = $rootScope.$new();
              $httpBackend = _$httpBackend_;
              pathUtils = _pathUtils_;
              constants = _constants_;
              custFunct = _custFunct_;

              yangUtils.generateNodesToApis = function(success, error, restangular) {
                  var apis, 
                      allNodes = [], 
                      pathString = '/config/M:N/',
                      SubApi = apiConnector.SubApi;

                  var subApi = new apiConnector.__test.SubApi(pathString, ['GET','PUT']);

                  subApi.setPathArray(pathUtils.translate(pathString, null, null));
                  var leaf = yinParser.__test.yangParser.createNewNode('LEAF', 'leaf', null, constants.NODE_UI_DISPLAY);
                  nodeWrapper.wrapAll(leaf);
                  subApi.setNode(leaf);

                  apis = [{ basePath: 'dummyBase', module: 'M', revision: '1', subApis: [subApi] } ];
                  success(apis, allNodes);
              };

              yanguiCtrl = $controller('yanguiCtrl', {$scope: $scope, $rootScope: $rootScope, $http: _$http_, 
                Restangular: Restangular, yangUtils: yangUtils, reqBuilder: reqBuilder, apiConnector: apiConnector});
          }));

          afterEach(function() {
              $httpBackend.verifyNoOutstandingExpectation();
              $httpBackend.verifyNoOutstandingRequest();
          });

          it('loadApis', function() {
              $scope.__test.loadApis();

              expect($scope.apis.length).toBe(1); 
              expect($scope.apis[0].subApis.length).toBe(1);
          });

          it('loadController', function() {
              $scope.loadController();

              expect($scope.apis.length).toBe(1);
              expect($scope.apis[0].subApis.length).toBe(1);
          });

          it('setApiNode', function() {
              var branch = {indexApi: 0, indexSubApi: 0};
              $scope.setApiNode(branch);

              expect($scope.selApi).toBe($scope.apis[branch.indexApi]);
              expect($scope.selSubApi).toBe($scope.apis[branch.indexApi].subApis[branch.indexSubApi]);
              expect($scope.apiType).toBe('');
              expect($scope.node).toBe($scope.apis[branch.indexApi].subApis[branch.indexSubApi].node);

              $scope.setApiNode({});
              expect($scope.selApi).toBe(null);
              expect($scope.selSubApi).toBe(null);
              expect($scope.node).toBe(null);
          });

          it('setNode', function() {
              $scope.selSubApi = { node: $scope.apis[0].subApis[0].node };

              $scope.setNode();
              expect($scope.node).toBe($scope.selSubApi.node);
          });

          it('preview', function() {
              $scope.showPreview = true;
              $scope.node = $scope.apis[0].subApis[0].node;
              $scope.node.value = 'X';

              $scope.preview();
              expect($scope.previewValue.length).toBeGreaterThan(0);
              expect($scope.previewVisible).toBe(true);
          });

          it('executeCustFunctionality', function() {
              var testValue = false;
              $scope.executeCustFunctionality(custFunct.createNewFunctionality('dummyFunct', $scope.apis[0].subApis[0].node, function() {
                  testValue = true;
              }));
              expect(testValue).toBe(true);
          });

          it('executeOperation', function() {
              var branch = {indexApi: 0, indexSubApi: 0},
                  operation = 'GET',
                  dummyValue = 'XYZ';

              $scope.setApiNode(branch);
              operation = $scope.selSubApi.operations[0];

              $scope.executeOperation(operation);

              $httpBackend.when(operation, 'dummyBase/config/M:N/').respond({ 'LEAF': dummyValue});
              $httpBackend.flush();
              
              expect($scope.node.value).toBe(dummyValue);
          });
      });
  });
});
