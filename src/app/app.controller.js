define(['app/app.module', 'common/navigation/navigation.services', 'common/authentification/auth.services'], function (app) {
  'use strict';
  
  app.register.controller('AppCtrl', function ($rootScope, $http, $scope, $state, $location) {    
    $rootScope.useMobile = 
      function() { 
       if( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) ||
           navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) ||
           navigator.userAgent.match(/Windows Phone/i) ) {
         return true;
       }
       else {
         return false;
       } 
    };

    $scope.isCollapse = false;
		$scope.breadcrumbs = {};
    $scope.isState = function(name) {
      return $state.includes(name);
    };
  });
});
