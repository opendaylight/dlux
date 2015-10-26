define(['angular', 'DLUX', 'app/view/view.controller', 'app/view/view.directive', 'app/core/core.services'], function (ng, DLUX, ctrl, dir) {
  'use strict';
  var view = ng.module('app.view', ['app.core']);

  view.config(function ($stateProvider, NavHelperProvider) {
    NavHelperProvider.addToView('src/app/view/view.tpl.html');
    $stateProvider
      .state('main.createView', {
        url: 'view/create',
        views: {
          'content': {
            templateUrl: 'src/app/view/create.tpl.html',
            controller: 'CreateViewCtrl'
          }
        }
      });
  });

  view.controller('ViewCtrl', ctrl.ViewCtrl);
  view.controller('CreateViewCtrl', ctrl.CreateViewCtrl);
  view.directive('postRepeat', dir.PostRepeat);
  return view;
});
