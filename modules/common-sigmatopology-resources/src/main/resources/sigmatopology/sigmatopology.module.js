define(['angularAMD', 'Restangular', 'common/config/env.module'], function(ng) {
  var topology = angular.module('app.common.sigmatopology', ['restangular', 'config']);
  topology.register = topology; // for unit testing (temporary)

  topology.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
    topology.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      filter: $filterProvider.register,
      factory: $provide.factory,
      service: $provide.service
    };
  });

  return topology;
});
