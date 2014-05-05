angular.module('console.connection_manager', [])

.config(function ($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('connection_manager', {
    abstract: true,
    url: '/connection_manager',
    templateUrl: 'connection_manager/root.tpl.html'
  });

  $stateProvider.state('connection_manager.index', {
    url: '/index',
    access: access.public,
    templateUrl: 'connection_manager/index.tpl.html',
    views: {
      '': {
        templateUrl: 'connection_manager/index.tpl.html',
        controller: ['$scope', 'ConnectionManagerSvc', function ($scope, ConnectionManagerSvc) {
          $scope.svc = ConnectionManagerSvc;
          ConnectionManagerSvc.getAll(null).then(function(data) {
            $scope.data = data[0];
          });
          

        }]
      }
    }
  });

  $stateProvider.state('connection_manager.discover', {
    url: '/discover',
    access: access.public,
    views: {
      '': {
        templateUrl: 'connection_manager/discover.tpl.html',
        controller: ['$scope', 'SwitchSvc', 'ConnectionManagerSvc', '$state', function ($scope, SwitchSvc, ConnectionManagerSvc, $state) {
          $scope.nodePort = 6633;

          $scope.doDiscover = function () {
            ConnectionManagerSvc.discover($scope.nodeId, $scope.nodeAddress, $scope.nodePort).then(
              function () {
                $state.transitionTo('connection_manager.index', null, { location: true, inherit: true, relative: $state.$current, notify: true });
              },
              function (error) {
                $scope.error = error.data;
              }
            );
          };
        }]
      }
    }
  });
});
