angular.module('dlux.connection_manager', [])

.config(function ($stateProvider) {
  $stateProvider.state('connection_manager', {
    abstract: true,
    url: '/connection_manager',
    templateUrl: 'connection_manager/root.tpl.html'
  });

  $stateProvider.state('connection_manager.index', {
    url: '/index',
    templateUrl: 'connection_manager/index.tpl.html',
    views: {
      '': {
        templateUrl: 'connection_manager/index.tpl.html',
        controller: function ($scope, ConnectionManagerSvc) {
          $scope.svc = ConnectionManagerSvc;

          $scope.gridOptions = {
            data: 'data["container-config"]',
            selectedItems: [],
            enableRowSelection: true,
            showSelectionCheckbox: true,
            selectWithCheckboxOnly: true,
            columnDefs: [
              {
                field: 'container', displayName: 'Name',
              },
              {
                field: 'nodeConnectors.length', displayName: 'Connector Count',
              },
              {
                displayName: 'Options', cellTemplate: '<div><a ng-click="console.log(row)"><span class="glyphicon glyphicon-remove"></span> Delete</a></div>'
              }
            ]
          };

          $scope.$watch(
            function () {
              return ConnectionManagerSvc.data;
            },
            function (data) {
              $scope.data = data;
            }
          );
        }
      }
    }
  });

  $stateProvider.state('connection_manager.discover', {
    url: '/discover',
    views: {
      '': {
        templateUrl: 'connection_manager/discover.tpl.html',
        controller: function ($scope, SwitchSvc, ConnectionManagerSvc) {
          $scope.nodePort = 6633;

          $scope.doDiscover = function () {
            ConnectionManagerSvc.discover($scope.nodeId, $scope.nodeAddress, $scope.nodePort).then(
              function () {
                $scope.$state.go('connection_manager.index');
              },
              function (error) {
                $scope.error = error.data;
              }
            );
          };
        }
      }
    }
  });
})