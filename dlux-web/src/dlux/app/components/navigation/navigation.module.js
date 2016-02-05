define(['angularAMD', 'app/core/core.module' ,'app/core/core.services','Restangular', 'common/config/env.module'], function (ng) {
  var nav = angular.module('app.common.nav', ['app.core','restangular', 'config']);

  nav.config( function($stateProvider, NavHelperProvider) {
    NavHelperProvider.addToView('src/common/navigation/navigation.tpl.html');
    NavHelperProvider.addControllerUrl('common/navigation/navigation.controller');
  });

  return nav;
});
