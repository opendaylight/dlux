define(['underscore'], function (_) {
  'use strict';
  var idIncrement = 0;

  function getNextId() {
    return (idIncrement += 1);
  }

  /*
   * Module DLUXModule
   * Minimal Overlay over an AngularJs module
   */
  var DLUXModule = (function () {
    var id = 0;

    function DLUXModule(ng, internal) {
      id = getNextId();
      this.ng = ng;
      this.name = ng.name;
      this.visible = true;
      this.view = 1; // default perspective view
      this.internal = internal || false; // internal module flags (e.g navigation or core)

      Object.defineProperty(this, 'id', {
        value: id
      });
    }

    DLUXModule.prototype.controller = function (name, cb) {
      /*if (_.isArray(cb)) {
        _.each(cb, function (elem, index) {
          if (_.isFunction(elem)) {
            var fn = elem;
            cb[index] = function () {
              fn.apply(this, arguments);
            }
          }
        });
      } else {
        var fn = cb;
        cb = function () {
          fn.apply(this, arguments);
        }
      }*/
      this.ng.controller(name, cb);
    };

    DLUXModule.prototype.provider = function (name, cb) {
      this.ng.provider(name, cb);
    };

    DLUXModule.prototype.directive = function (name, cb) {
      this.ng.directive(name, cb);
    };

    DLUXModule.prototype.factory = function (name, cb) {
      this.ng.factory(name, cb);
    };

    // Compare the module flag to the view flag
    DLUXModule.prototype.belongToView = function (flag) {
      return (flag & this.view) === flag;
    };

    DLUXModule.prototype.service = function (name, cb) {
      this.ng.service(name, cb);
    };

    DLUXModule.prototype.constant = function (name, cb) {
      this.ng.constant(name, cb);
    };

    DLUXModule.prototype.config = function (name, cb) {
      this.ng.config(name, cb);
    };

    DLUXModule.prototype.run = function (name, cb) {
      this.ng.run(name, cb);
    };

    return DLUXModule;
  }());

  var DLUXView = (function () {
    var modules = null,
      id = 0;

    function DLUXView(name, flag) {
      this.name = name;
      this.flag = flag;
      id = getNextId();
      modules = [];

      Object.defineProperty(this, 'id', {
        value: id
      });
    }

    DLUXView.prototype.addModule = function (module) {
      if (!module instanceof DLUXModule) {
        console.error('DLUXView :: The module is not a DLUX Module ' + module);
        return;
      }

      module.view |= this.flag;

      modules.push(module);
    };

    return DLUXView;
  }());

  var DLUXMenu = (function () {
    var id = getNextId(),
      menus = null;

    function DLUXMenu(name) {
      this.name = name;
      menus = [];

      Object.defineProperty(this, 'id', {
        value: id
      });

      Object.defineProperty(this, 'items', {
        value: menus,
        writable: false,
        enumerable: true,
        configurable: true
      });
    }

    DLUXMenu.prototype.addMenuItem = function (menuItem) {
      menus.push(menuItem);
    };

    return DLUXMenu;
  }());

  var DLUXMenuItem = (function () {
    var id = 0;

    function DLUXMenuItem(depth, title, href, icon, active, page, submenu) {
      id = getNextId();
      this.depth = depth;
      this.href = href;
      this.active = active;
      this.title = title;
      this.icon = icon;
      this.page = page;
      this.linkedModule = null; // Need the module object because object/array are passed by ref and anything else by value
      this.submenu = submenu || []; // TODO: Change to use DLUXMenu and DLUXMenuItem

      Object.defineProperty(this, 'id', {
        value: id
      });

    }

    DLUXMenuItem.prototype.asSubMenus = function () {
      return this.submenu.length > 0;
    };

    return DLUXMenuItem;
  }());

  var DLUX = (function (DLUX) {
    var angularCtx = {},
      modules = [],
      views = [],
      dluxPattern = /bootstrap|template|^(ng)|restangular/i,
      internalPattern = /app\.core|common|^(config)/i;

    DLUX.isDLUXModule = function (name) {
      return !dluxPattern.test(name);
    };

    DLUX.IsInternalModule = function (name) {
      return internalPattern.test(name);
    };

    DLUX.createModule = function (name, deps, internal) {
      var module = new DLUXModule(angularCtx.module(name, deps), internal);
      modules.push(module);
      return module;
    };

    DLUX.createView = function (name) {
      var flag = Math.pow(2, views.length),
        view = new DLUXView(name, flag);
      name = name || 'view' + views.length + 1;
      views.push(view);
      return view;
    };

    DLUX.deleteView = function (id) {
      views = _.reject(views, function (v) {
        return v.id === id;
      });
    };

    DLUX.extendAngularContext = function (angular) {
      angularCtx = angular;
      return angular.extend({}, angular);
    };

    DLUX.getDLUXModules = function () {
      return _.filter(modules, function (m) {
        return !m.internal;
      });
    };

    DLUX.getViews = function () {
      return views;
    };

    DLUX.Menu = DLUXMenu;
    DLUX.MenuItem = DLUXMenuItem;
    DLUX.Module = DLUXModule;
    DLUX.View = DLUXView;

    return DLUX;
  }({}));

  return DLUX;
});
