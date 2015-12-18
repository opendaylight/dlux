define(['underscore'], function (_) {
  'use strict';

  /** @ignore */
  var idIncrement = 0;

  /** @ignore */
  function getNextId() {
    return (idIncrement += 1);
  }

  var DLUXModule = (function () {
    /** @lends DLUX.Module */

    /** @access private */
    var id = 0;

    /**
     * @constructs DLUX.Module
     * @param {Object}   ng      The angularJs module
     * @param {Boolean} internal The module status
     */
    function DLUXModule(ng, internal) {
      id = getNextId();
      /** @access public */
      this.ng = ng;
      /** @access public */
      this.name = ng.name;
      /** @access public */
      this.visible = true;
      /** @access public */
      this.view = 0; // will be set by the default view
      /** @access public */
      this.internal = internal || false; // internal module flags (e.g navigation or core)

      /**
       * @property {Number} The object id
       */
      Object.defineProperty(this, 'id', {
        value: id
      });
    }

    /**
     * AngularJs controller callback
     * @param {String} name controller name
     * @param {Function} cb the callback function
     */
    DLUXModule.prototype.controller = function (name, cb) {
      this.ng.controller(name, cb);
    };

    /**
     * AngularJs provider callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.provider = function (name, cb) {
      this.ng.provider(name, cb);
    };

    /**
     * AngularJs directive callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.directive = function (name, cb) {
      this.ng.directive(name, cb);
    };

    /**
     * AngularJs factory callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.factory = function (name, cb) {
      this.ng.factory(name, cb);
    };

    /**
     * Look if the module belong to a view
     * @param {DLUX.View} view the DLUXView to compare with
     * @returns {Boolean} true if the module is in this view
     */
    DLUXModule.prototype.belongToView = function (view) {
      return (view.flag & this.view) === view.flag;
    };

    /**
     * AngularJs service callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.service = function (name, cb) {
      this.ng.service(name, cb);
    };

    /**
     * AngularJs constant callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.constant = function (name, cb) {
      this.ng.constant(name, cb);
    };

    /**
     * AngularJs configuration callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.config = function (name, cb) {
      this.ng.config(name, cb);
    };

    /**
     * AngularJs running callback
     * @param {String} name controller name
     * @param {Function} cb   the callback function
     */
    DLUXModule.prototype.run = function (name, cb) {
      this.ng.run(name, cb);
    };

    return DLUXModule;
  }());

  var DLUXView = (function () {
    /** @lends DLUX.View */

    /** @access private */
    var id = 0;

    /**
     * @constructs DLUX.View
     * @param {String} name view name
     * @param {Number} flag comparator
     */
    function DLUXView(name, flag) {
      /** @access public */
      this.name = name;
      /** @access public */
      this.flag = flag;

      id = getNextId();

      /** @access private */
      this.modules = [];

      /** @property {Number} id The DLUX Object id */
      Object.defineProperty(this, 'id', {
        value: id
      });
    }

    DLUXView.prototype.getModules = function () {
      return this.modules;
    };

    /**
     * Add a module to the view
     * @throws {TypeError} will throw an error if the module is not a DLUXModule
     * @param {DLUX.Module} module module to add to the view
     */
    DLUXView.prototype.addModule = function (module) {
      if (!(module instanceof DLUXModule)) {
        throw new TypeError('DLUXView ' + this.name + ' :: The module is not a DLUX Module ' + module);
      }

      module.view |= this.flag;

      this.modules.push(module);
    };

    /**
     * Remove a module to the view
     * @throws {TypeError} will throw an error if the module is not a DLUXModule
     * @param {DLUX.Module} module module to remove to the view
     */
    DLUXView.prototype.removeModule = function (module) {
      if (!(module instanceof DLUXModule)) {
        throw new TypeError('DLUXView ' + this.name + ' :: The module is not a DLUX Module ' + module);
      }

      module.view &= ~this.flag;

      this.modules = _.reject(this.modules, function (m) {
        return m.id === module.id;
      });

    };

    return DLUXView;
  }());

  var DLUXMenuItem = (function () {
    /** @lends DLUX.MenuItem */

    /** @access private */
    var id = 0;

    /**
     * @constructs DLUX.MenuItem
     * @param {String} depth   depthness of the menu item
     * @param {String} title   title of the menu item
     * @param {String} href    link for the menu item
     * @param {String} icon    css class for font-awesome
     * @param {String} active  state string of the related DLUXModule
     * @param {Object} page    object represented menu item description
     * @param {String} page.title menu item title
     * @param {String} page.description menu item description
     * @param {Array} submenu children of this menu item
     */
    function DLUXMenuItem(depth, title, href, icon, active, page, submenu) {
      id = getNextId();

      /** @access public */
      this.depth = depth;

      /** @access public */
      this.href = href;

      /** @access public */
      this.active = active;

      /** @access public */
      this.title = title;

      /** @access public */
      this.icon = icon;

      /** @access public */
      this.page = page;

      /** @access public */
      this.linkedModule = null; // Need the module object because object/array are passed by ref and anything else by value

      /** @access public */
      this.submenu = submenu || []; // TODO: Change to use DLUXMenu and DLUXMenuItem

      /** @property {Number} id the Object Id */
      Object.defineProperty(this, 'id', {
        value: id
      });

    }

    /**
     * Look if the Menu item have child elements
     * @returns {Boolean} true if the menu item have children
     */
    DLUXMenuItem.prototype.asSubMenus = function () {
      return this.submenu.length > 0;
    };

    return DLUXMenuItem;
  }());

  var DLUXMenu = (function () {
    /** @lends DLUX.Menu */

    /** @access private */
    var id = getNextId(),
      /** @access private */
      menus = null;

    /**
     * DLUXMenu constructor
     * @constructs DLUX.Menu
     * @param {String} name The name of the module
     */
    function DLUXMenu(name) {
      /** @access public */
      this.name = name;
      menus = [];

      /** @property {Number} id the object id */
      Object.defineProperty(this, 'id', {
        value: id
      });

      /**
       * @property {Array} list of all his menu item
       * @see {@link DLUXMenuItem}
       */
      Object.defineProperty(this, 'items', {
        value: menus,
        writable: false,
        enumerable: true,
        configurable: true
      });
    }

    /**
     * Add a Menu item to the menu
     * @throws {TypeError} Will throw an error if the item is not a DLUXMenuItem
     * @param menuItem {DLUX.MenuItem} The menu item to add
     */
    DLUXMenu.prototype.addMenuItem = function (menuItem) {
      if (!(menuItem instanceof DLUXMenuItem)) {
        throw new TypeError('DLUXMenuItem ' + this.name + ' :: The item is not a DLUX Menu Item ' + menuItem);
      }
      menus.push(menuItem);
    };

    return DLUXMenu;
  }());

  /** @namespace DLUX */
  var DLUX = (function (DLUX) {
    /** @access private */
    var angularCtx = {},
      /** @access private */
      modules = [],
      /** @access private */
      views = [],
      /** @access private */
      dluxPattern = /bootstrap|template|^(ng)|restangular/i,
      /** @access private */
      internalPattern = /app\.core|common|^(config)/i;

    /**
     * @memberof DLUX
     * @param {String} name the module name
     * @returns {Boolean} return true if the module is a DLUXModule
     * @see {@link DLUX.Module}
     */
    DLUX.isDLUXModule = function (name) {
      return !dluxPattern.test(name);
    };

    /**
     * @memberof DLUX
     * @param   {String} name name of the module
     * @returns {Boolean} return true if the module is internal
     */
    DLUX.IsInternalModule = function (name) {
      return internalPattern.test(name);
    };

    /**
     * @memberof DLUX
     * @param   {String} name module name
     * @param   {Array} deps string array of his angularjs dependencies
     * @param   {Boolean} internal define if the module is internal or not
     * @returns {DLUX.Module} return the new DLUXModule created
     */
    DLUX.createModule = function (name, deps, internal) {
      var module = new DLUXModule(angularCtx.module(name, deps), internal);
      modules.push(module);
      return module;
    };

    /**
     * @memberof DLUX
     * @param   {String} name the view name
     * @returns {DLUX.View} return a new view with the given name or the coresponding existing view with the same name
     */
    DLUX.createView = function (name) {
      var flag = Math.pow(2, views.length),
        view = null;

      // check if view exist
      view = _.find(views, function (v) {
        return v.name === name;
      });

      // create the view if not existing
      if (!view) {
        view = new DLUXView(name, flag);
        name = name || 'view' + views.length + 1;
        views.push(view);
      }
      return view;
    };

    /**
     * @memberof DLUX
     * @param {DLUX.View} view the view to delete
     */
    DLUX.deleteView = function (view) {
      if (views.length < 2) {
        return;
      }

      views = _.reject(views, function (v) {
        return v.id === view.id;
      });
    };

    /**
     * @memberof DLUX
     * @param   {Object} angular angularjs context to extend
     * @returns {Object} return the modified angularjs context
     */
    DLUX.extendAngularContext = function (angular) {
      angularCtx = angular;
      return angular.extend({}, angular);
    };

    /**
     * @memberof DLUX
     * @returns {Array} an array of DLUXModule
     * @see {@link DLUX.Module}
     */
    DLUX.getDLUXModules = function () {
      return _.filter(modules, function (m) {
        return !m.internal;
      });
    };

    /**
     * @memberof DLUX
     * @returns {Array} an array of DLUXView
     * @see {@link DLUX.View}
     */
    DLUX.getViews = function () {
      return views;
    };

    /** @ignore */
    DLUX.Menu = DLUXMenu;

    /** @ignore */
    DLUX.MenuItem = DLUXMenuItem;

    /** @ignore */
    DLUX.Module = DLUXModule;

    /** @ignore */
    DLUX.View = DLUXView;

    return DLUX;
  }({}));

  return DLUX;
});
