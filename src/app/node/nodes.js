angular.module('dlux.node', [])

.controller('nodeCtrl', function($scope, SwitchSvc) {
  $scope.ncpData = {};

  // Fetch the node then fetch more info about each node
  SwitchSvc.nodeUrl().getList().then(function(npData) {
    $scope.npData = npData.nodeProperties;
  });
})

.config(function ($stateProvider) {
  $stateProvider.state('node', {
    url: '/node',
    abstract: true,
    template: '<div ui-view></div>'
  });

  $stateProvider.state('node.list', {
    url: '/list',
    views: {
      '': {
        templateUrl: 'node/index.tpl.html',
        controller: function ($scope, SwitchSvc) {
          $scope.gridOptions = {
            data: 'data["nodeProperties"]',
            selectedItems: [],
            enableRowSelection: true,
            showSelectionCheckbox: true,
            selectWithCheckboxOnly: true,
            columnDefs: [
              {
                field: 'properties.description.value', displayName: 'Node Name'
              },
              {
                field: 'node.id', displayName: 'Node ID'
              },
              {
                field: 'properties.macAddress.value', displayName: 'MAC Address'
              }
            ]
          };

          $scope.$watch(
            function () {
              return SwitchSvc.data;
            },
            function (data) {
              console.log(data);
              $scope.data = data;
          });
        }
      }
    }
  });

  $stateProvider.state('node.detail', {
    url: '/{nodeType}/{nodeId}/detail',
    views: {
      '': {
        templateUrl: 'node/detail.tpl.html',
        controller: function ($scope, $stateParams, SwitchSvc) {
          SwitchSvc.nodeUrl(null, $stateParams.nodeType, $stateParams.nodeId).get().then(
            function (data) {
              $scope.data = data;
            });

          // Filter function to remove ports with id 0
          $scope.portNotNull = function (property) {
            return property.nodeconnector.id !== "0";
          };
        }
      }
    }
  });
});
