define(['jquery', 'underscore', 'DLUX'], function ($, _, DLUX) {

  var ViewCtrl = function ($scope, $rootScope, $state) {
    $('#ViewsMgr').prependTo('#sideMenu > div:first');

    $scope.proxyClick = function () { // change view
      var modules = DLUX.getDLUXModules();
      _.each(modules, function (module) {
        //arbitary value, testing purpose
        module.visible = module.belongToView(2);
      });
    };


    $scope.createView = function () {
      $state.go('main.view.create');
      //var view = DLUX.createView('',)
    };

    $scope.modifyView = function () {
      $state.go('main.view.create');
    };

    $scope.deleteView = function (id) {
      DLUX.deleteView(id);
    };

  };
  ViewCtrl.$inject = ['$scope', '$rootScope', '$state'];

  var ModifyViewCtrl = function ($scope) {

  };
  ModifyViewCtrl.$inject = ['$scope'];

  return {
    ViewCtrl: ViewCtrl
  };
});
