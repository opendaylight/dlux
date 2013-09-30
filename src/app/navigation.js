angular.module('dlux.navigation', [])



// This triggers data updates when clicking on a item
.controller('NavigationCtrl', function ($scope, $injector) {
  /*
   * Listen for the event:nagivation from the brd-anchor directive and act
   * accordingly.
   */
  $scope.svc = undefined;
  $scope.svcName = undefined;

  // Function to setup the menu
  $scope.setupSubMenu = function (name) {
    var stateToServices = {
      'node': 'SwitchSvc',
    };

    var stateBase = name.split('.')[0];

    var svcName;
    if (stateToServices[stateBase] !== undefined) {
      svcName = stateToServices[stateBase];
    } else {
      svcName = _.str.capitalize(stateBase) + 'Svc';
    }


    if (!$injector.has(svcName)) {
      $scope.menu = null;
      return;
    }

    $scope.subMenuTitle = _.str.capitalize(stateBase) + 's';

    var svc = $injector.get(svcName);

    if (_.isFunction(svc.getAll)) {
      svc.getAll(null);
      $scope.svc = svc;
    } else {
      $scope.menu = null;
    }
  };

  // The directive broadcasts event:navigation that we are listening to
  $scope.$on('event:navigation', function (event, data) {
    $scope.setupSubMenu(data.state);
  });

  // A watcher, if $scope.svc and $scope.svc.data then we return the data else null
  $scope.$watch(
    function () {
      return $scope.svc && $scope.svc.data ? $scope.svc.data : null;
    },
    function(data) {
      if (data) {
        $scope.menu = $scope.svc.itemsData(data);
      }
    }
  );
});
