define(['app/yangui/yangui.module', 'app/yangui/yangui.services', 'app/yangui/abn_tree.directive', 'app/yangui/sticky.directive'], function(yangui) {

  yangui.register.controller('yanguiCtrl', ['$scope', '$rootScope', '$http', 'YangConfigRestangular', 'yangUtils', 'reqBuilder', 'apiConnector',
    function ($scope, $rootScope, $http, Restangular, yangUtils, reqBuilder, apiConnector) {
      $rootScope['section_logo'] = 'logo_yangui';

      $scope.currentPath = './assets/views/yangui';
      $scope.apiType = '';

      $scope.status = {
          type: 'noreq',
          msg: null
      };
      $scope.topologyData = { nodes: [], links: []};

      var processingModulesCallback = function() {
          $scope.status = {
              isWorking: true,
              type: 'warning',
              msg: 'PROCESSING_MODULES'
          };
      };

      var processingModulesSuccessCallback = function() {
          $scope.status = {
              type: 'success',
              msg: 'PROCESSING_MODULES_SUCCESS'
          };
      };

      var processingModulesErrorCallback = function(e) {
          $scope.status = {
              type: 'danger',
              msg: 'PROCESSING_MODULES_ERROR',
              rawMsg: e.toString()
          };
      };

      var requestWorkingCallback = function() {
          $scope.status = {
              isWorking: true,
              type: 'warning',
              msg: 'SEND_WAIT'
          };
      };

      var requestOperErrorCallback = function() {
          $scope.status = {
              type: 'danger',
              msg: 'SEND_OPER_ERROR'
          };
      };

      var requestSuccessCallback = function() {
          $scope.status = {
              type: 'success',
              msg: 'SEND_SUCCESS'
          };
      };

      var requestErrorCallback = function() {
          $scope.status = {
              type: 'danger',
              msg: 'SEND_ERROR'
          };
      };

      var setCustFunct = function(apis) {
          apiConnector.createCustomFunctionalityApis(
              apis, 
              'network-topology', 
              null, 
              '/operational/network-topology:network-topology/', 
              'Display Topology', 
              function() {
                  if($scope.node && 
                    $scope.node.getChildren('list', 'topology').length > 0 && 
                    $scope.node.getChildren('list', 'topology')[0].actElemStructure) {
                      var dataList = [],
                          dataObj = {};

                      $scope.node.getChildren('list', 'topology')[0].actElemStructure.listElemBuildRequest(reqBuilder, dataList);
                      dataObj = {'network-topology': { 'topology': dataList }};

                      $scope.topologyData = yangUtils.transformTopologyData(dataObj);
                      console.info('got topology data:',$scope.topologyData,'from',dataObj);
                  }
              }
          );

          apiConnector.createCustomFunctionalityApis(
              apis, 
              'opendaylight-inventory', 
              null, 
              '/config/opendaylight-inventory:nodes/node/{id}/flow-node-inventory:table/{id}/flow/{id}/', 
              'Verify operational flow', 
              function() {

                  var requestPath = $scope.selApi.basePath+'/'+$scope.selSubApi.buildApiRequestString().replace('config','operational'),
                      requestData = {},
                      identifiers,
                      getPathIdentifierData = function(pathArray){
                          var data = '';
                          pathArray.forEach(function(item){
                              if( item.hasIdentifier() ) {
                                  data += item.name + ': ' + item.identifierValue + '\n ';
                              }
                          });
                          return data;
                      };

                  $http({method: "GET", url: requestPath}).
                      success(function(data) {
                          if(data) {
                              identifiers = getPathIdentifierData($scope.selSubApi.pathArray);
                              alert('Flow: \n\n' + identifiers + '\n\n is in controller.');
                          }
                      }).
                      error(function(data, status) {
                          console.info('error sending request to',requestPath,'got',status,'data',data);
                          identifiers = getPathIdentifierData($scope.selSubApi.pathArray);
                          alert('Flow: \n\n' + identifiers + '\n\n isn\'t in controller.');
                      });

                      }
                  );
          
      };

      $scope.clearTopologyData = function() {
          $scope.topologyData = { nodes: [], links: []};
      };

      var loadApis = function loadApis() {
          $scope.apis = [];
          $scope.allNodes = [];
          $scope.treeApis = [];

          processingModulesCallback();
          yangUtils.generateNodesToApis(function(apis, allNodes) {
              $scope.apis = apis;
              $scope.allNodes = allNodes;
              console.info('got data',$scope.apis, allNodes);
              yangUtils.generateApiTreeData(apis, function(treeApis) {
                  $scope.treeApis = treeApis;
                  console.info('tree api', $scope.treeApis);
              });
              processingModulesSuccessCallback();

              setCustFunct($scope.apis);
          }, function(e) {
              processingModulesErrorCallback(e);
          });
      };

      $scope.dismissStatus = function() {
          $scope.status = {};
      };

      $scope.setNode = function() {
          $scope.node = $scope.selSubApi.node;
      };

      $scope.filterNodes = function(node) {
          return true;
      };

      $scope.setApiNode = function(branch) {
          if(branch.indexApi !== undefined && branch.indexSubApi !== undefined ) {
              $scope.selApi = $scope.apis[branch.indexApi];
              $scope.selSubApi = $scope.selApi.subApis[branch.indexSubApi];
              $scope.apiType = $scope.selSubApi.pathArray[0].name === 'operational' ? 'operational/':'';
              $scope.node = $scope.selSubApi.node;
              $scope.node.clear();
          } else {
              $scope.selApi = null;
              $scope.selSubApi = null;
              $scope.node = null;
          }
      };

      $scope.loadController = function() {
          $scope.flows = [];
          $scope.devices = [];
          $scope.apis = [];
          $scope.previewVisible = false;
          $scope.previewValue = '';

          loadApis();
      };

      $scope.executeOperation = function(operation) {
          var requestPath = $scope.selApi.basePath+'/'+$scope.selSubApi.buildApiRequestString(),
              requestData = {};

          $scope.node.buildRequest(reqBuilder, requestData);
          requestWorkingCallback();

          $http({method: operation, url: requestPath, data: requestData, headers: { "Content-Type": "application/yang.data+json"}}).
              success(function(data) {
                  if(data) {
                      var props = Object.getOwnPropertyNames(data);

                      $scope.node.clear();
                      $scope.node.fill(props[0], data[props[0]]);
                  }
                  requestSuccessCallback();
              }).
              error(function(data, status) {
                  requestErrorCallback();
                  console.info('error sending request to',requestPath,'got',status,'data',data);
              }
          );
      };

      $scope.executeCustFunctionality = function(custFunct) {
          custFunct.runCallback();
      };

      $scope.showPreview = function() {
          $scope.preview();
          $scope.previewVisible = true;
      };

      $scope.hidePreview = function() {
          $scope.previewVisible = false;
      };

      $scope.preview = function() {
          if($scope.node) {
              $scope.previewValue = yangUtils.getRequestString($scope.node);
          } else {
              $scope.previewValue = '';
          }
      };

      $scope.__test = {
          loadApis: loadApis
      };

      $scope.loadController();
  }]);

  yangui.register.controller('leafCtrl', function ($scope) {
      $scope.changed = function() {
          $scope.preview();
      };
  });

  yangui.register.controller('containerCtrl', function ($scope) {
      $scope.toggleExpanded = function() {
          $scope.node.expanded = !$scope.node.expanded;
      };
  });

  yangui.register.controller('caseCtrl', function ($scope) {
      $scope.empty = ($scope.case.children.length === 0 || ($scope.case.children.length === 1 && $scope.case.children[0].children.length ===0));
  });

  yangui.register.controller('choiceCtrl', function ($scope, constants) {
    $scope.constants = constants;
    $scope.toggleExpanded = function() {
        $scope.node.expanded = !$scope.node.expanded;
    };
  });

  yangui.register.controller('rpcCtrl', function ($scope) {
    $scope.toggleExpanded = function() {
        $scope.node.expanded = !$scope.node.expanded;
    };
  });

  yangui.register.controller('inputCtrl', function ($scope) {
    $scope.toggleExpanded = function() {
        $scope.node.expanded = !$scope.node.expanded;
    };
  });

  yangui.register.controller('outputCtrl', function ($scope) {
    $scope.toggleExpanded = function() {
        $scope.node.expanded = !$scope.node.expanded;
    };
  });

  yangui.register.controller('listCtrl', function ($scope) {
      $scope.actElement = null;
      $scope.showModal = false;
      $scope.currentDisplayIndex = 1;
      $scope.displayOffsets = [-1, 0, 1];

      $scope.addListElem = function() {
          $scope.node.addListElem();
      };

      $scope.removeListElem = function(elemIndex) {
          $scope.node.removeListElem(elemIndex);
          $scope.preview();
          $scope.currentDisplayIndex = Math.max(Math.min($scope.currentDisplayIndex, $scope.node.listData.length - 2), 1);
      };

      $scope.toggleExpanded = function() {
          $scope.node.expanded = !$scope.node.expanded;
      };

      $scope.shiftDisplayNext = function() {
          $scope.currentDisplayIndex = Math.min($scope.currentDisplayIndex + 3, $scope.node.listData.length - 2);
      };

      $scope.shiftDisplayPrev = function() {
          $scope.currentDisplayIndex = Math.max($scope.currentDisplayIndex - 3, 1);
      };

      $scope.showPrevButton = function() {
         return $scope.currentDisplayIndex > 1;
      };

      $scope.showNextButton = function() {
         return $scope.node.listData ? $scope.currentDisplayIndex < $scope.node.listData.length - 2 : false; //node is selected after view is loaded
      };

      $scope.showModalWin = function() {
        $scope.showModal = !$scope.showModal;
      };

      $scope.getListName = function(offset, config) {
        var createdListItemName = $scope.node.createListName($scope.currentDisplayIndex + offset);

        if ( createdListItemName.length > 33 ) {
          return {
            name: createdListItemName.substring(0,30) + '...',
            tooltip: createdListItemName
          };
        } else {
          return {
            name: config ? createdListItemName || '[' + ($scope.currentDisplayIndex + offset) + ']' : createdListItemName,
            tooltip: ''
          };
        }

      };

  });

  yangui.register.controller('leafListCtrl', function ($scope) {

      $scope.addListElem = function() {
          $scope.node.addListElem();
      };

      $scope.removeListElem = function(elem){
          $scope.node.removeListElem(elem);
      };

      $scope.changed = function() {
          $scope.preview();
      };

      $scope.toggleExpanded = function() {
          $scope.node.expanded = !$scope.node.expanded;
      };

  });

});
