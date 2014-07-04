angular.module('console.sfc', ['sfc.config.svchost'])

.controller('serviceNodeCtrl', function ($scope, ServiceFunctionSvc, ServiceNodeSvc, ServiceNodeCtrlFunc, ModalDeleteSvc) {

  $scope.deleteServiceNode = function deleteServiceNode(snName) {
    ModalDeleteSvc.open(snName.name, function (result) {
      if (result == 'delete') {
        ServiceNodeSvc.deleteItem(snName, function () {
          //after delete refresh local service node array
          ServiceNodeSvc.getArray(function (data) {
            $scope.sns = data;
            $scope.snsGraph = ServiceNodeCtrlFunc.createGraphData($scope.sns, $scope.sfs);
          });
        });
      }
    });
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;

    ServiceNodeSvc.getArray(function (data) {
      $scope.sns = data;
      $scope.snsGraph = ServiceNodeCtrlFunc.createGraphData($scope.sns, $scope.sfs);
    });
  });
})

.controller('serviceNodeCreateCtrl', function ($scope, $state, ServiceFunctionSvc, ServiceNodeSvc) {
  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  $scope.submit = function () {
    $scope.data['service-function'] = $scope.data['servicefunction'];
    delete $scope.data['servicefunction'];

    ServiceNodeSvc.putItem($scope.data, function () {
      $state.transitionTo('sfc.servicenode', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    });
  };
})

.controller('serviceFunctionCtrl', function ($scope, ServiceFunctionSvc, ModalDeleteSvc) {

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  $('table').footable().on('click', '.row-delete-sf', function (e) {
    e.preventDefault();
    //get the footable object
    var footable = $('table').data('footable');
    //get the row we are wanting to delete
    var row = $(this).parents('tr:first');
    //get the SF name
    var sfName = ($scope.getText(row[0].cells[0]));

    ModalDeleteSvc.open(sfName, function(result) {
      if(result == 'delete'){
        //delete the row
        ServiceFunctionSvc.deleteItem({"name": sfName}, function () {
          footable.removeRow(row);
        });
      }
    });
  });
})

.controller('serviceFunctionCreateCtrl', function ($scope, $state, ServiceFunctionSvc) {
  $scope.submit = function () {
    ServiceFunctionSvc.putItem($scope.data, function () {
      $state.transitionTo('sfc.servicefunction', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    });
  };
})

.controller('serviceChainCtrl', function ($scope, ServiceFunctionSvc, ServiceChainSvc, $modal, ModalDeleteSvc, ModalSfnameSvc) {

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
    if (sfc['service-function-type'] === undefined) {
      sfc['service-function-type'] = [];
    }

    var sfNameExists = _.findWhere(sfc['service-function-type'], {name: $sf.type});

    if (sfNameExists !== undefined) {
      ModalSfnameSvc.open(sfc, $sf, function(newSf){
        sfc['service-function-type'].push({name: newSf.name, type: newSf.type});
        $scope.setTemporarySFC(sfc);
      });
    }
    else {
      sfc['service-function-type'].push({name: $sf.type, type: $sf.type});
      $scope.setTemporarySFC(sfc);
    }
  };

  $('table').footable().on('click', '.row-delete-sfc', function (e) {
    e.preventDefault();
    //get the footable object
    var footable = $('table').data('footable');
    //get the row we are wanting to delete
    var row = $(this).parents('tr:first');

    //sfc[0]: name, sfc[1]: index in sfcs
    var sfc = row[0].id.split("~!~");

    ModalDeleteSvc.open(sfc[0], function(result){
      if(result == 'delete'){
        //delete the row
        ServiceChainSvc.deleteItem({"name": sfc[0]}, function () {
          $scope.sfcs.splice(sfc[1], 1);
          footable.removeRow(row);
        });
      }
    });
  });

  $scope.removeSFfromSFC = function (sfc) {
    sfc['service-function-type'].splice(this.$index, 1);
    $scope.setTemporarySFC(sfc);
  };

  $scope.persistSFC = function (sfc) {
    $scope.unsetTemporarySFC(sfc);
    ServiceChainSvc.putItem(sfc, function () {
    });
  };

  $scope.deploySFC = function (sfc) {
  //TODO: waiting for SFC Provider to be implemented
  };
})

.controller('serviceChainCreateCtrl', function ($scope, $state) {
  $scope.submit = function () {
    $scope.data['service-function-type'] = [];
    $scope.data['temporary'] = true;
    $scope.sfcs.push($scope.data);

    $state.transitionTo('sfc.servicechain', null, { location: true, inherit: true, relative: $state.$current, notify: true });
  };
})

.controller('servicePathCtrl', function ($scope, ServiceFunctionSvc, ServicePathSvc) {

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
    if (sfp['service-function'] === undefined) {
      sfp['service-function'] = [];
    }
    sfp['service-function'].push({name: $sf});

    $scope.setTemporarySFP(sfp);
  };


  $('table').footable().on('click', '.row-delete-sfp', function (e) {
    e.preventDefault();
    //get the footable object
    var footable = $('table').data('footable');
    //get the row we are wanting to delete
    var row = $(this).parents('tr:first');

    //sfp[0]: name, sfp[1]: index in sfcs
    var sfp = row[0].id.split("~!~");

    //delete the row
    ServicePathSvc.deleteItem({"name": sfp[0]}, function () {
      $scope.sfps.splice(sfp[1], 1);
      footable.removeRow(row);
    });
  });

  $scope.removeSFfromSFP = function (sfp) {
    sfp['service-function'].splice(this.$index, 1);
    $scope.setTemporarySFP(sfp);
  };

  $scope.persistSFP = function (sfp) {
    $scope.unsetTemporarySFP(sfp);
    ServicePathSvc.putItem(sfp, function () {
    });
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