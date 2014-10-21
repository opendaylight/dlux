define(['app/yangui/yangui.module', 'app/yangui/yangui.services', 'app/yangui/abn_tree.directive', 'app/yangui/sticky.directive', 'app/yangui/pluginHandler.services'], function(yangui) {

  yangui.register.controller('yanguiCtrl', ['$scope', '$rootScope', '$http', 'YangConfigRestangular', 'yangUtils', 'reqBuilder', 'apiConnector', 'pluginHandler', 'pathUtils', 'constants',
    function ($scope, $rootScope, $http, Restangular, yangUtils, reqBuilder, apiConnector, pluginHandler, pathUtils, constants) {
      $rootScope['section_logo'] = 'logo_yangui';

      $scope.currentPath = './assets/views/yangui';
      $scope.apiType = '';
      $scope.constants = constants;

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

      var requestErrorCallback = function() {
          $scope.status = {
              type: 'danger',
              msg: 'SEND_ERROR'
          };
      };

      var setCustFunct = function(apis) {
          pluginHandler.plugAll($scope.apis, $scope);
      };

      $scope.unsetCustomFunctionality = function() {
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

      $scope.setApiNode = function(indexApi, indexSubApi) {
          if(indexApi !== undefined && indexSubApi !== undefined ) {
              $scope.selApi = $scope.apis[indexApi];
              $scope.selSubApi = $scope.selApi.subApis[indexSubApi];
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
          $scope.popupData = { show: false};
          $scope.dataToFill = '';
          $scope.apiToFill = '';

          loadApis();
      };

      $scope.executeOperation = function(operation, callback) {
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
                      // console.log('$scope.node',$scope.node);
                      dataFilled = true;
                  }
                  
                  requestSuccessCallback();
                  $scope.addRequestToList('success', data, requestData, operation, requestPath);

                  if ( angular.isFunction(callback) ) {
                    callback(data);
                  }
                  

              }).
              error(function(data, status) {
                  
                  requestErrorCallback();
                  $scope.addRequestToList('error', data, requestData, operation, requestPath);

                  console.info('error sending request to',requestPath,'got',status,'data',data);
              }
          );
      };

      $scope.executeCustFunctionality = function(custFunct) {
          custFunct.runCallback($scope);
          $scope.selCustFunct = custFunct;
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
              $scope.previewValue = yangUtils.getPathString($scope.selApi.basePath, $scope.selSubApi);
              $scope.previewValue = $scope.previewValue + '\r\n' + yangUtils.getRequestString($scope.node);
          } else {
              $scope.previewValue = '';
          }
      };
      
      $scope.changePathInPreview = function() {
          if($scope.node) {
              $scope.previewValue = yangUtils.getPathString($scope.selApi.basePath, $scope.selSubApi) + '\r\n' + $scope.previewValue.substring($scope.previewValue.indexOf('{'), $scope.previewValue.length);
          } else {
              $scope.previewValue = '';
          }
      };

      $scope.fillApiAndData = function(path, data) {
          console.info('filling',path, data);
          if(path) {
              $scope.fillApi(path);
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
          try {
              obj = typeof data === "object" ? data : JSON.parse(data);
              console.info('fillApiData: $scope.node is',$scope.node,'with',obj, typeof obj === "object");

              if (obj !== null && typeof obj === "object") {
                  var p = Object.keys(obj)[0];
                  console.info('filling',p,obj[p]);
                  $scope.node.fill(p, obj[p]);
              }
          } catch(e){
              console.log(e);
              throw(e);
          }
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

    $scope.clearHistoryData = function(){
      localStorage.clear();
      $scope.requestList = [];
      $scope.collectionList = [];
    };

    $scope.executeCollectionRequest = function(req){
      $scope.fillApi(req.path);
      if ( req.sentData ) {
        console.log(req.sentData);
        $scope.fillApiData(req.sentData);
      }
      
      $scope.executeOperation(req.method, function(data){
        if ( !data &&  req.receivedData ){
          $scope.node.fill(req.receivedData);
        }
      });
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

  yangui.register.controller('listCtrl', function ($scope) {
      $scope.actElement = null;
      $scope.showModal = false;
      $scope.showListFilter = false;
      $scope.currentDisplayIndex = 1;
      $scope.displayOffsets = [-1, 0, 1];

      $scope.addListElem = function() {
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
          $scope.node.showListFilterWin();
          $scope.showListFilter = !$scope.showListFilter;
          if($scope.showModal){
              $scope.showModal = !$scope.showModal;
          }
      };

      $scope.getFilterData = function() {
          $scope.node.getFilterData();
      };

      $scope.switchFilter = function(showedFilter) {
         $scope.node.switchFilter(showedFilter);
      };

      $scope.createNewFilter = function() {
         $scope.node.createNewFilter();
      };

      $scope.applyFilter = function() {
          $scope.node.applyFilter();
          $scope.showListFilter = !$scope.showListFilter;
          $scope.currentDisplayIndex = 1;
      };

      $scope.clearFilterData = function(changeAct,filterForClear) {
        $scope.node.clearFilterData(changeAct,filterForClear);
        if(changeAct){
            $scope.showListFilter = !$scope.showListFilter;
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
      console.log('value change leafctrl');
      
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
      console.log('value change leafctrl');

      // $scope.node.checkValueType();
      // $scope.node.fill($scope.node.label, $scope.node.value);
    };

  });

  yangui.register.controller('typeEnumCtrl', function($scope){

    $scope.valueChanged = function(){
      console.log('value change bitctrl');
      $scope.type.setLeafValue($scope.type.selEnum.label);

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
      console.log('value change bitctrl');
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

  yangui.register.controller('filter', function($scope){
    $scope.isFilter = true;
  });

yangui.register.controller('filterTypeEnumCtrl', function($scope){

    $scope.valueChanged = function(){
      console.log('value change bitctrl');
      $scope.type.setLeafValue($scope.type.selEnum.label);

      // $scope.node.checkValueType();
      // $scope.node.fill($scope.node.label, $scope.node.value);
    };
    
  });

yangui.register.controller('filterTypeBitCtrl', function($scope){

    $scope.valueChanged = function(){
      console.log('value change bitctrl');
      $scope.type.setLeafValue($scope.type.bitsValues);

      // $scope.node.checkValueType();
      // $scope.node.fill($scope.node.label, $scope.node.value);
    };
    
  });

});
