define(['app/sfc/sfc.module'], function (sfc) {

  sfc.controller('serviceNodeCtrl', function ($scope, $state, ServiceFunctionSvc, ServiceNodeSvc, ServiceNodeCtrlFunc, ModalDeleteSvc) {
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
      $state.transitionTo('main.sfc.servicenode-edit', {snName: snName}, { location: true, inherit: true, relative: $state.$current, notify: true });
    };

    $scope.getSnsGraphClass = function getSnsGraphClass(snList) {
      //determine the maximum number of SFs attached to SN
      var maxSf = 0;
      _.each(snList, function (sn) {
        if (angular.isDefined(sn['service-function']) && maxSf < sn['service-function'].length) {
          maxSf = sn['service-function'].length;
        }
      });
      //if it is lq than 10 allow 3 SNs to be placed side by side, else only 2 SNs
      return maxSf <= 10 ? "col-xs-12 col-md-6 col-lg-4" : "col-xs-12 col-md-12 col-lg-6";
    };

    ServiceFunctionSvc.getArray(function (data) {
      $scope.sfs = data;

      ServiceNodeSvc.getArray(function (data) {
        $scope.sns = data;
        $scope.snsGraph = ServiceNodeCtrlFunc.createGraphData($scope.sns, $scope.sfs);
      });
    });
  });

  sfc.controller('serviceNodeEditCtrl', function ($scope, $state, $stateParams, ServiceFunctionSvc, ServiceNodeSvc) {
    $scope.data = {};

    ServiceFunctionSvc.getArray(function (data) {
      $scope.sfs = data;

      ServiceNodeSvc.getItem($stateParams.snName, function (item) {
        $scope.data = item;
      });
    });

    $scope.submit = function () {
      ServiceNodeSvc.putItem($scope.data, function () {
        $state.transitionTo('main.sfc.servicenode', null, { location: true, inherit: true, relative: $state.$current, notify: true });
      });
    };
  });

  sfc.controller('serviceNodeCreateCtrl', function ($scope, $state, ServiceFunctionSvc, ServiceNodeSvc) {
    $scope.data = {};

    ServiceFunctionSvc.getArray(function (data) {
      $scope.sfs = data;
    });

    $scope.submit = function () {
      ServiceNodeSvc.putItem($scope.data, function () {
        $state.transitionTo('main.sfc.servicenode', null, { location: true, inherit: true, relative: $state.$current, notify: true });
      });
    };
  });

});
