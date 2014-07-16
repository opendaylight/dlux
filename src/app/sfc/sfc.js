angular.module('console.sfc', ['sfc.config.svchost'])

  .controller('rootCtrl', function ($scope, $rootScope) {
    $rootScope.sfcs = [];

    $rootScope.sfcState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};
    if (angular.isDefined(Object.freeze)){
      Object.freeze($rootScope.sfcState);
    }

    $rootScope.sfpState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};
    if (angular.isDefined(Object.freeze)){
      Object.freeze($rootScope.sfpState);
    }

    $rootScope.sfps = [];

    $rootScope.sfpEffectMe = {};

    $scope.servicefunction =
    {
      type: ["napt44", "dpi", "firewall"]
    };

    $scope.dataplane_locator =
    {
      type: ["ip:port"]
    };
  })

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

    $scope.deleteSF = function deleteSF(sfName, index) {
      ModalDeleteSvc.open(sfName, function (result) {
        if (result == 'delete') {
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

  .controller('serviceChainCtrl', function ($scope, $rootScope, ServiceFunctionSvc, ServiceChainSvc, ModalDeleteSvc, ModalSfNameSvc, ModalInfoSvc, ModalErrorSvc, SfcRpcError, sfcFormatMessage) {

    $scope.sfcEffectMe = {};

    $scope.getSFCstate = function getSFCstate(sfc) {
      return sfc.state || $rootScope.sfcState.PERSISTED;
    };

    $scope.setSFCstate = function setSFCstate(sfc, newState) {
      if (angular.isDefined(sfc.state) && sfc.state === $rootScope.sfcState.NEW)
      {
        sfc.state = $rootScope.sfcState.NEW;
      }
      else
      {
        sfc.state = newState;
      }
    };

    $scope.unsetSFCstate = function unsetSFCstate(sfc) {
      delete sfc.state;
    };

    $scope.isSFCstate = function isSFCstate(sfc, state) {
      return $scope.getSFCstate(sfc) === state ? true : false;
    };

    ServiceFunctionSvc.getArray(function (data) {
      $scope.sfs = data;
    });

    ServiceChainSvc.getArray(function (data) {
      //temporary SFCs are kept in rootScope, persisted SFCs should be removed from it
      var tempSfcs = [];
      _.each($rootScope.sfcs, function (sfc) {
        if ($scope.getSFCstate(sfc) !== $rootScope.sfcState.PERSISTED) {
          tempSfcs.push(sfc);
        }
      });

      //concat temporary with loaded data (dont add edited sfcs which are already in tempSfcs)
      if (angular.isDefined(data)) {
        _.each(data, function(sfc){
          //if it is not in tempSfcs add it
          if(angular.isUndefined(_.findWhere(tempSfcs, {name: sfc.name}))){
            $scope.setSFCstate(sfc, $rootScope.sfcState.PERSISTED);
            tempSfcs.push(sfc);
          }
        });
      }
      $rootScope.sfcs = tempSfcs;
    });

    $scope.undoSFCnew = function undoSFCnew(sfc, index) {
      $rootScope.sfcs.splice(index, 1);
    };

    $scope.undoSFCchanges = function undoSFCchanges(sfc, index) {
      ServiceChainSvc.getItem(sfc.name, function(oldSfc) {
        $rootScope.sfcs.splice(index, 1);
        $rootScope.sfcs.splice(index, 0, oldSfc);
      });
    };

    $scope.sortableOptions = {
      connectWith: ".connected-apps-container",
      cursor: 'move',
      placeholder: 'place',
      tolerance: 'pointer',
      start: function (e, ui) {
        $(e.target).data("ui-sortable").floating = true;
      },
      helper: function (e, ui) {
        var elms = ui.clone();
        elms.find(".arrow-right-part").addClass("arrow-empty");
        elms.find(".arrow-left-part").addClass("arrow-empty");
        return elms;
      },
      update: function (e, ui) {
        //sfc[0]: name, sfc[1]: index in sfcs
        try {
          var sfc = $(e.target).closest('tr').attr('id').split("~!~");
          $scope.setSFCstate($rootScope.sfcs[sfc[1]], $rootScope.sfcState.EDITED);
        } catch (err) {
          ModalErrorSvc.open({"head": "Unknown", "body":err.message});
          //alert(err.message);
        }
      }
    };

    $scope.onSFCdrop = function onSFCdrop($sf, sfc) {
      if (sfc['sfc-service-function'] === undefined) {
        sfc['sfc-service-function'] = [];
      }

      //check if SF with SF.type already exists in chain
      var sfNameExists = _.findWhere(sfc['sfc-service-function'], {name: $sf.type});

      //if SF with this name already exists in SFC, we need to use another name
      if (angular.isDefined(sfNameExists)) {

        ModalSfNameSvc.open(sfc, $sf, function (newSf) {
          if (angular.isDefined(newSf.name)) {
            sfc['sfc-service-function'].push({name: newSf.name, type: newSf.type});
            $scope.setSFCstate(sfc, $rootScope.sfcState.EDITED);
          }
        });
      }
      else {
        sfc['sfc-service-function'].push({name: $sf.type, type: $sf.type});
        $scope.setSFCstate(sfc, $rootScope.sfcState.EDITED);
      }
    };

    $scope.deleteSFC = function deleteSFC(sfcName, index) {
      ModalDeleteSvc.open(sfcName, function (result) {
        if (result == 'delete') {
          //delete the row
          ServiceChainSvc.deleteItem({"name": sfcName}, function () {
            $rootScope.sfcs.splice(index, 1);
          });
        }
      });
    };

    $scope.removeSFfromSFC = function removeSFfromSFC(sfc, index) {
      sfc['sfc-service-function'].splice(index, 1);
      $scope.setSFCstate(sfc, $rootScope.sfcState.EDITED);
    };

    $scope.persistSFC = function persistSFC(sfc) {
      $scope.unsetSFCstate(sfc);

      ServiceChainSvc.putItem(sfc, function () {
        $scope.sfcEffectMe[sfc.name] = 1;
      });
    };

    $scope.deploySFC = function deploySFC(sfc) {
      ServiceChainSvc.deployChain(sfc.name, function (result) {

        if (result instanceof SfcRpcError) {
          // error
          var response = result.response;
          console.log(response);
          ModalErrorSvc.open({
            head: "Cannot instantiate path!",
            rpcError: response});
        } else {
          // ok
          $rootScope.sfpEffectMe[result.name] = 1; // schedule for effect of recently deployed
          ModalInfoSvc.open({"head": "Success!", "body": "Path instantiated with name: " + result.name});
        }
      });
    };
  })

  .controller('serviceChainCreateCtrl', function ($scope, $rootScope, $state) {
    $scope.data = {};

    $scope.submit = function () {
      $scope.data['sfc-service-function'] = [];
      $scope.data['state'] = $rootScope.sfcState.NEW;
      $rootScope.sfcs.push($scope.data);

      $state.transitionTo('sfc.servicechain', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    };
  })

  .controller('servicePathCtrl', function ($scope, $rootScope, ServiceFunctionSvc, ServicePathSvc, ModalDeleteSvc) {

    $scope.getSFPstate = function getSFPstate(sfp) {
      return sfp.state || $rootScope.sfpState.PERSISTED;
    };

    $scope.setSFPstate = function setSFPstate(sfp, newState) {
      if (angular.isDefined(sfp.state) && sfp.state === $rootScope.sfpState.NEW)
      {
        sfp.state = $rootScope.sfpState.NEW;
      }
      else
      {
        sfp.state = newState;
      }
    };

    $scope.unsetSFPstate = function unsetSFPstate(sfp) {
      delete sfp.state;
    };

    $scope.isSFPstate = function isSFPstate(sfp, state) {
      return $scope.getSFPstate(sfp) === state ? true : false;
    };

    ServiceFunctionSvc.getArray(function (data) {
      $scope.sfs = data;
    });

    ServicePathSvc.getArray(function (data) {

      //temporary SFPs are kept in rootScope, persisted SFPs should be removed from it
      var tempSfps = [];
      _.each($rootScope.sfps, function (sfp) {
        if ($scope.getSFPstate(sfp) !== $rootScope.sfpState.PERSISTED) {
          tempSfps.push(sfp);
        }
      });

      //concat temporary with loaded data (dont add edited sfcs which are already in tempSfps)
      if (angular.isDefined(data)) {
        _.each(data, function(sfp){
          //if it is not in tempSfps add it
          if(angular.isUndefined(_.findWhere(tempSfps, {name: sfp.name}))){
            $scope.setSFPstate(sfp, $rootScope.sfpState.PERSISTED);
            tempSfps.push(sfp);
          }
        });
      }

      $rootScope.sfps = tempSfps;
    });

    $scope.undoSFPchanges = function undoSFPchanges(sfp, index) {
      ServicePathSvc.getItem(sfp.name, function(oldSfp) {
        $rootScope.sfps.splice(index, 1);
        $rootScope.sfps.splice(index, 0, oldSfp);
      });
    };

    $scope.sortableOptions = {
      connectWith: ".connected-apps-container",
      cursor: 'move',
      placeholder: 'place',
      tolerance: 'pointer',
      start: function (e, ui) {
        $(e.target).data("ui-sortable").floating = true;
      },
      update: function (e, ui) {
        //sfc[0]: name, sfc[1]: index in sfcs
        var sfp = $(e.target).closest('tr').attr('id').split("~!~");
        $scope.setSFPstate($rootScope.sfps[sfp[1]], $rootScope.sfpState.EDITED);
      },
//      receive: function (e, ui) {
//        //sfc[0]: name, sfc[1]: index in sfcs
//        var sfp = $(e.target).closest('tr').attr('id').split("~!~");
//        $scope.setTemporarySFP($rootScope.sfps[sfp[1]]);
//      },
      helper: function (e, ui) {
        var elms = ui.clone();
        elms.find(".arrow-right-part").addClass("arrow-empty");
        elms.find(".arrow-left-part").addClass("arrow-empty");
        return elms;
      }
    };

    $scope.onSFPdrop = function ($sf, sfp) {
      if (sfp['sfp-service-function'] === undefined) {
        sfp['sfp-service-function'] = [];
      }
      sfp['sfp-service-function'].push({name: $sf});

      $scope.setSFPstate(sfp, $rootScope.sfpState.EDITED);
    };

    $scope.deleteSFP = function deleteSFP(sfpName, index) {
      ModalDeleteSvc.open(sfpName, function (result) {
        if (result == 'delete') {
          //delete the row
          ServicePathSvc.deleteItem({"name": sfpName}, function () {
            $rootScope.sfps.splice(index, 1);
          });
        }
      });
    };

    $scope.removeSFfromSFP = function removeSFfromSFP(sfp, index) {
      sfp['sfp-service-function'].splice(index, 1);
      $scope.setSFPstate(sfp, $rootScope.sfpState.EDITED);
    };

    $scope.persistSFP = function persistSFP(sfp) {
      $scope.unsetSFPstate(sfp);
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
      controller: 'rootCtrl'
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