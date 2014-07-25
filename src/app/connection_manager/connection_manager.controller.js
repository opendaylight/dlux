define (['app/connection_manager/connection_manager.module', 'app/connection_manager/connection_manager.services'], function(connection_manager) {

  connection_manager.register.controller('rootConnectionManagerCtrl', ['$rootScope', function($rootScope) {
    $rootScope['section_logo'] = 'logo_connection_manager';
  }]);

  connection_manager.register.controller('ConnectionManagerCtrl',  ['$scope', 'ConnectionManagerSvc', function ($scope, ConnectionManagerSvc) {
    $scope.svc = ConnectionManagerSvc;
    ConnectionManagerSvc.getAll(null).then(function(data) {
      $scope.data = data[0];
    });
  }]);

  connection_manager.register.controller('ConnectionManagerDiscoveryCtrl', ['$scope', 'ConnectionManagerSvc', '$state', function ($scope, ConnectionManagerSvc, $state) {
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
  }]);
});
