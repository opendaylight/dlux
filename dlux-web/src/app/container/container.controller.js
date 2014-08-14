define(['app/container/container.module', 'jquery', 'footable', 'app/container/container.services', 'common/general/common.general.filters'], function(container, $) {

  container.register.controller('rootContainerCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
    $rootScope['section_logo'] = 'logo_container';
    $scope.getText = function(text) { // firefox use textContent while chrome use innerText.
      return text.innerText||text.textContent;
    };
  }]);

  container.register.controller('ViewContainerCtrl', ['$scope', 'ContainerSvc', function ($scope, ContainerSvc) {
    $scope.svc = ContainerSvc;
    ContainerSvc.getAll().then(function(data) {
      $scope.data = data[0];
    });

    $('table').footable().on('click', '.row-delete', function(e) {
      e.preventDefault();
      //get the footable object
      var footable = $('table').data('footable');

      //get the row we are wanting to delete
      var row = $(this).parents('tr:first');
      //delete the row
      ContainerSvc.delete($scope.getText(row[0].cells[0]));
        footable.removeRow(row);
      });
  }]);

  container.register.controller('ViewDetailContainerCtrl', ['$scope', 'ContainerSvc', '$stateParams', function ($scope, ContainerSvc, $stateParams) {
    ContainerSvc.containerUrl($stateParams.container).get().then(
      function (data) {
        $scope.data = data;
        console.log(data);
        console.log(data.containerConfig);
      }
    );
  }]);

  container.register.controller('EditContainerCtrl', ['$scope', 'ContainerSvc', '$stateParams', 'SwitchSvc', function ($scope, ContainerSvc, $stateParams, SwitchSvc) {
    $scope.submit = function () {
      ContainerSvc.containerUrl($stateParams.container).customPOST($scope.data).then(
        function () {
          $state.transitionTo('main.container.index');
        }, function(resp) {
          $scope.error = resp.data;
        }
      );
    };

    $scope.currentNodes = [];
    $scope.nodeProperties = [];

    $scope.currentConnectors = [];
    $scope.connectorProperties = {};

    // Populate nodes
    SwitchSvc.getAll().then(function(data) {
      $scope.nodeProperties = data.nodeProperties;
    });
    ContainerSvc.containerUrl($stateParams.container).get().then(
      function (data) {
        $scope.data = data.containerConfig[0];
        $("#nodes").select2("val", "OF|00:00:00:00:00:00:00:05");
      }
    );
    $scope.$watch('currentNodes', function (newVal, oldVal) {
      console.log("hello");
      console.log(newVal);
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
  }]);

  container.register.controller('CreateContainerCtrl', ['$scope', 'ContainerSvc', 'SwitchSvc' , '$state', function ($scope, ContainerSvc, SwitchSvc, $state) {
    // Build the request
    $scope.data = {};

    $scope.currentNodes = [];
    $scope.nodeProperties = [];

    $scope.currentConnectors = [];
    $scope.connectorProperties = {};

    // Populate nodes
    SwitchSvc.getAll().then(function(data) {
      $scope.nodeProperties = data.nodeProperties;
    });

    $scope.$watch('currentNodes', function (newVal, oldVal) {
      console.log("hello");
      console.log(newVal);
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
           $state.transitionTo('main.container.index');
        }, function(resp) {
          $scope.error = resp.data;
        }
      );
    };
  }]);
});
