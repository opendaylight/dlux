define(['angular', 'DLUX', 'app/view/view.controller', 'app/core/core.services'], function (ng, DLUX, ctrl) {
  var view = ng.module('app.view', ['app.core']);

  view.config(function (NavHelperProvider) {
    NavHelperProvider.addToView('src/app/view/view.tpl.html');
  });

  view.controller('ViewCtrl', ctrl.ViewCtrl);

  return view;
});
