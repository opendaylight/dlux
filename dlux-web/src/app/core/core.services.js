define(['app/core/core.module', 'DLUXLAYOUT', 'jquery'], function (core, DLUX, $) {
  'use strict';
  core.provider('TopBarHelper', function TopBarHelperProvider() {
    var ctrls = [],
      componentId = DLUX.Layout.Components.TOP_BAR;

    this.addToView = function(url) {
      $.ajax({
        url: url,
        method: 'GET',
        async: false
      }).done(function(data) {
        DLUX.Layout.addTemplate(componentId, data);
      });
    };

    this.getViews = function() {
      return DLUX.Layout.getView(componentId);
    };

    this.addControllerUrl = function(url) {
      ctrls.push(url);
    };

    this.getControllers = function() {
      return ctrls;
    };

    this.$get = ['apiToken', function TopBarHelper(apiToken) {
      return new TopBarHelperProvider(apiToken);
    }];

  });

  core.provider('NavHelper', function() {
    var ctrls = [],
      componentId = DLUX.Layout.Components.NAVIGATION_BAR,
      menu = new DLUX.Menu('Navigation Menu');

    function NavHelperProvider() {
      this.addToView = function(url) {
        $.ajax({
          url: url,
          method: 'GET',
          async: false
        }).done(function(data) {
          DLUX.Layout.addTemplate(componentId, data);
        });
      };

      this.getViews = function() {
        return DLUX.Layout.getView(componentId);
      };

      this.addControllerUrl = function(url) {
        ctrls.push(url);
      };

      this.getControllers = function() {
        return ctrls;
      };

      var getMenuWithId = function(dluxMenu, level) {
        if(dluxMenu === undefined) {
          return null;
        }
        var currentLevel = level[0];

        var menuItem = $.grep(dluxMenu, function(item) {
          return item.depth === currentLevel;
        })[0];

        if (level.length === 1) {
          return menuItem;
        } else {
          return getMenuWithId(menuItem.submenu, level.slice(1));
        }
      };

      var createDLUXMenuItem = function (obj) {
        if (obj) {
          return new DLUX.MenuItem(obj.depth, obj.title, obj.link, obj.icon, obj.active, obj.page);
        } else {
          return null;
        }
      };

      var setMenuItems = function (depth, obj) {
        var lvl = depth.split("."),
          menuItem = null;
        obj["depth"] = lvl.pop();
        if (!(obj instanceof DLUX.MenuItem)) {
          obj = createDLUXMenuItem(obj);
        }
        if (lvl.length === 0) {
          menuItem = obj;
          menu.addMenuItem(menuItem);
        } else {
          menuItem = getMenuWithId(menu.items, lvl);

          if (menuItem) {
            menuItem.submenu.push(obj);
          } else {
            menuItem = new DLUX.MenuItem(
              lvl[0],
              lvl[0],
              '',
              '',
              '', {}, [obj]
            );
            menu.addMenuItem(menuItem);
          }
        }
        return menuItem;
      };

      // TODO: Multiple lvl support for module linking
      this.addToMenu = function (depth, obj, module) {
        var menuItem = setMenuItems(depth, obj);
        if (module) {
          menuItem.linkedModule = module;
        }
      };

      this.getMenu = function () {
        return menu.items;
      };

      this.$get =  function () {
        return new NavHelperProvider();
      };
    }
    var persistentProvider = new NavHelperProvider();

    return persistentProvider;

  });

  core.provider('ContentHelper', function() {
    var ctrls = [],
      componentId = DLUX.Layout.Components.CONTENT;

    function ContentHelperProvider() {
      this.addToView = function(url) {
        $.ajax({
          url: url,
          method: 'GET',
          async: false
        }).done(function(data) {
          DLUX.Layout.addTemplate(componentId, data);
        });
      };

      this.getViews = function() {
        return DLUX.Layout.getView(componentId);
      };

      this.addControllerUrl = function(url) {
        ctrls.push(url);
      };

      this.getControllers = function() {
        return ctrls;
      };

      this.$get =  function ContentHelperFactory() {
        return new ContentHelperProvider();
      };
    }
    var persistentProvider = new ContentHelperProvider();

    return persistentProvider;
  });
});
