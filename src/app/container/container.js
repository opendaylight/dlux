angular.module('dlux.container', [])

.config(function ($stateProvider) {
  $stateProvider.state('container', {
    url: '/container',
    abstract: true,
    templateUrl: 'container/root.tpl.html'
  });

  $stateProvider.state('container.index', {
    url: '/index',
    views: {
      '': {
        templateUrl: 'container/index.tpl.html',
        controller: function ($scope, ContainerSvc) {
          $scope.$watch(
            function () {
              return ContainerSvc.data;
            },
            function (data) {
              $scope.data = data;
            }
          );
        }
      }
    }
  });

  $stateProvider.state('container.detail', {
    url: '/{container}/detail',
    views: {
      '': {
        templateUrl: 'container/detail.tpl.html',
        controller: function ($scope, ContainerSvc) {
          ContainerSvc.containerUrl($scope.$stateParams.container).get().then(
            function (data) {
              $scope.data = data;
            }
          );
        }
      }
    }
  });

  $stateProvider.state('container.create', {
    url: '/create',
    views: {
      '': {
        templateUrl: 'container/create.tpl.html',
        controller: function ($scope, ContainerSvc, SwitchSvc) {
          // Build the request
          $scope.data = {};

          $scope.currentNodes = [];
          $scope.nodeProperties = [];

          $scope.currentConnectors = [];
          $scope.connectorProperties = {};

          // Populate nodes
          SwitchSvc.getAll();
          $scope.$watch(
            function () {
              return SwitchSvc.data;
            },
            function (data) {
              if (data) {
                $scope.nodeProperties = data.nodeProperties;
              }
            }
          );

          $scope.$watch('currentNodes', function (newVal, oldVal) {
            angular.forEach(newVal, function (key) {
              if (!$scope.connectorProperties[key]) {
                var identifier = key.split('|');

                SwitchSvc.getConnectorProperties(null, identifier[0], identifier[1]).then(
                  function (data) {
                    $scope.connectorProperties[key] = data.nodeConnectorProperties;
                  }
                );
              }
            });

            angular.forEach(oldVal, function (key) {
              if (newVal.indexOf(key) == -1) {
                delete $scope.connectorProperties[key];
              }
            });
          });

          $scope.submit = function () {
            ContainerSvc.containerUrl($scope.data.container).customPUT($scope.data).then(
              function () {
                ContainerSvc.getAll();
                $scope.$state.transitionTo('container.index');
              }
            );
          };
        }
      }
    }
  });
});
