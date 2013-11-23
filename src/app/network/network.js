angular.module('dlux.networking', [])

.config(function ($stateProvider) {
  $stateProvider.state('network', {
    url: '/network',
    templateUrl: 'network/root.tpl.html',
    abstract: true
  });

  $stateProvider.state('network.index', {
    url: '/index',
    views: {
      '': {
        templateUrl: 'network/index.tpl.html',
        controller: function($scope, NetworkSvc) {
        }
      }
    }
  });

  $stateProvider.state('network.staticroutes', {
    url: '/staticroute',
    views: {
      '': {
        templateUrl: 'network/staticroutes.tpl.html',
        controller: function ($scope, StaticRouteSvc) {
          StaticRouteSvc.routesUrl(null).getList().then(
            function (data) {
              $scope.data = data;
            }
          );
        }
      }
    }
  });

  $stateProvider.state('network.staticroutes.create', {
    url: '/create',
    views: {
      '@network': {
        templateUrl: 'network/staticroutes.create.tpl.html',
        controller: function ($scope, StaticRouteSvc) {
          $scope.submit = function () {
            StaticRouteSvc.routeUrl(null, $scope.data.name).customPUT($scope.data).then(
              function (data) {
                $scope.$state.go('network.staticroutes');
              }
            );
          };
        }
      }
    }
  });

  $stateProvider.state('network.subnets', {
    url: '/subnet',
    views: {
      '': {
        templateUrl: 'network/subnets.tpl.html',
        controller: function ($scope, SubnetSvc) {
          SubnetSvc.subnetsUrl(null).getList().then(
            function (data) {
              $scope.data = data;
            }
          );
        }
      }
    }
  });

  $stateProvider.state('network.subnets.create', {
    url: '/create',
    views: {
      '@network': {
        templateUrl: 'network/subnets.create.tpl.html',
        controller: function ($scope, SubnetSvc) {
          $scope.submit = function () {
            SubnetSvc.subnetUrl(null, $scope.data.name).customPUT($scope.data).then(
              function(data) {
                $scope.$state.go('network.subnets');
              }
            );
          };
        }
      }
    }
  });

});
