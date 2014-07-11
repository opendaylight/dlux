define(['app/app.module'], function (app) {
  
  app.directive('mcGui', function($rootScope) {
    return {
      replace: true,
      templateUrl: 'index.tpl.html',
      controller: ''
    };
  });

});
