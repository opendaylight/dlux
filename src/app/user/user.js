angular.module('console.user', [])

.config(function ($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('user', {
    url: '/user',
    
    abstract: true,
    templateUrl: 'user/root.tpl.html'
  });

  $stateProvider.state('user.index', {
    url: '/index',
    access: access.public,
    views: {
      '': {
        templateUrl: 'user/index.tpl.html',
        controller: ['$scope', 'UserSvc', function ($scope, UserSvc) {
          $scope.svc = UserSvc;
          $scope.svc.getUsers(null).then(function(data) {
            console.log(data);
            alert("DATA!!");
          });

          $('table').footable().on('click', '.row-delete', function(e) {
            //delete
          });
        }]
      }
    }
  });

  $stateProvider.state('user.create', {
    url: '/create',
    access: access.public,
    views: {
      '': {
        templateUrl: 'user/create.tpl.html',
        controller: ['$scope', 'ContainerSvc', 'SwitchSvc', '$state', function ($scope, ContainerSvc, SwitchSvc, $state) {
          
        }]
      }
    }
  });
});
