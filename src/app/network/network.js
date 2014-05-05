angular.module('console.networking', [])

.config(function ($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('network', {
    url: '/network',
    
    templateUrl: 'network/root.tpl.html',
    abstract: true
  });

  $stateProvider.state('network.index', {
    url: '/index',
    access: access.public,
    views: {
      '': {
        templateUrl: 'network/index.tpl.html',
        controller: function($scope) { // removed NetworkSvc for now ( it's not used...)
        }
      }
    }
  });

  $stateProvider.state('network.staticroutes', {
    url: '/staticroute',
    access: access.public,
    views: {
      '': {
        templateUrl: 'network/staticroutes.tpl.html',
        controller: ['$scope', 'StaticRouteSvc', function ($scope, StaticRouteSvc) {
          StaticRouteSvc.routesUrl(null).getList().then(
            function (data) {
              $scope.data = data;
            }
          );

          $('table').footable().on('click', '.row-delete', function(e) {
            e.preventDefault();
            //get the footable object
            var footable = $('table').data('footable');

            //get the row we are wanting to delete
            var row = $(this).parents('tr:first');
            //delete the row
            StaticRouteSvc.delete($scope.getText(row[0].cells[0]));
            footable.removeRow(row);
          });


        }]
      }
    }
  });

  $stateProvider.state('network.staticroutes.create', {
    url: '/create',
    access: access.public,
    views: {
      '@network': {
        templateUrl: 'network/staticroutes.create.tpl.html',
        controller: ['$scope', 'StaticRouteSvc', '$state', function ($scope, StaticRouteSvc, $state) {
          $scope.submit = function () {
            StaticRouteSvc.routeUrl(null, $scope.data.name).customPUT($scope.data).then(
              function (data) {
                $state.transitionTo('network.staticroutes', null, { location: true, inherit: true, relative: $state.$current, notify: true });
              }, function(resp) {
                $scope.error = resp.data;
              }
            );
          };

          
        }]
      }
    }
  });

  $stateProvider.state('network.staticroutes.edit', {
    url: '/:name/edit',
    access: access.public,
    views: {
      '@network': {
        templateUrl: 'network/staticroutes.edit.tpl.html',
        controller: ['$scope', 'StaticRouteSvc', '$state', '$stateParams', function ($scope, StaticRouteSvc, $state, $stateParams) {
          $scope.submit = function () {
            console.log(StaticRouteSvc.routeUrl(null, $scope.data.name));
            StaticRouteSvc.routeUrl(null, $scope.data.name).customPOST($scope.data).then(
              function (data) {
                $state.transitionTo('network.staticroutes', null, { location: true, inherit: true, relative: $state.$current, notify: true });
              }, function(resp) {
                $scope.error = resp.data;
              }
            );
          };
          StaticRouteSvc.routeUrl(null, $stateParams.name).get().then(
              function (data) {
               $scope.data = data;
              }
            );

          
        }]
      }
    }
  });

  $stateProvider.state('network.subnets', {
    url: '/subnet',
    access: access.public,
    views: {
      '': {
        templateUrl: 'network/subnets.tpl.html',
        controller: ['$scope', 'SubnetSvc', function ($scope, SubnetSvc) {
          SubnetSvc.subnetsUrl(null).getList().then(
            function (data) {
              $scope.data = data;
            }
          );

          $('table').footable().on('click', '.row-delete', function(e) {
            e.preventDefault();

            //get the footable object
            var footable = $('table').data('footable');
            //get the row we are wanting to delete
            var row = $(this).parents('tr:first');
            //delete the row
            SubnetSvc.delete($scope.getText(row[0].cells[0]));
            footable.removeRow(row);
          });
        }]
      }
    }
  });

  $stateProvider.state('network.subnets.create', {
    url: '/create',
    views: {
      '@network': {
        templateUrl: 'network/subnets.create.tpl.html',
        controller: ['$scope', 'SubnetSvc', '$state', function ($scope, SubnetSvc, $state) {
          $scope.submit = function () {
            SubnetSvc.subnetUrl(null, $scope.data.name).customPUT($scope.data).then(
              function(data) {
                $state.transitionTo('network.subnets', null, { location: true, inherit: true, relative: $state.$current, notify: true });
              }, function(resp) {
                $scope.error = resp.data;
              }
            );
          };
        }]
      }
    }
  });

  $stateProvider.state('network.subnets.edit', {
    url: '/:name/edit',
    views: {
      '@network': {
        templateUrl: 'network/subnets.edit.tpl.html',
        controller: ['$scope', 'SubnetSvc', '$state', '$stateParams', function ($scope, SubnetSvc, $state, $stateParams) {
            SubnetSvc.subnetUrl(null, $stateParams.name).get().then(
              function(data) {
              $scope.data = data;
               }
            );
            $scope.submit = function () {
            SubnetSvc.subnetUrl(null, $scope.data.name).customPOST($scope.data).then(
              function(data) {
                $state.transitionTo('network.subnets', null, { location: true, inherit: true, relative: $state.$current, notify: true });
              }, function(resp) {
                $scope.error = resp.data;
              }
            );
          };
           
          
        }]
      }
    }
  });

});
