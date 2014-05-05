angular.module('console.node', [])

.controller('nodeCtrl', function($scope, SwitchSvc) {
  $scope.ncpData = {};

  // Fetch the node then fetch more info about each node
  SwitchSvc.nodeUrl().getList().then(function(npData) {
    $scope.npData = npData.nodeProperties;
  });
})

.config(function ($stateProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider.state('node', {
    url: '/node',
    abstract: true,
    templateUrl: 'node/root.tpl.html'
  });

  $stateProvider.state('node.index', {
    url: '/index',
    access: access.admin,
    views: {
      '': {
        templateUrl: 'node/index.tpl.html',
        controller: ['$scope', 'SwitchSvc', function ($scope, SwitchSvc) {
          $scope.selectAll = function() {
            console.log($('input[id^=select-node-]'));
            if($("#checkAll")[0].checked) {
              $scope.numberSelectedItems = $('input[id^=select-node-]').length;
            }
            else {
              $scope.numberSelectedItems = 0;
            }
            $('input[id^=select-node-]').each(function(i, el) {
              el.checked = $("#checkAll")[0].checked;
            });
          };

          $scope.unselect = function($event) {
            if(!$event.target.checked) {
              $("#checkAll")[0].checked = false;
              $scope.numberSelectedItems--;
            }
            else {
              $scope.numberSelectedItems++;
            }
          };
          $scope.svc = SwitchSvc;
          $scope.numberSelectedItems = 0;
          SwitchSvc.getAll(null).then(function(data) {
            $scope.data = data[0];
          });
          
        }]
      }
    }
  });


  $stateProvider.state('node.detail', {
    url: '/:nodeType/:nodeId/detail',
    access: access.admin,
    views: {
      '': {
        templateUrl: 'node/detail.tpl.html',
        controller: ['$scope', '$stateParams', 'SwitchSvc', function ($scope, $stateParams, SwitchSvc) {
          SwitchSvc.nodeUrl(null, $stateParams.nodeType, $stateParams.nodeId).get().then(
            function (data) {
              $scope.data = data;
            });

          // Filter function to remove ports with id 0
          $scope.portNotNull = function (property) {
            return property.nodeconnector.id !== "0";
          };
        }]
      }
    }
  });
});
