define(['app/network/network.module', 'jquery', 'footable', 'app/network/network.services'], function(network, $) {

  network.register.controller('NetworkCtrl', function($rootScope, $scope, $state) {
    $rootScope['section_logo'] = 'logo_network';
    $scope.isState = function(name) {
      return $state.includes(name);
    };
    $scope.getText = function(text) { // firefox use textContent while chrome use innerText...
      return text.innerText||text.textContent;
    };
  });


  network.register.controller('StaticRouteCtrl', ['$scope', 'StaticRouteSvc', function ($scope, StaticRouteSvc) {
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


  }]);

  network.register.controller('StaticRouteCreateCtrl', ['$scope', 'StaticRouteSvc', '$state', function ($scope, StaticRouteSvc, $state) {
    $scope.submit = function () {
       StaticRouteSvc.routeUrl(null, $scope.data.name).customPUT($scope.data).then(
        function (data) {
          $state.transitionTo('main.network.staticroutes', null, { location: true, inherit: true, relative: $state.$current, notify: true });
        }, function(resp) {
          $scope.error = resp.data;
        }
      );
    };
  }]);

  network.register.controller('StaticRouteEditCtrl', ['$scope', 'StaticRouteSvc', '$state', '$stateParams', function ($scope, StaticRouteSvc, $state, $stateParams) {
    $scope.submit = function () {
      console.log(StaticRouteSvc.routeUrl(null, $scope.data.name));
      StaticRouteSvc.routeUrl(null, $scope.data.name).customPOST($scope.data).then(
        function (data) {
          $state.transitionTo('main.network.staticroutes', null, { location: true, inherit: true, relative: $state.$current, notify: true });
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
  }]);

  network.register.controller('SubnetCtrl', ['$scope', 'SubnetSvc', function ($scope, SubnetSvc) {
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
  }]);

 network.register.controller('SubnetCreateCtrl', ['$scope', 'SubnetSvc', '$state', function ($scope, SubnetSvc, $state) {
    $scope.submit = function () {
      SubnetSvc.subnetUrl(null, $scope.data.name).customPUT($scope.data).then(
        function(data) {
          $state.transitionTo('main.network.subnets', null, { location: true, inherit: true, relative: $state.$current, notify: true });
        }, function(resp) {
          $scope.error = resp.data;
        }
      );
    };
  }]);

  network.register.controller('SubnetEditCtrl', ['$scope', 'SubnetSvc', '$state', '$stateParams', function ($scope, SubnetSvc, $state, $stateParams) {
    SubnetSvc.subnetUrl(null, $stateParams.name).get().then(
      function(data) {
        $scope.data = data;
      }
    );
    $scope.submit = function () {
      SubnetSvc.subnetUrl(null, $scope.data.name).customPOST($scope.data).then(
        function(data) {
          $state.transitionTo('main.network.subnets', null, { location: true, inherit: true, relative: $state.$current, notify: true });
        }, function(resp) {
          $scope.error = resp.data;
        }
      );
    };
  }]);

});
