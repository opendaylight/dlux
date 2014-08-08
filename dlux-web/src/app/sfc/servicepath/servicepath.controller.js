define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.controller('servicePathCtrl', function ($scope, $rootScope, ServiceFunctionSvc, ServicePathSvc, ModalDeleteSvc) {

    $scope.getSFPstate = function getSFPstate(sfp) {
      return sfp.state || $rootScope.sfpState.PERSISTED;
    };

    $scope.setSFPstate = function setSFPstate(sfp, newState) {
      if (angular.isDefined(sfp.state) && sfp.state === $rootScope.sfpState.NEW) {
        sfp.state = $rootScope.sfpState.NEW;
      }
      else {
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
        _.each(data, function (sfp) {
          //if it is not in tempSfps add it
          if (angular.isUndefined(_.findWhere(tempSfps, {name: sfp.name}))) {
            $scope.setSFPstate(sfp, $rootScope.sfpState.PERSISTED);
            tempSfps.push(sfp);
          }
        });
      }

      $rootScope.sfps = tempSfps;
    });

    $scope.undoSFPchanges = function undoSFPchanges(sfp, index) {
      ServicePathSvc.getItem(sfp.name, function (oldSfp) {
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
  });

});