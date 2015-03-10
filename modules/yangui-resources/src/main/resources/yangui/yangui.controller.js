define(['app/yangui/yangui.module', 'app/yangui/yangui.services', 'app/yangui/abn_tree.directive', 'app/yangui/sticky.directive', 'app/yangui/pluginHandler.services'], function(yangui) {

  yangui.register.controller('yanguiCtrl', ['$scope', '$rootScope', '$http', 'YangUtilsRestangular', 'yangUtils', 'reqBuilder', 'apiConnector', 'pluginHandler', 'pathUtils', 'constants', 'nodeWrapper', 'mountPointsConnector', 'filterConstants','displayMountPoints','yinParser',
    function ($scope, $rootScope, $http, YangUtilsRestangular, yangUtils, reqBuilder, apiConnector, pluginHandler, pathUtils, constants, nodeWrapper, mountPointsConnector, filterConstants, displayMountPoints, yinParser) {
      $rootScope['section_logo'] = 'logo_yangui';

      $scope.currentPath = './assets/views/yangui';
      $scope.apiType = '';
      $scope.constants = constants;
      $scope.filterConstants = filterConstants;
      $scope.mountModule = '';
      $scope.mountNode = '';
      $scope.mountBckOperations = [];
      $scope.filterRootNode = null;

      $scope.status = {
          type: 'noreq',
          msg: null
      };
      // $scope.topologyData = { nodes: [], links: []};

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

      var requestSuccessCallback = function() {
          $scope.status = {
              type: 'success',
              msg: 'SEND_SUCCESS'
          };
      };

      var requestErrorCallback = function(e) {
          $scope.status = {
              type: 'danger',
              msg: 'SEND_ERROR',
              rawMsg: e.toString()
          };
      };

      var setCustFunct = function(apis) {
          pluginHandler.plugAll($scope.apis, $scope);
      };

      var refreshSelSubApiPathArray = function(selSubApi){
          var pathArray = pathUtils.translate(selSubApi.pathTemplateString, null, null);
          selSubApi.pathArray = pathArray;
      };

      $scope.unsetCustomFunctionality = function() {
          if($scope.selCustFunct && $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS'){
            refreshSelSubApiPathArray($scope.selSubApi);
            $scope.setApiNode($scope.apis.indexOf($scope.selApi),$scope.selApi.subApis.indexOf($scope.selSubApi), true);
            $scope.mountModule = '';
            $scope.mountNode = '';
            $scope.selSubApi.operations = $scope.mountBckOperations;
          }
          $scope.selCustFunct = null;
      };

      var loadApis = function loadApis() {
          $scope.apis = [];
          $scope.allNodes = [];
          $scope.treeApis = [];

          processingModulesCallback();
          console.time('generateNodesToApis');
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
              console.timeEnd('generateNodesToApis');
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

      $scope.setApiNode = function(indexApi, indexSubApi, unsetCust) {
          if(!unsetCust){
             $scope.unsetCustomFunctionality();
          }
          if(indexApi !== undefined && indexSubApi !== undefined ) {
              $scope.selApi = $scope.apis[indexApi];
              $scope.selSubApi = $scope.selApi.subApis[indexSubApi];

              $scope.apiType = $scope.selSubApi.pathArray[0].name === 'operational' ? 'operational/':'';
              $scope.node = $scope.selSubApi.node;
              $scope.filterRootNode = $scope.selSubApi.node;
              $scope.node.clear();
              $scope.$broadcast('EV_REFRESH_LIST_INDEX');
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
          $scope.popupData = { show: false};
          $scope.dataToFill = '';
          $scope.apiToFill = '';

          loadApis();
      };

      $scope.executeOperation = function(operation, callback, reqPath) {
          var reqString = $scope.selSubApi.buildApiRequestString(),
              requestData = {},
              headers = { "Content-Type": "application/yang.data+json"};

          reqString = reqPath ? reqPath.slice($scope.selApi.basePath.length+1,reqPath.length) : $scope.applyMoutPoint(reqString, operation);

          var requestPath = $scope.selApi.basePath+'/'+reqString;
          $scope.node.buildRequest(reqBuilder, requestData);
          requestWorkingCallback();

          operation = operation === 'DELETE' ? 'REMOVE' : operation;
          YangUtilsRestangular.one('restconf').customOperation(operation.toLowerCase(), reqString, null, headers, requestData).then(
              function(data) {
                  if(operation === 'REMOVE'){
                      $scope.node.clear();
                  }

                  if(data) {
                      $scope.node.clear();
                      if($scope.selCustFunct && $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS' && $scope.mountModule === ''){
                          var mpProps = Object.getOwnPropertyNames(data);
                          var nodeToFill = null;
                          var mpModule = null;
                          var mpLabel = null;

                          nodeToFill = $scope.node.children.filter(function(child){
                              var propName = null;
                              for(var prop in data){
                                  if(prop.indexOf(':') !== -1){
                                      propName = prop;
                                  }
                              }
                              mpModule = propName.slice(0,propName.indexOf(':'));
                              mpLabel = propName.slice(propName.indexOf(':')+1,propName.length);

                              return mpModule === child.module && mpLabel === child.label;
                          });
                          nodeToFill = nodeToFill[0];

                          $scope.node.children[$scope.node.children.indexOf(nodeToFill)].fill(mpProps[0], data[mpProps[0]]);
                          dataFilled = true;
                          $scope.node.expanded = true;
                      }else{
                          var props = Object.getOwnPropertyNames(data);
                          $scope.node.fill(props[0], data[props[0]]);
                          dataFilled = true;
                      }
                  }
                  
                  requestSuccessCallback();
                  $scope.addRequestToList('success', data, requestData, operation, requestPath);

                  if ( angular.isFunction(callback) ) {
                    callback(data);
                  }
                  

              }, function(resp) {
                  var errorMsg = '';

                  if(resp.data && resp.data.errors && resp.data.errors.error && resp.data.errors.error.length) {
                      errorMsg = ': ' + resp.data.errors.error.map(function(e) {
                          return e['error-message'];
                      }).join(', ');
                  }

                  requestErrorCallback(errorMsg);
                  $scope.addRequestToList('error', resp.data, requestData, operation, requestPath);

                  console.info('error sending request to',$scope.selSubApi.buildApiRequestString(),'reqString',reqString,'got',resp.status,'data',resp.data);
              }
          );
      };

      $scope.executeCustFunctionality = function(custFunct) {
          custFunct.runCallback($scope);

          $scope.selCustFunct = custFunct;
          if(custFunct.label === 'YANGUI_CUST_MOUNT_POINTS'){
              $scope.mountBckOperations = $scope.selSubApi.operations;
              $scope.node = null;
              $scope.filterRootNode = null;
              refreshMpOperations();
          }
      };

      $scope.showPreview = function() {
          $scope.previewVisible = true;
          $scope.preview();
      };

      $scope.hidePreview = function() {
          $scope.previewVisible = false;
      };

      $scope.buildRoot = function() {
          $scope.node.buildRequest(reqBuilder, {});
      };

      $scope.preview = function() {
          if($scope.node) {
              $scope.previewValue = $scope.applyMoutPoint(yangUtils.getPathString($scope.selApi.basePath, $scope.selSubApi), 'GET');
              $scope.previewValue = $scope.previewValue + '\r\n' + yangUtils.getRequestString($scope.node);
          } else {
              $scope.previewValue = '';
          }
      };
      
      $scope.changePathInPreview = function() {
          // if($scope.node) {
          //     $scope.previewValue = yangUtils.getPathString($scope.selApi.basePath, $scope.selSubApi) + '\r\n' + $scope.previewValue.substring($scope.previewValue.indexOf('{'), $scope.previewValue.length);
          // } else {
          //     $scope.previewValue = '';
          // }
          $scope.preview();
      };

      $scope.fillApiAndData = function(path, data) {
          console.info('filling',path, data);
          if(path) {
              if(path.indexOf('yang-ext:mount') === -1){
                $scope.fillApi(path);
              }
              if($scope.node && data) {
                console.info('fillApiAndData: $scope.node is',$scope.node);
                $scope.fillApiData(data);
              }
          }
      };

      $scope.fillApi = function(path) {
        var apiIndexes = pathUtils.searchNodeByPath(path, $scope.treeApis, $scope.treeRows);

        if(apiIndexes) {
          $scope.setApiNode(apiIndexes.indexApi, apiIndexes.indexSubApi);

          console.info('set scope node to',$scope.node);
          if($scope.selSubApi) {
            pathUtils.fillPath($scope.selSubApi.pathArray, path);
          }
        }
      };

      $scope.fillApiData = function(data){
          var obj = null;
          // try {
              obj = typeof data === "object" ? data : JSON.parse(data);
              console.info('fillApiData: $scope.node is',$scope.node,'with',obj, typeof obj === "object");

              if (obj !== null && typeof obj === "object") {
                  var p = Object.keys(obj)[0];
                  console.info('filling',p,obj[p]);
                  $scope.node.fill(p, obj[p]);
              }
          // } catch(e){
          //     console.log(e);
          //     throw(e);
          // }
      };

      $scope.show_add_data_popup = function(){
        $scope.popupData.show = true;
      };

      $scope.close_popup = function(popObj){
        popObj.show = false;
      };

      $scope.tabs = function(event, index){
        // console.log(event);
        var tabDom = $(event.target).closest('.tabs');

        tabDom.find('.tab-content .tab-pane')
          .removeClass('active')
          .eq(index).addClass('active');

        tabDom.find('.nav-tabs li')
          .removeClass('active')
          .eq(index).addClass('active');
      };

      $scope.addRequestToList = function(status, receivedData, sentData, operation, path){
        var emptyObj = {
              list: []
            };

        if(typeof(Storage) !== "undefined") {
          var rList = JSON.parse(localStorage.getItem("requestList")),
              reqObj = {},
              requestData = {};

          reqObj.sentData = $.isEmptyObject(sentData) ? null : sentData;
          reqObj.path = path;
          reqObj.method = operation;
          reqObj.status = {};
          reqObj.receivedData = null;
          reqObj.data = null;
          reqObj.show = false;

          reqObj.status = status;
          if ( status === 'success' ) {
            reqObj.receivedData  = receivedData ? receivedData : null;
          }
          rList = rList !== null ? rList : emptyObj;
          rList.list.push(reqObj);
          try {
            localStorage.setItem("requestList", JSON.stringify(rList));
            $scope.historyData = rList.list;
          } catch(e) {
            console.info('DataStorage error:', e);
          }

        }
      };

      $scope.resetMpModule = function(){
          $scope.mountModule = '';
          refreshMpOperations();
          $scope.initMp();
      };

      $scope.loadMountPointData = function(node, api) {
          $scope.node = node;
          $scope.filterRootNode = node;
          $scope.apiType = '';
          $scope.node.clear();
      };

      var getMpIdentifier = function(selSubApi){
          return selSubApi.pathArray.filter(function(path){
              return path.identifierName !== undefined;
          }).map(function(el){
              return el.identifierValue;
          });
      };

      var fillMpIdentifier = function(selSubApi,mpIdentifier){
          selSubApi.pathArray.map(function(path){
              if(path.identifierName !== undefined){
                    path.identifierValue = mpIdentifier;
                    path.identifierName = mpIdentifier;
              }else{
                    return path;
              }
          });
      };

      var getMpApiPathWithIdentifier = function(moduleNode, path, node){
          return moduleNode ? path + node.module+':'+node.label : path;
      };

      var getMPpathArray = function(moduleNode, node){
          var path,mpIdentifier,apiPath,pathArray;

          var checkMp = $scope.selSubApi.pathArray.some(function(path){
              return path.name === 'mount';
          });

          mpIdentifier = getMpIdentifier($scope.selSubApi);

          if(checkMp){
              refreshSelSubApiPathArray($scope.selSubApi);
              fillMpIdentifier($scope.selSubApi,mpIdentifier);
          }

          path = mountPointsConnector.getMpPath($scope.selSubApi,mpIdentifier) + '/yang-ext:mount/';
          apiPath = getMpApiPathWithIdentifier(moduleNode, path, node);

          pathArray = pathUtils.translate(apiPath, null, null);

          pathArray = pathArray.map(function(path){
              if(path.identifierName){
                  path.identifierValue = path.identifierName;
              }
              return path;
          });

          $scope.selSubApi.pathArray = pathArray;

          return apiPath;
      };

      var refreshMpOperations = function(){
          $scope.selSubApi.operations = $scope.mountModule !== '' ? ['GET','PUT','DELETE'] : ['GET'];
      };

      $scope.showMountPoint = function(node){
          $scope.mountModule = node.module;
          refreshMpOperations();
          $scope.mountNode = node.label;
          $scope.$broadcast('EV_REFRESH_LIST_INDEX');
          $scope.loadMountPointData(node, getMPpathArray(true, node));
      };

      $scope.initMp = function(){
          var node = null;
          var yangParser = yinParser.yangParser;
          
          yangParser.setCurrentModuleObj(new yinParser.Module('M', 'R', 'NS'));
          node = yangParser.createNewNode('mount_point','container',null, constants.NODE_UI_DISPLAY);
          nodeWrapper.wrapAll(node);

          $scope.mountPointsStructure.forEach(function(mp){
              if(mp.children.length){
                  mp.children.forEach(function(mpChild){
                      node.children.push(mpChild);
                  });
              }
          });

          $scope.node = node;

          getMPpathArray(false,null);
      };

      $scope.expand = function(mountPoint){
          mountPoint.expanded = !mountPoint.expanded;
      };

      $scope.applyMoutPoint = function(reqString, operation){
          if($scope.selCustFunct && $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS'){
              if(reqString.indexOf('operational') === 0){
                  reqString = 'config' + reqString.slice(11,reqString.length);
              }
              return reqString;
          }else{
              return reqString;
          }
      };

      $scope.__test = {
          loadApis: loadApis,
          processingModulesErrorCallback: processingModulesErrorCallback,
          requestErrorCallback: requestErrorCallback,
          requestSuccessCallback: requestSuccessCallback,
          requestWorkingCallback: requestWorkingCallback,
          processingModulesCallback: processingModulesCallback,
          processingModulesSuccessCallback: processingModulesSuccessCallback
      };

      $scope.loadController();

      }]);

  yangui.register.controller('requestHistoryCtrl', ['$scope', '$rootScope','pathUtils', function ($scope, $rootScope, pathUtils) {
    
    $scope.popupHistory = { show: false};
    $scope.reqHistoryFunc = function(){
      $scope.popupHistory.show = !$scope.popupHistory.show;

      
      
      var rList = JSON.parse(localStorage.getItem('requestList')),
          cList = JSON.parse(localStorage.getItem("collectionList"));

      // console.log(localStorage);
      // console.log(rList);
      $scope.requestList = rList !== null ? rList.list : [];
      $scope.collectionList = cList !== null ? cList.list : [];
      $scope.requestList.show = false;
    };

    $scope.show_history_data = function(req, sended, noData){

      if ( !noData ) {
        req.data = JSON.stringify(sended ? req.sentData : req.receivedData, null, 4);
        req.show = true;
      }

    };

    $scope.collectionData = [];
    $scope.addHistoryItemToColl = function(index){
      var rList = JSON.parse(localStorage.getItem("requestList")),
          cList = JSON.parse(localStorage.getItem("collectionList")),
          emptyObj = {
                        list: []
                      };

      cList = cList !== null ? cList : emptyObj;

      if ( rList.list.length ) {
        cList.list.push(rList.list[index]);
        localStorage.setItem("collectionList", JSON.stringify(cList));
        $scope.collectionList = cList.list;
      }
    };

    $scope.deleteRequestItem = function(index, type){
      var rlist = JSON.parse(localStorage.getItem(type));
          rlist.list.splice(index, 1);
          $scope[type] = rlist.list;
          localStorage.setItem(type, JSON.stringify(rlist));
    };

    $scope.clearHistoryData = function(fromHistory){
        var rlist = {'list':[]};
        if(!fromHistory){
            $scope.collectionList = [];
            localStorage.setItem('collectionList', JSON.stringify(rlist));
        }else{
            $scope.requestList = [];
            localStorage.setItem('requestList', JSON.stringify(rlist));
        }
    };

    $scope.executeCollectionRequest = function(req){
      if(req.path.indexOf('yang-ext:mount') === -1){
          $scope.fillApi(req.path);
          // $scope.executeCustFunctionality($scope.selSubApi.custFunct[0]);
      }
      
      if ( req.sentData ) {
        $scope.fillApiData(req.sentData);
      }

      $scope.executeOperation(req.method, function(data){
          if ( !data &&  req.receivedData ){
            $scope.node.fill($scope.node.label,req.receivedData[$scope.node.label]);
          }
      },req.path);
    };
  }]);

  yangui.register.controller('leafCtrl', function ($scope) {
      // $scope.$watch('node.value', function() {
          // console.info('filling',$scope.node);
          // $scope.preview();
          // $scope.node.checkValueType();
          // $scope.node.fill($scope.node.label, $scope.node.value);
      // });


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

  yangui.register.controller('listCtrl', function ($scope, listFiltering, nodeWrapper) {
      $scope.actElement = null;
      $scope.showModal = false;
      $scope.showListFilter = false;
      $scope.filterListHover = 0;
      $scope.currentDisplayIndex = 1;
      $scope.displayOffsets = [-1, 0, 1];

      $scope.$on('EV_REFRESH_LIST_INDEX', function(event) {
          $scope.currentDisplayIndex = 1;
      });

      $scope.addListElem = function() {
          $scope.showListFilter = false;
          $scope.showModal = false;
          listFiltering.removeEmptyFilters($scope.node);
          $scope.node.addListElem();
      };

      $scope.removeListElem = function(elemIndex,fromFilter) {
          $scope.node.removeListElem(elemIndex,fromFilter);
          $scope.preview();
          $scope.currentDisplayIndex = Math.max(Math.min($scope.currentDisplayIndex, $scope.node.listData.length - 2), 1);
      };

      $scope.toggleExpanded = function() {
          $scope.node.expanded = !$scope.node.expanded;
      };

      $scope.shiftDisplayNext = function(typeListData) {
          $scope.currentDisplayIndex = Math.min($scope.currentDisplayIndex + 3, $scope.node[typeListData].length - 2);
      };

      $scope.shiftDisplayPrev = function() {
          $scope.currentDisplayIndex = Math.max($scope.currentDisplayIndex - 3, 1);
      };

      $scope.showPrevButton = function() {
         return $scope.currentDisplayIndex > 1;
      };

      $scope.showNextButton = function(typeListData) {
         return $scope.node[typeListData] && $scope.currentDisplayIndex < $scope.node[typeListData].length - 2; //node is selected after view is loaded
      };

      $scope.showModalWin = function() {
        $scope.showModal = !$scope.showModal;
        if($scope.showListFilter){
            $scope.showListFilter = !$scope.showListFilter;
        }
      };

      $scope.showListFilterWin = function() {
          $scope.showListFilter = !$scope.showListFilter;
          if($scope.showModal){
              $scope.showModal = !$scope.showModal;
          }
          listFiltering.showListFilterWin($scope.filterRootNode,$scope.node);
      };

      $scope.getFilterData = function() {
          listFiltering.getFilterData($scope.node);
      };

      $scope.switchFilter = function(showedFilter) {
         listFiltering.switchFilter($scope.node,showedFilter);
      };

      $scope.createNewFilter = function() {
         listFiltering.createNewFilter($scope.node);
      };

      $scope.applyFilter = function() {
          listFiltering.applyFilter($scope.node);
          $scope.showListFilter = !$scope.showListFilter;
          $scope.currentDisplayIndex = 1;
          if($scope.node.filteredListData.length){
            $scope.node.doubleKeyIndexes = nodeWrapper.checkKeyDuplicity($scope.node.filteredListData,$scope.node.refKey);
          }else{
            $scope.node.doubleKeyIndexes = nodeWrapper.checkKeyDuplicity($scope.node.listData,$scope.node.refKey);
          }
      };

      $scope.clearFilterData = function(changeAct, filterForClear, removeFilters) {
        listFiltering.clearFilterData($scope.node,changeAct,filterForClear,removeFilters);
        if(changeAct){
            $scope.showListFilter = !$scope.showListFilter;
        }
        $scope.node.doubleKeyIndexes = nodeWrapper.checkKeyDuplicity($scope.node.listData,$scope.node.refKey);
      };

      $scope.activeFilter = function(filter) {
        if(filter.active == 1){
            filter.active = 2;
        }else{
            filter.active = 1;
        }
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

  yangui.register.controller('typeCtrl', function($scope){

    $scope.valueChanged = function(){
      if($scope.previewVisible) {
        $scope.preview();
      } else {
        $scope.buildRoot();
      }

      $scope.node.checkValueType();
      $scope.node.fill($scope.node.label, $scope.node.value);
    };

  });

  yangui.register.controller('filterTypeCtrl', function($scope){

    $scope.valueChanged = function(){
      $scope.node.checkValueType();
      $scope.node.fill($scope.node.label, $scope.node.value);
    };

  });

  yangui.register.controller('typeEnumCtrl', function($scope){

    $scope.valueChanged = function(){
      var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

      $scope.type.setLeafValue(value);

      if($scope.previewVisible) {
        $scope.preview();
      } else {
        $scope.buildRoot();
      }

      $scope.node.checkValueType();
      $scope.node.fill($scope.node.label, $scope.node.value);
    };
    
  });

yangui.register.controller('typeBitCtrl', function($scope){

    $scope.valueChanged = function(){
      $scope.type.setLeafValue($scope.type.bitsValues);

      if($scope.previewVisible) {
        $scope.preview();
      } else {
        $scope.buildRoot();
      }

      $scope.node.checkValueType();
      $scope.node.fill($scope.node.label, $scope.node.value);
    };
    
  });

  yangui.register.controller('filter', function($scope, listFiltering){
    $scope.isFilter = true;

    $scope.getFilterTypeArray = function(type){
      return listFiltering.getFilterTypeArray(type);
    };
  });

yangui.register.controller('filterTypeEnumCtrl', function($scope){

    $scope.valueChanged = function(){
      var value = $scope.type.selEnum && $scope.type.selEnum.label ? $scope.type.selEnum.label : '';

      $scope.type.setLeafValue(value);

      $scope.node.checkValueType();
      $scope.node.fill($scope.node.label, $scope.node.value);
    };
    
  });

yangui.register.controller('filterTypeBitCtrl', function($scope){

    $scope.valueChanged = function(){
      $scope.type.setLeafValue($scope.type.bitsValues,true);

      $scope.node.checkValueType();
      $scope.node.fill($scope.node.label, $scope.node.value);
    };
    
  });

});
