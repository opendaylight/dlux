define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.controller('serviceChainCtrl', function ($scope, $rootScope, ServiceFunctionSvc, ServiceChainSvc, ServicePathSvc, ModalDeleteSvc, ModalSfNameSvc, ModalSfpInstantiateSvc, ModalInfoSvc, ModalErrorSvc) {

    $scope.sfcEffectMe = {};

    $scope.getSFCstate = function getSFCstate(sfc) {
      return sfc.state || $rootScope.sfcState.PERSISTED;
    };

    $scope.setSFCstate = function setSFCstate(sfc, newState) {
      if (angular.isDefined(sfc.state) && sfc.state === $rootScope.sfcState.NEW) {
        sfc.state = $rootScope.sfcState.NEW;
      }
      else {
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
        _.each(data, function (sfc) {
          //if it is not in tempSfcs add it
          if (angular.isUndefined(_.findWhere(tempSfcs, {name: sfc.name}))) {
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
      ServiceChainSvc.getItem(sfc.name, function (oldSfc) {
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
          ModalErrorSvc.open({"head": "Unknown", "body": err.message});
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

      ModalSfpInstantiateSvc.open(sfc, function (sfp) {
        //if user entered name in modal dialog (and it's unique name)
        if (angular.isDefined(sfp.name)) {
          ServicePathSvc.putItem(sfp, function (result) {
            if (angular.isDefined(result)) {
              // error
              var response = result.response;
              console.log(response);
              ModalErrorSvc.open({
                head: $scope.$eval('"SFC_CHAIN_MODAL_PATH_FAIL_HEAD" | translate'),
                rpcError: response});
            } else {
              // ok
              $rootScope.sfpEffectMe[sfp.name] = 1; // schedule for effect of recently deployed
              ModalInfoSvc.open({
                "head": $scope.$eval('"SFC_CHAIN_MODAL_PATH_SUCCESS_HEAD" | translate'),
                "body": $scope.$eval('"SFC_CHAIN_MODAL_PATH_SUCCESS_BODY" | translate') + ": <b>'" + sfp.name + "'</b>."});
            }
          });
        }
      });
    };
  });

  sfc.register.controller('serviceChainCreateCtrl', function ($scope, $rootScope, $state) {
    $scope.data = {};

    $scope.submit = function () {
      $scope.data['sfc-service-function'] = [];
      $scope.data['state'] = $rootScope.sfcState.NEW;
      $rootScope.sfcs.push($scope.data);

      $state.transitionTo('main.sfc.servicechain', null, { location: true, inherit: true, relative: $state.$current, notify: true });
    };
  });

});