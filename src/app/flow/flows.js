angular.module('dlux.flow', [])


.controller('FlowCtrl', function ($scope, $http, FlowSvc, SwitchSvc) {
  // The current flow
  $scope.flow = {installInHw: true};

  // These are the available actions
  $scope.actionOptions = {
    'DROP': {},
    'LOOPBACK': {}
  };

  $scope.actionActive = [];

  $scope.nodes = SwitchSvc.nodesUrl().getList();

  // The current select nodes properties
  $scope.selectNode = function() {
    // Split the nodeString which contains nodeType and nodeId, this is used
    // in $scope.submit() to construct the URL for the PUT
    var node  = $scope.nodeString.split('/');

    $scope.flow.node = {type: node[0], id: node[1]};

    /* Set nodeConnectorProperties for the selected node
     *
     * When a node is set the ingressPort should be cleared
     */
    delete $scope.flow.ingressPort;
    $scope.nodeConnector = SwitchSvc.nodeUrl(null, $scope.flow.node.type, $scope.flow.node.id).get();
  };

  $scope.submit = function () {
    FlowSvc.staticFlowUrl(null, $scope.flow.node.type, $scope.flow.node.id, $scope.flow.name)
      .customPUT($scope.flow)
      .then(function (data) {
        $scope.$state.go('flow.list');
      });
  };
})


// Flow composition view controller
.controller('FlowCompositionCtrl', function ($scope) {
  $scope.$watch('actionActive', function(newValue, oldValue, scope) {
    $scope.flow.actions = newValue;
  });
})


.config(function ($stateProvider) {
  $stateProvider.state('flow', {
    url: '/flow',
    templateUrl: 'flow/root.tpl.html',
    //template: '<ui-view></ui-view>',
    abstract: true
  });

  // List all flow - independant of node.
  $stateProvider.state('flow.list', {
    url: '/list',
    views: {
      '': {
        templateUrl: 'flow/list.tpl.html',
        controller: function ($scope, FlowSvc) {
          FlowSvc.flowsUrl().getList().then(function (data) {
            $scope.flow = data.flowConfig;
          });
        }
      }
    }
  });

  $stateProvider.state('flow.create', {
    url: '/create',
    views: {
      '': {
        templateUrl: 'flow/create.tpl.html',
        controller: 'FlowCtrl'
      },
      'composer@flow.create': {
        templateUrl: 'flow/composer.tpl.html',
        controller: 'FlowCompositionCtrl'
      },
    }
  });

  // List the flow on a node
  $stateProvider.state('flow.node', {
    url: '/{nodeType}/{nodeId}',
    views: {
      '': {
        templateUrl: 'flow/node.tpl.html',
        controller: function ($scope, FlowSvc) {
          FlowSvc.nodeflowUrl(null, $scope.$stateParams.nodeType, $scope.$stateParams.nodeId).getList().then(
            function (data) {
              $scope.flow = data.flowConfig;
            }
          );
        }
      }
    }
  });

  // Show details
  $stateProvider.state('flow.detail', {
    url: '/{nodeType}/{nodeId}/{flowName}/detail',
    views: {
      '': {
        templateUrl: 'flow/detail.tpl.html',
        controller: function ($scope, FlowSvc) {
          FlowSvc.staticFlowUrl(null, $scope.$stateParams.nodeType, $scope.$stateParams.nodeId, $scope.$stateParams.flowName).get().then(
            function (data) {
              $scope.flow = data;
            }
          );
        }
      }
    }
  });

  // Edit state which uses the '' view in flow.detail
  $stateProvider.state('flow.detail.edit', {
    url: '/edit',
    views: {
      '@flow.detail': {
        templateUrl: 'flow/edit.tpl.html',
        controller: function ($scope, FlowSvc) {
        }
      }
    }
  });
});
