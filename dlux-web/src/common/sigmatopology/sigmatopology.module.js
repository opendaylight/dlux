define(['angularAMD', 'Restangular', 'common/config/env.module'], function(ng) {
  var topology = angular.module('app.common.sigmatopology', ['restangular', 'config']);

  return topology;
});
