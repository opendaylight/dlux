angular.module('console.sfc', ['sfc.config.svchost'])

.controller('serviceNodeCtrl', function ($scope, $state, ServiceFunctionSvc, ServiceNodeSvc, ServiceNodeCtrlFunc, ModalDeleteSvc) {
  $scope.deleteServiceNode = function deleteServiceNode(snName) {
    ModalDeleteSvc.open(snName, function (result) {
      if (result == 'delete') {
        ServiceNodeSvc.deleteItem({name: snName}, function () {
          //after delete refresh local service node array
          ServiceNodeSvc.getArray(function (data) {
            $scope.sns = data;
            $scope.snsGraph = ServiceNodeCtrlFunc.createGraphData($scope.sns, $scope.sfs);
          });
        });
      }
    });
  };

  $scope.editServiceNode = function editServiceNode(snName) {
    $state.transitionTo('sfc.servicenode.edit', {snName: snName}, { location: true, inherit: true, relative: $state.$current, notify: true });
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;

    ServiceNodeSvc.getArray(function (data) {
      $scope.sns = data;
      $scope.snsGraph = ServiceNodeCtrlFunc.createGraphData($scope.sns, $scope.sfs);
    });
  });
})

.controller('serviceNodeEditCtrl', function ($scope, $state, $stateParams, ServiceFunctionSvc, ServiceNodeSvc) {
  $scope.data = {};

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;

    ServiceNodeSvc.getItem($stateParams.snName, function (item) {
      $scope.data = item;
    });
  });

  $scope.submit = function () {
    ServiceNodeSvc.putItem($scope.data, function () {
      $state.transitionTo('sfc.servicenode', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    });
  };
})

.controller('serviceNodeCreateCtrl', function ($scope, $state, ServiceFunctionSvc, ServiceNodeSvc) {
  $scope.data = {};

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  $scope.submit = function () {
    ServiceNodeSvc.putItem($scope.data, function () {
      $state.transitionTo('sfc.servicenode', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    });
  };
})

.controller('serviceFunctionCtrl', function ($scope, ServiceFunctionSvc, ModalDeleteSvc) {

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  $scope.deleteSF = function deleteSF(sfName, index){
    ModalDeleteSvc.open(sfName, function(result) {
      if(result == 'delete'){
        //delete the row
        ServiceFunctionSvc.deleteItem({"name": sfName}, function () {
          $scope.sfs.splice(index, 1);
        });
      }
    });
  };
})

.controller('serviceFunctionCreateCtrl', function ($scope, $state, ServiceFunctionSvc) {

  $scope.data = {"sf-data-plane-locator": {}};

  $scope.submit = function () {
    ServiceFunctionSvc.putItem($scope.data, function () {
      $state.transitionTo('sfc.servicefunction', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    });
  };
})

.controller('serviceChainCtrl', function ($scope, ServiceFunctionSvc, ServiceChainSvc, $modal, ModalDeleteSvc, ModalSfnameSvc, SfcRpcError, sfcFormatMessage) {

  $scope.isTemporarySFC = function isTemporarySFC(sfc) {
    return sfc.temporary || false;
  };

  $scope.setTemporarySFC = function setTemporarySFC(sfc) {
    sfc.temporary = true;
  };

  $scope.unsetTemporarySFC = function unsetTemporarySFC(sfc) {
    delete sfc.temporary;
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  ServiceChainSvc.getArray(function (data) {

    //temporary SFCs are kept in local array, persisted SFCs should be removed from it
    _.each($scope.sfcs, function (sfc, index) {
      if (!$scope.isTemporarySFC(sfc)) {
        $scope.sfcs.splice(index, 1);
      }
    });

    //concat temporary with loaded data
    if (data !== undefined) {
      $scope.sfcs = $scope.sfcs.concat(data);
    }
  });

  $scope.sortableOptions = {
    connectWith: ".connected-apps-container",
    cursor: 'move',
    placeholder: 'connected grid place',
    tolerance: 'pointer',
    start: function (e, ui) {
      $(e.target).data("ui-sortable").floating = true;
    },
    update: function (e, ui) {
      //sfc[0]: name, sfc[1]: index in sfcs
      var sfc = $(ui.item).closest('tr').attr('id').split("~!~");
      $scope.setTemporarySFC($scope.sfcs[sfc[1]]);
    },
    receive: function (e, ui) {
      //sfc[0]: name, sfc[1]: index in sfcs
      var sfc = $(e.target).closest('tr').attr('id').split("~!~");
      $scope.setTemporarySFC($scope.sfcs[sfc[1]]);
    }
  };

  $scope.onSFCdrop = function ($event, $sf, sfc) {
    if (sfc['sfc-service-function'] === undefined) {
      sfc['sfc-service-function'] = [];
    }

    var added = false;

    //get list of SFs in SFC by type
    var sfsInSfc = _.where(sfc['sfc-service-function'], {type: $sf.type});

    //if SF with this type already exists in SFC, we need to use the next one with the same type
    if (angular.isDefined(sfsInSfc) && sfsInSfc.length > 0){

      //get all SFs with this type
      var sfList = _.where($scope.sfs, {type: $sf.type});

      _.each(sfList, function(sfInstance){
        //if SF with this name is not already in SFC
        if(angular.isUndefined(_.findWhere(sfsInSfc, {name: sfInstance.name})) && !added){
          sfc['sfc-service-function'].push({name: sfInstance.name, type: sfInstance.type});
          $scope.setTemporarySFC(sfc);
          added = true;
        }
      });
    }

//    if (sfNameExists !== undefined) {
//      ModalSfnameSvc.open(sfc, $sf, function(newSf){
//        if(newSf !== 'cancel') {
//          sfc['sfc-service-function'].push({name: newSf.name, type: newSf.type});
//          $scope.setTemporarySFC(sfc);
//        }
//      });
//    }
    else {
      sfc['sfc-service-function'].push({name: $sf.name, type: $sf.type});
      $scope.setTemporarySFC(sfc);
      added = true;
    }

    if(!added) {
      alert("Error: Cannot add another Service function with type '" + $sf.type + "'. " +
        "All Service functions with this type are already added in the Service chain '" + sfc.name + "'.");
    }
  };

  $scope.deleteSFC = function deleteSFC(sfcName, index) {
    ModalDeleteSvc.open(sfcName, function(result){
      if(result == 'delete'){
        //delete the row
        ServiceChainSvc.deleteItem({"name": sfcName}, function () {
          $scope.sfcs.splice(index, 1);
        });
      }
    });
  };

  $scope.removeSFfromSFC = function removeSFfromSFC(sfc) {
    sfc['sfc-service-function'].splice(this.$index, 1);
    $scope.setTemporarySFC(sfc);
  };

  $scope.persistSFC = function persistSFC(sfc) {
    $scope.unsetTemporarySFC(sfc);
    ServiceChainSvc.putItem(sfc, function () {
    });
  };

  $scope.deploySFC = function deploySFC(sfc) {
  //TODO: waiting for SFC Provider to be implemented
    ServiceChainSvc.deployChain(sfc.name, function(result){

      if (result instanceof SfcRpcError) {
        // error
        var response = result.response;
        console.log(response);
        alert(sfcFormatMessage("server responded with status: {0} ({1})\n\n{2}", response.status, response.statusText, response.data));
      } else {
        // ok
        alert("Path instantiated with name: " + result.name);
      }
    });
  };
})

.controller('serviceChainCreateCtrl', function ($scope, $state) {
  $scope.submit = function () {
    $scope.data['sfc-service-function'] = [];
    $scope.data['temporary'] = true;
    $scope.sfcs.push($scope.data);

    $state.transitionTo('sfc.servicechain', null, { location: true, inherit: true, relative: $state.$current, notify: true });
  };
})

.controller('servicePathCtrl', function ($scope, ServiceFunctionSvc, ServicePathSvc, ModalDeleteSvc) {

  $scope.isTemporarySFP = function isTemporarySFP(sfp) {
    return sfp.temporary || false;
  };

  $scope.setTemporarySFP = function setTemporarySFP(sfp) {
    sfp.temporary = true;
  };

  $scope.unsetTemporarySFP = function unsetTemporarySFP(sfp) {
    delete sfp.temporary;
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  ServicePathSvc.getArray(function (data) {

    //temporary SFPs are kept in local array, persisted SFPs should be removed from it
    _.each($scope.sfps, function (sfp, index) {
      if ($scope.isTemporarySFP(sfp)) {
        $scope.sfps.splice(index, 1);
      }
    });

    //concat temporary with loaded data
    if (data !== undefined) {
      $scope.sfps = $scope.sfps.concat(data);
    }
  });

  $scope.sortableOptions = {
    connectWith: ".connected-apps-container",
    cursor: 'move',
    placeholder: 'connected grid place',
    tolerance: 'pointer',
    start: function (e, ui) {
      $(e.target).data("ui-sortable").floating = true;
    },
    update: function (e, ui) {
      //sfc[0]: name, sfc[1]: index in sfcs
      var sfp = $(ui.item).closest('tr').attr('id').split("~!~");
      $scope.setTemporarySFP($scope.sfps[sfp[1]]);
    },
    receive: function (e, ui) {
      //sfc[0]: name, sfc[1]: index in sfcs
      var sfp = $(e.target).closest('tr').attr('id').split("~!~");
      $scope.setTemporarySFP($scope.sfps[sfp[1]]);
    }
  };

  $scope.onSFPdrop = function ($event, $sf, sfp) {
    if (sfp['sfp-service-function'] === undefined) {
      sfp['sfp-service-function'] = [];
    }
    sfp['sfp-service-function'].push({name: $sf});

    $scope.setTemporarySFP(sfp);
  };

  $scope.deleteSFP = function deleteSFP(sfpName, index){
    ModalDeleteSvc.open(sfpName, function(result) {
      if (result == 'delete') {
        //delete the row
        ServicePathSvc.deleteItem({"name": sfpName}, function () {
          $scope.sfps.splice(index, 1);
        });
      }
    });
  };

  $scope.removeSFfromSFP = function removeSFfromSFP(sfp) {
    sfp['sfp-service-function'].splice(this.$index, 1);
    $scope.setTemporarySFP(sfp);
  };

  $scope.persistSFP = function persistSFP(sfp) {
    $scope.unsetTemporarySFP(sfp);
    ServicePathSvc.putItem(sfp, function () {
    });
  };

  $scope.getSFindexInSFS = function getSFindexInSFS(sfName) {
    var sfObject = _.findWhere($scope.sfs, {name: sfName});
    return _.indexOf($scope.sfs, sfObject);
  };

})

.config(function ($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('sfc', {
    url: '/sfc',
    abstract: true,
    templateUrl: 'sfc/root.tpl.html',
    controller: function ($scope) {

      $scope.sfcs = [];

      $scope.sfps = [];

      $scope.servicefunction =
      {
        type: ["napt44", "dpi", "firewall"]
      };

      $scope.dataplane_locator =
      {
        type: ["ip:port"]
      };

    }
  });

  $stateProvider.state('sfc.servicenode', {
    url: '/servicenode',
    access: access.public,
    views: {
      '': {
        templateUrl: 'sfc/servicenode.tpl.html',
        controller: 'serviceNodeCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicenode.create', {
    url: '/create',
    access: access.public,
    views: {
      '@sfc': {
        templateUrl: 'sfc/servicenode.create.tpl.html',
        controller: 'serviceNodeCreateCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicenode.edit', {
    url: '/edit:snName',
    access: access.public,
    views: {
      '@sfc': {
        templateUrl: 'sfc/servicenode.edit.tpl.html',
        controller: 'serviceNodeEditCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicefunction', {
    url: '/servicefunction',
    access: access.public,
    views: {
      '': {
        templateUrl: 'sfc/servicefunction.tpl.html',
        controller: 'serviceFunctionCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicefunction.create', {
    url: '/create',
    access: access.public,
    views: {
      '@sfc': {
        templateUrl: 'sfc/servicefunction.create.tpl.html',
        controller: 'serviceFunctionCreateCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicechain', {
    url: '/servicechain',
    access: access.public,
    views: {
      '': {
        templateUrl: 'sfc/servicechain.tpl.html',
        controller: 'serviceChainCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicechain.create', {
    url: '/create',
    access: access.public,
    views: {
      '@sfc': {
        templateUrl: 'sfc/servicechain.create.tpl.html',
        controller: 'serviceChainCreateCtrl'
      }
    }
  });

  $stateProvider.state('sfc.servicepath', {
    url: '/servicepath',
    access: access.public,
    views: {
      '': {
        templateUrl: 'sfc/servicepath.tpl.html',
        controller: 'servicePathCtrl'
      }
    }
  });
});

consoleSfcPartConfig(angular.module('console.sfc'));  // add to this module