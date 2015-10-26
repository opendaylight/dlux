define(['jquery', 'underscore', 'DLUX', 'jquery-ui'], function ($, _, DLUX) {
  'use strict';

  var ViewCtrl = function ($scope, $rootScope, $state) {
    $('#ViewsMgr').prependTo('#sideMenu > div:first');

    $scope.views = [
      DLUX.createView('Default'),
      DLUX.createView('Backend'),
      DLUX.createView('Frontend')
    ];

    $scope.visible = true;

    $scope.toggleViewMgr = function () {
      $('#ViewContainer').toggle();
      $scope.visible = !$scope.visible;
    };

    $scope.changeView = function (flag) { // change view
      var modules = DLUX.getDLUXModules();
      console.log('go to view ' + flag);

      _.each(modules, function (module) {
        //arbitary value, testing purpose
        module.visible = module.belongToView(flag);
      });
    };


    $scope.createView = function () {
      $state.go('main.createView');
    };

    $scope.modifyView = function () {
      $state.go('main.view.create');
    };

    $scope.deleteView = function (id) {
      DLUX.deleteView(id);
    };

  };
  ViewCtrl.$inject = ['$scope', '$rootScope', '$state'];

  var CreateViewCtrl = function ($scope) {

    function appendToDiv(id, item) {
      var container = $(id);
      item.css('left', 0);
      item.css('top', 0);
      item.appendTo(container);
    }

    $scope.dluxModuleLoaded = function () {
      var dluxModules = $('#DluxModuleContainer'),
        newView = $('#NewViewContainer');

      $('div', dluxModules).draggable({
        revert: 'invalid',
        cursor: 'move',
        containment: '#pageContent'
      });

      newView.droppable({
        accept: '#DluxModuleContainer > div',
        activeClass: 'ui-state-hover',
        hoverClass: 'ui-state-active',
        drop: function (event, ui) {
          appendToDiv('#NewViewContainer', ui.draggable);
        }
      });

      dluxModules.droppable({
        accept: '#NewViewContainer > div',
        activeClass: 'ui-state-hover',
        hoverClass: 'ui-state-active',
        drop: function (event, ui) {
          appendToDiv('#DluxModuleContainer', ui.draggable);
        }
      });
    };



    $scope.dluxModules = DLUX.getDLUXModules();
    $scope.dluxViews = DLUX.getViews();
  };
  CreateViewCtrl.$inject = ['$scope'];


  var ModifyViewCtrl = function ($scope) {

  };
  ModifyViewCtrl.$inject = ['$scope'];

  return {
    CreateViewCtrl: CreateViewCtrl,
    ViewCtrl: ViewCtrl
  };
});
