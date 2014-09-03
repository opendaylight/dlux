define(['angularAMD', 'app/core/core.module' ,'app/core/core.services'], function (ng) {
  var nav = angular.module('app.common.nav', ['app.core']);

  nav.config( function($stateProvider, $controllerProvider,$compileProvider, $provide, NavHelperProvider) {

    // use the register because the app is already bootstraped
    nav.register = {
      directive: $compileProvider.directive,
      controller: $controllerProvider.register,
      factory: $provide.factory,
      service: $provide.service
    };

    NavHelperProvider.addToView('src/common/navigation/navigation.tpl.html');
    NavHelperProvider.addControllerUrl('common/navigation/navigation.controller');


  });

  return nav;
});
