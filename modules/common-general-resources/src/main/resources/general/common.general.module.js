define(['angularAMD', 'Restangular'], function(ng) {
  var general = angular.module('app.common.general', ['restangular']);

  general.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
    general.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      filter: $filterProvider.register,
      factory: $provide.factory,
      service: $provide.service
    };
  });

  return general;
});
