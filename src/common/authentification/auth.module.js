define(['angularAMD', 'angular-cookies'], function(ng) {
  var auth = angular.module('app.common.auth', ['ngCookies']);

  auth.config(function($provide) {
    auth.register = {
      factory : $provide.factory
    };
  });
  return auth;
});

