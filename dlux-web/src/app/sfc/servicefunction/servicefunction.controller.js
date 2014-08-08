define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.controller('serviceFunctionCtrl', function ($scope, $state, ServiceFunctionSvc, ModalDeleteSvc) {

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

    $scope.editSF = function editSF(sfName) {
      $state.transitionTo('main.sfc.servicefunction-edit', {sfName: sfName}, { location: true, inherit: true, relative: $state.$current, notify: true });
    };
  });

  sfc.register.controller('serviceFunctionCreateCtrl', function ($scope, $state, ServiceFunctionSvc, ServiceForwarderSvc) {
    $scope.data = {"sf-data-plane-locator": {}};

    ServiceForwarderSvc.getArray(function (data) {
      $scope.sffs = data;
    });

//    $scope.select2ModelSff = $scope.data["service-function-forwarder"];  // initial copy to select2 view model (for optional future 'edit sf' feature)
//
//    $scope.$watch(
//      function () {
//        if ($scope.select2ModelSff) {
//          return $scope.select2ModelSff.id; // watch id in select2 view model
//        } else {
//          return undefined;
//        }
//      },
//      function (newVal) {
//        $scope.data["service-function-forwarder"] = newVal; // copy id to our model
//      }
//    );
//
//    $scope.select2Options = {
//      query: function (query) {
//        var data = {results: []};
//        var exact = false;
//        var blank = _.str.isBlank(query.term);
//
//        _.each($scope.sffs, function (sff) {
//          var name = sff.name;
//          var addThis = false;
//
//          if (!blank) {
//            if (query.term == name) {
//              exact = true;
//              addThis = true;
//            } else if (name.toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
//              addThis = true;
//            }
//          } else {
//            addThis = true;
//          }
//
//          if (addThis === true) {
//            data.results.push({id: name, text: name});
//          }
//        });
//
//        if (!exact && !blank) {
//          data.results.unshift({id: query.term, text: query.term, ne: true});
//        }
//
//        query.callback(data);
//      },
//      formatSelection: function (object, container) {
//        if (object.ne) {
//          return object.text + " <span><i style=\"color: greenyellow;\">(to be created)</i></span>";
//        } else {
//          return object.text;
//        }
//      }
//    };

    $scope.submit = function () {
      ServiceFunctionSvc.putItem($scope.data, function () {
        $state.transitionTo('main.sfc.servicefunction', null, { location: true, inherit: true, relative: $state.$current, notify: true });
      });
    };
  });

  sfc.register.controller('serviceFunctionEditCtrl', function ($scope, $state, $stateParams, ServiceFunctionSvc, ServiceForwarderSvc) {
    $scope.data = {"sf-data-plane-locator": {}};

    ServiceForwarderSvc.getArray(function (data) {
      $scope.sffs = data;

      ServiceFunctionSvc.getItem($stateParams.sfName, function (item) {
        $scope.data = item;
        removeNonExistentSff($scope.data['sf-data-plane-locator'], $scope.sffs);
      });
    });

    $scope.submit = function () {
      ServiceFunctionSvc.putItem($scope.data, function () {
        $state.transitionTo('main.sfc.servicefunction', null, { location: true, inherit: true, relative: $state.$current, notify: true });
      });
    };
  });

  function removeNonExistentSff(sfDPlocator, sffs) {
    if (angular.isDefined(sfDPlocator)) {

      var sffExist = _.findWhere(sffs, {name: sfDPlocator['service-function-forwarder']});
      if (angular.isUndefined(sffExist)) {
        delete sfDPlocator['service-function-forwarder'];
      }
    }
  }
});