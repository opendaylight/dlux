angular.module('console.sfc', ['sfc.config.svchost'])

.controller('serviceNodeCtrl', function ($scope, ServiceFunctionSvc, ServiceNodeSvc) {
  var createGraphData = function createGraphData (nodeArray) {
    var graphData = [];
    _.each(nodeArray, function (element) {

      var nodeSfs = [];
      _.each(element['service-function'], function (sfName) {
        var sf = _.findWhere($scope.sfs, {name: sfName});
        nodeSfs.push(sf);
      });

      var innerData = {
        "name": element['name'],
        "ip-mgmt-address": element['ip-mgmt-address'],
        "children": nodeSfs
      };

      graphData.push(innerData);
    });
    return graphData;
  };

  $scope.deleteServiceNode = function deleteServiceNode(snName){
    ServiceNodeSvc.deleteItem(snName, function(){
      //after delete refresh local service node array
      ServiceNodeSvc.getArray(function (data) {
        $scope.sns = data;
        $scope.snsGraph = createGraphData($scope.sns);
      });
    });
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  ServiceNodeSvc.getArray(function (data) {
    $scope.sns = data;
    $scope.snsGraph = createGraphData($scope.sns);
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

.controller('serviceFunctionCtrl', function ($scope, ServiceFunctionSvc) {

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

    //delete the row
    ServiceFunctionSvc.deleteItem({"name": sfName}, function () {
      footable.removeRow(row);
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

.controller('serviceChainCtrl', function ($scope, ServiceFunctionSvc, ServiceChainSvc, $modal) {

  $scope.isTemporarySFC = function isTemporarySFC(sfc) {
    return sfc.temporary || false;
  };

  var setTemporarySFC = function setTemporarySFC(sfc) {
    sfc.temporary = true;
  };

  var unsetTemporarySFC = function unsetTemporarySFC(sfc) {
    delete sfc.temporary;
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  ServiceChainSvc.getArray(function (data) {

    //temporary SFCs are kept in local array, persisted SFCs should be removed from it
    _.each($scope.sfcs, function (sfc, index) {
      if (isTemporarySFC(sfc)) {
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
      setTemporarySFC($scope.sfcs[sfc[1]]);
    },
    receive: function (e, ui) {
      //sfc[0]: name, sfc[1]: index in sfcs
      var sfc = $(e.target).closest('tr').attr('id').split("~!~");
      setTemporarySFC($scope.sfcs[sfc[1]]);
    }
  };

  $scope.onSFCdrop = function ($event, $sf, sfc) {
    if (sfc['service-function-type'] === undefined) {
      sfc['service-function-type'] = [];
    }

    var sfNameExists = _.findWhere(sfc['service-function-type'], {name: $sf.type});

    if (sfNameExists !== undefined) {
      $scope.sfc = sfc;
      $scope.sf = $sf;
      $scope.open();
    }
    else {
      sfc['service-function-type'].push({name: $sf.type, type: $sf.type});
      setTemporarySFC(sfc);
    }
  };

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'sfc/servicechain.addsf.tpl.html',
      controller: ModalInstanceCtrl,
      resolve: {
        sfc: function () {
          return $scope.sfc;
        },
        sf: function () {
          return $scope.sf;
        }
      }
    });

    modalInstance.result.then(function (sf) {
      $scope.sfc['service-function-type'].push({name: sf.name, type: sf.type});
      setTemporarySFC($scope.sfc);
    });
  };

  var ModalInstanceCtrl = function ($scope, $modalInstance, sfc, sf) {

    $scope.sfc = sfc;
    $scope.sf = sf;

    $scope.save = function () {
      var newSfName;
      if (this.data.prefix) {
        newSfName = (this.data.prefix + "-");
      }
      newSfName = newSfName.concat($scope.sf.type);
      if (this.data.sufix) {
        newSfName = newSfName.concat("-" + this.data.sufix);
      }

      $scope.sf.name = newSfName;
      $modalInstance.close(sf);
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss('cancel');
    };
  };


  $('table').footable().on('click', '.row-delete-sfc', function (e) {
    e.preventDefault();
    //get the footable object
    var footable = $('table').data('footable');
    //get the row we are wanting to delete
    var row = $(this).parents('tr:first');

    //sfc[0]: name, sfc[1]: index in sfcs
    var sfc = row[0].id.split("~!~");

    //delete the row
    ServiceChainSvc.deleteItem({"name": sfc[0]}, function () {
      $scope.sfcs.splice(sfc[1], 1);
      footable.removeRow(row);
    });
  });

  $scope.removeSFfromSFC = function (sfc) {
    sfc['service-function-type'].splice(this.$index, 1);
    setTemporarySFC(sfc);
  };

  $scope.persistSFC = function (sfc) {
    unsetTemporarySFC(sfc);
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

  var setTemporarySFP = function setTemporarySFP(sfp) {
    sfp.temporary = true;
  };

  var unsetTemporarySFP = function unsetTemporarySFP(sfp) {
    delete sfp.temporary;
  };

  ServiceFunctionSvc.getArray(function (data) {
    $scope.sfs = data;
  });

  ServicePathSvc.getArray(function (data) {

    //temporary SFPs are kept in local array, persisted SFPs should be removed from it
    _.each($scope.sfps, function (sfp, index) {
      if (isTemporarySFP(sfp)) {
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
      setTemporarySFP($scope.sfps[sfp[1]]);
    },
    receive: function (e, ui) {
      //sfc[0]: name, sfc[1]: index in sfcs
      var sfp = $(e.target).closest('tr').attr('id').split("~!~");
      setTemporarySFP($scope.sfps[sfp[1]]);
    }
  };

  $scope.onSFPdrop = function ($event, $sf, sfp) {
    if (sfp['service-function'] === undefined) {
      sfp['service-function'] = [];
    }
    sfp['service-function'].push({name: $sf});

    setTemporarySFP(sfp);
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
    setTemporarySFP(sfp);
  };

  $scope.persistSFP = function (sfp) {
    unsetTemporarySFP(sfp);
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