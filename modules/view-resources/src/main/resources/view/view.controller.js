define(['jquery', 'underscore', 'DLUX', 'jquery-ui'], function ($, _, DLUX) {
  'use strict';

  var ViewCtrl = function ($scope, $rootScope, $state) {
    $('#ViewsMgr').prependTo('#sideMenu > div:first');
    var defaultView = DLUX.createView('Default');

    _.each(DLUX.getDLUXModules(), function (m) {
      defaultView.addModule(m);
    });

    $scope.views = [];
    $scope.visible = false;
    $rootScope['section_logo'] = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

    function refreshView() {
      $scope.views = DLUX.getViews();
    }

    $scope.toggleViewMgr = function () {
      $('#ViewContainer').toggle();
      $scope.visible = !$scope.visible;
    };

    $scope.changeView = function () { // change view
      var modules = DLUX.getDLUXModules(),
        view = this.view;

      _.each(modules, function (module) {
        module.visible = module.belongToView(view);
      });
    };

    $scope.createView = function () {
      $state.go('main.createView');
    };

    refreshView();

    $rootScope.$on('dluxViewsChanged', function () {
      refreshView();
    });

  };
  ViewCtrl.$inject = ['$scope', '$rootScope', '$state'];

  var CreateViewCtrl = function ($scope, $rootScope) {
    $scope.dluxViews = [];
    $scope.newViewModule = [];
    $scope.dluxModules = DLUX.getDLUXModules();
    $scope.newViewName = '';
    var editMode = false;

    function refreshViews() {
      $scope.dluxViews = DLUX.getViews();
    }

    function removeAndGet(container, moduleId) {
      for (var i = 0; i < container.length; ++i) {
        var module = container[i];
        if (module.id === moduleId) {
          container.splice(i, 1);
          return module;
        }
      }
    }

    function updateContainer(container, module) {
      container.push(module);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }

    function addToNewView(view) {
      _.each($scope.newViewModule, function (m) {
        view.addModule(m);
      });
      $rootScope.$broadcast('dluxViewsChanged');
    }

    function editView(view) {
      var modulesToRemove = _.difference(view.getModules(), $scope.newViewModule),
        modulesToAdd = _.difference($scope.newViewModule, view.getModules());
      _.each(modulesToRemove, function (module) {
        view.removeModule(module);
      });
      _.each(modulesToAdd, function (module) {
        view.addModule(module);
      });

    }

    function centerIcon(selector) {
      // centered icon, i was not able to use line-height: inherit
      var icons = $('#pageContent').find(selector);
      icons.each(function () {
        var parent = $(this).parent();
        $(this).css('line-height', parent.css('height'));
      });
    }

    $scope.dluxModuleLoaded = function () {
      var dluxModules = $('#DluxModuleContainer'),
        newView = $('#NewViewContainer');

      $('div', dluxModules).draggable({
        revert: 'invalid',
        cursor: 'move',
        scroll: true,
        helper: 'clone',
        containment: '#pageContent',
        start: function (evt, elem) {
          $('p, i', $(elem.helper[0])).remove();
        }
      });

      newView.droppable({
        accept: '#DluxModuleContainer > div',
        activeClass: 'ui-state-hover',
        hoverClass: 'ui-state-active',
        drop: function (event, ui) {
          var id = ui.draggable.data('id'),
            module = removeAndGet($scope.dluxModules, id);
          updateContainer($scope.newViewModule, module);
        }
      });

      centerIcon('.icon-plus');
    };

    $scope.dluxNewModuleLoaded = function () {
      centerIcon('.icon-remove');
    };

    $scope.viewLoaded = function () {
      centerIcon('.icon-remove');
    };

    $scope.saveView = function () {
      var view = DLUX.createView($scope.newViewName);
      if (editMode) {
        editView(view);
      } else {
        addToNewView(view);
      }
      $scope.resetModule();
    };

    $scope.resetModule = function () {
      $scope.newViewModule = [];
      $scope.dluxModules = DLUX.getDLUXModules();
      $('.dlux-view-container > div.selected').removeClass('selected');
      $scope.newViewName = '';
    };

    $scope.deleteView = function () {
      DLUX.deleteView(this.view);
      refreshViews();
      $rootScope.$broadcast('dluxViewsChanged');
    };

    $scope.addToView = function (id) {
      var module = removeAndGet($scope.dluxModules, id);
      updateContainer($scope.newViewModule, module);
    };

    $scope.removeFromView = function (id) {
      var module = removeAndGet($scope.newViewModule, id);
      updateContainer($scope.dluxModules, module);
    };

    $scope.selectView = function (evt) {
      var htmlView = $(evt.currentTarget);
      $scope.resetModule();
      if (htmlView.hasClass('selected')) {
        htmlView.removeClass('selected');

        editMode = false;
      } else {
        $('.dlux-view-container > div.selected').removeClass('selected');
        htmlView.addClass('selected');
        $scope.newViewName = this.view.name;
        _.each(this.view.getModules(), function (m) {
          removeAndGet($scope.dluxModules, m.id);
          updateContainer($scope.newViewModule, m);
        });
        editMode = true;
      }
    };

    refreshViews();

  };
  CreateViewCtrl.$inject = ['$scope', '$rootScope'];

  return {
    CreateViewCtrl: CreateViewCtrl,
    ViewCtrl: ViewCtrl
  };
});
