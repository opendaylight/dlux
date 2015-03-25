define(['common/navigation/navigation.module', 'app/core/core.services', 'common/navigation/navigation.services'], function(nav, services) {
  nav.register.controller('NavCtrl', function($scope, NavHelper) {
    $scope.navList = NavHelper.getMenu();
  });

  nav.register.controller('navItemCtrl', function($scope, NavHelper) {
    $scope.display = 'none';
    $scope.isOpen = false;

    $scope.isValid = function (value) {
      if (angular.isUndefined(value) || value === null) {
        return false;
      }
      else {
        return true;
      }
    };

    $scope.updateTemplate = function (e, item) {
      e.stopPropagation();
      e.preventDefault();

      $scope.isOpen = !$scope.isOpen;
      if ($scope.display == 'none') {
        $scope.display = 'block';
      }
      else {
        $scope.display = 'none';
      }
    };
  });

});
