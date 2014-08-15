define(['angularAMD', 'angular-cookies', 'app/core/core.services'], function(ng) {
  var topbar = angular.module('app.common.topbar', ['ngCookies', 'app.core']);

  topbar.config(function($compileProvider, $controllerProvider, $provide, TopBarHelperProvider) {
    topbar.register = {
      controller : $controllerProvider.register,
      directive : $compileProvider.directive,
      factory : $provide.factory,
      service : $provide.service
    };

    TopBarHelperProvider.addToView('src/common/topbar/topbar.tpl.html');
    TopBarHelperProvider.addControllerUrl('common/topbar/topbar.controller');
  });

  return topbar;
});
