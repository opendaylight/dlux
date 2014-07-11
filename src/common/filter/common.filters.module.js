define(['angularAMD'], function(ng) {

  var common = angular.module('app.common.filters', []);

  common.config(function($filterProvider) {
    common.register = {
      filter: $filterProvider.register
    };
  });

  return common;
});
