/**
 * Copyright (c) 4.7.2014 Cisco.  All rights reserved.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/yangui/yangui.test.module.loader', 'common/layout/layout.module'], function() {
    describe('yangui', function() {
      var yangUtils, nodeWrapper, Restangular, reqBuilder, apiConnector, yinParser, yangParser, constants;
      

      beforeEach(angular.mock.module('app.common.layout'));
      beforeEach(angular.mock.module('app.yangui'));

      beforeEach(angular.mock.inject(function(_YangConfigRestangular_, _yangUtils_, _nodeWrapper_, _reqBuilder_, _apiConnector_, _yinParser_, _constants_) {
          yangUtils = _yangUtils_;
          nodeWrapper = _nodeWrapper_;
          Restangular = _YangConfigRestangular_;
          reqBuilder = _reqBuilder_;
          apiConnector =_apiConnector_;
          yinParser = _yinParser_;
          constants = _constants_;

          yangParser = yinParser.__test.yangParser;
          yangParser.setCurrentModuleObj(new yinParser.__test.Module('M', 'R', 'NS'));
      }));

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

      describe('leafListCtrl', function() {
          var node, leafListCtrl, $scope, testValue; 
          
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

          it('toggleExpanded', inject( function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          }));
      });

      describe('choiceCtrl', function() {
          var ctrl, $scope, previewCalled;

          beforeEach( angular.mock.inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('N', 'choice', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;

              ctrl = $controller('choiceCtrl', {$scope: $scope });
          }));

          it('toggleExpanded', inject( function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          }));
      });

      describe('rpcCtrl', function() {
          var ctrl, $scope, previewCalled;

          beforeEach( angular.mock.inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('N', 'rpc', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;

              ctrl = $controller('rpcCtrl', {$scope: $scope });
          }));

          it('toggleExpanded', inject( function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          }));
      });

      describe('inputCtrl', function() {
          var ctrl, $scope, previewCalled;

          beforeEach( angular.mock.inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('N', 'input', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;

              ctrl = $controller('inputCtrl', {$scope: $scope });
          }));

          it('toggleExpanded', function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          });
      });

      describe('outputCtrl', function() {
          var ctrl, $scope, previewCalled;

          beforeEach( angular.mock.inject( function($controller, $rootScope ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('N', 'output', null);
              nodeWrapper.wrapAll(node);
              $scope.node = node;

              ctrl = $controller('outputCtrl', {$scope: $scope });
          }));

          it('toggleExpanded', inject( function() {
              $scope.node.expanded = false;
              
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(true);
              $scope.toggleExpanded();
              expect($scope.node.expanded).toBe(false);
          }));
      });

      describe('listCtrl', function() {
          var node, listCtrl, $scope, testValue; 
          
          beforeEach(angular.mock.inject( function($controller, $rootScope, _constants_ ) {
              $scope = $rootScope.$new();
              var node = yinParser.__test.yangParser.createNewNode('LIST', 'list', null);
              yinParser.__test.yangParser.createNewNode('REALLYREALLYLONGNAMEFORLEAFTHATISINKEY', 'leaf', node, _constants_.NODE_UI_DISPLAY);
              yinParser.__test.yangParser.createNewNode('REALLYREALLYLONGNAMEFORLEAFTHATISINKEY', 'key', node, _constants_.NODE_ALTER);
              nodeWrapper.wrapAll(node);
              $scope.node = node;
              $scope.preview = function() {
                  testValue = true;
              };

              listCtrl = $controller('listCtrl', {$scope: $scope });
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

          // fix when filtering is done
          // it('shiftDisplayNext', function() {
          //     for(var i = 0; i < 10; i++) {
          //         $scope.addListElem();
          //     }

          //     expect($scope.currentDisplayIndex).toBe(1);
          //     $scope.shiftDisplayNext();
          //     expect($scope.currentDisplayIndex).toBe(4);
          //     $scope.shiftDisplayNext();
          //     expect($scope.currentDisplayIndex).toBe(7);
          //     $scope.shiftDisplayNext();
          //     expect($scope.currentDisplayIndex).toBe(8);
          // });

          // it('shiftDisplayPrev', function() {
          //     for(var i = 0; i < 10; i++) {
          //         $scope.addListElem();
          //     }

          //     $scope.shiftDisplayNext();
          //     $scope.shiftDisplayNext();
          //     $scope.shiftDisplayNext();
          //     $scope.shiftDisplayPrev();
          //     expect($scope.currentDisplayIndex).toBe(5);
          //     $scope.shiftDisplayPrev();
          //     expect($scope.currentDisplayIndex).toBe(2);
          //     $scope.shiftDisplayPrev();
          //     expect($scope.currentDisplayIndex).toBe(1);
          // });

          // it('showNextButton', function() {
          //     for(var i = 0; i < 10; i++) {
          //         $scope.addListElem();
          //     }

          //     expect($scope.showNextButton()).toBe(true);
          //     $scope.shiftDisplayNext();
          //     $scope.shiftDisplayNext();
          //     $scope.shiftDisplayNext();
          //     expect($scope.showNextButton()).toBe(false);
          // });

          // it('showPrevButton', function() {
          //     for(var i = 0; i < 10; i++) {
          //         $scope.addListElem();
          //     }

          //     expect($scope.showPrevButton()).toBe(false);
          //     $scope.shiftDisplayNext();
          //     expect($scope.showNextButton()).toBe(true);
          // });

          // it('showModalWin', function() {
          //     var showModelBefore = $scope.showModalWin;

          //     $scope.showModalWin();
          //     expect($scope.showNextButton()).toBe(!showModelBefore);
          // });

          it('getListName', function() {
              $scope.currentDisplayIndex = 0;
              $scope.addListElem();
              $scope.node.actElemStructure.children[0].value = 12345;
              $scope.node.changeActElementData(0);

              var createResult = $scope.getListName(0, false),
                  expectedName = ' <'+$scope.node.actElemStructure.children[0].label+':'+$scope.node.actElemStructure.children[0].value+'>';

              expect(createResult.tooltip).toBe(expectedName);
              expect(createResult.name).toBe(expectedName.substring(0,30) + '...');

              $scope.node.actElemStructure.children[0].label = 'SHORTNAME';
              $scope.node.refKey[0] = $scope.node.actElemStructure.children[0];
              $scope.node.changeActElementData(0);

              createResult = $scope.getListName(0, false);
              expectedName = ' <'+$scope.node.actElemStructure.children[0].label+':'+$scope.node.actElemStructure.children[0].value+'>';
              expect(createResult.tooltip).toBe('');
              expect(createResult.name).toBe(expectedName);

              $scope.node.actElemStructure.children[0].value = '';
              $scope.node.changeActElementData(0);

              createResult = $scope.getListName(0, true);
              expectedName = '[0]';
              expect(createResult.tooltip).toBe('');
              expect(createResult.name).toBe(expectedName);
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
              $timeout = _$timeout_;

              yangUtils.generateNodesToApis = function(success, error) {
                  var apis, 
                      allNodes = [], 
                      pathString = '/config/M:N/',
                      pathStringOper = '/operational/M:N/';

                  var subApi1 = new apiConnector.__test.SubApi(pathString, ['GET','PUT']);
                  var subApi2 = new apiConnector.__test.SubApi(pathStringOper, ['GET','PUT']);

                  subApi1.setPathArray(pathUtils.translate(pathString, null, null));
                  subApi2.setPathArray(pathUtils.translate(pathStringOper, null, null));
                  var leaf = yinParser.__test.yangParser.createNewNode('LEAF', 'leaf', null, constants.NODE_UI_DISPLAY);
                  nodeWrapper.wrapAll(leaf);
                  subApi1.setNode(leaf);
                  subApi2.setNode(leaf);

                  apis = [{ basePath: 'dummyBase', module: 'M', revision: '1', subApis: [subApi1, subApi2] } ];
                  success(apis, allNodes);
              };

              // $httpBackend.when('PUT', 'dummyBase/config/M:N').respond({});

              yanguiCtrl = $controller('yanguiCtrl', {$scope: $scope, $rootScope: $rootScope, $http: _$http_, 
                Restangular: Restangular, yangUtils: yangUtils, reqBuilder: reqBuilder, apiConnector: apiConnector});

              // $httpBackend.flush();
              // $timeout.flush();
          }));

          afterEach(function() {
              $httpBackend.verifyNoOutstandingExpectation();
              $httpBackend.verifyNoOutstandingRequest();
          });

          it('status callbacks', function(){
            var e = 'dummyString';
            $scope.status = {};
            $scope.__test.processingModulesCallback();
            expect($scope.status.isWorking).toBe(true);
            $scope.status = {};
            $scope.__test.processingModulesSuccessCallback();
            expect($scope.status.type).toBe('success');
            $scope.status = {};
            $scope.__test.processingModulesErrorCallback(e);
            expect($scope.status.type).toBe('danger');
            $scope.status = {};
            $scope.__test.requestWorkingCallback();
            expect($scope.status.isWorking).toBe(true);
            $scope.status = {};
            $scope.__test.requestSuccessCallback();
            expect($scope.status.type).toBe('success');
            $scope.status = {};
            $scope.__test.requestErrorCallback();
            expect($scope.status.type).toBe('danger');
          });

          it('dismissStatus', function() {
              var emptyObj = {};
              $scope.status = {
                  type: 'dummyType'
              };

              expect($scope.status.type).toBe('dummyType');
              $scope.dismissStatus();
              expect($scope.status.type).toBeUndefined();
          });

          it('loadApis', function() {
              $scope.__test.loadApis();

              // $httpBackend.flush();
              // $timeout.flush();
              expect($scope.apis.length).toBe(1); 
              expect($scope.apis[0].subApis.length).toBe(2);
          });

          it('loadApis - error', function() {
              yangUtils.generateNodesToApis = function(success, error) {
                  error('dummyError');
              };
              $scope.__test.loadApis();
          });

          it('loadController', function() {
              $scope.loadController();

              // $httpBackend.flush();
              // $timeout.flush();
              expect($scope.apis.length).toBe(1);
              expect($scope.apis[0].subApis.length).toBe(2);
          });

          it('setApiNode', function() {
              var branch = {indexApi: 0, indexSubApi: 0};
              $scope.setApiNode(branch.indexApi, branch.indexSubApi);
              expect($scope.selApi).toBe($scope.apis[branch.indexApi]);
              expect($scope.selSubApi).toBe($scope.apis[branch.indexApi].subApis[branch.indexSubApi]);
              expect($scope.apiType).toBe('');
              expect($scope.node).toBe($scope.apis[branch.indexApi].subApis[branch.indexSubApi].node);

              $scope.setApiNode();
              expect($scope.selApi).toBe(null);
              expect($scope.selSubApi).toBe(null);
              expect($scope.node).toBe(null);

              branch = {indexApi: 0, indexSubApi: 1};
              $scope.setApiNode(branch.indexApi, branch.indexSubApi);
              expect($scope.selApi).toBe($scope.apis[branch.indexApi]);
              expect($scope.selSubApi).toBe($scope.apis[branch.indexApi].subApis[branch.indexSubApi]);
              expect($scope.apiType).toBe('operational/');
              expect($scope.node).toBe($scope.apis[branch.indexApi].subApis[branch.indexSubApi].node);
          });

          it('setNode', function() {
              $scope.selSubApi = { node: $scope.apis[0].subApis[0].node };

              $scope.setNode();
              expect($scope.node).toBe($scope.selSubApi.node);
          });

      });
  });
});
