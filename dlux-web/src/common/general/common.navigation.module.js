define(['angularAMD', ], function (ng) {

  var common_navigation = angular.module('app.common.navigation', []);

  common_navigation.config(function ($compileProvider, $provide) {
    common_navigation.register = {
      directive: $compileProvider.directive,
      factory: $provide.factory
    };

    require(['common/general/common.navigation.directives'], function () {
      //console.log('common/general/common.navigation.directives loaded!');
    });

  });

  return common_navigation;
});

