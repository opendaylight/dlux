/*
 * Copyright (c) 2014 Inocybe Technologies, and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/core/core.module', 'jquery'], function(core, $) {

    var BaseCoreHelper = (function() {

    function BaseCoreHelper() {
      this.ids = [];
      this.ctrls = [];
    }

    BaseCoreHelper.prototype.addToView = function(url) {
      setIds = function(data) {
        this.ids.push(data);
      };

      $.ajax({
        url : url,
        context: this,
        method: 'GET',
        async : false
      }).done(setIds);
    };

    BaseCoreHelper.prototype.getViews = function() {
      var template = "";

      for(var i = 0; i < this.ids.length; ++i) {
        template += this.ids[i];
      }

      return template;
    };

    BaseCoreHelper.prototype.addControllerUrl = function(url) {
      this.ctrls.push(url);
    };

    BaseCoreHelper.prototype.getControllers = function() {
      return this.ctrls;
    };

    return BaseCoreHelper;

  })();

  core.provider('TopBarHelper', function() {

    var TopBarHelperProvider = (function() {

      function TopBarHelperProvider() {
      }

      TopBarHelperProvider.prototype = new BaseCoreHelper();
      TopBarHelperProvider.prototype.constructor = TopBarHelperProvider;

      TopBarHelperProvider.prototype.$get = function() {
        return new TopBarHelperProvider();
      };

      return TopBarHelperProvider;

    })();

    return new TopBarHelperProvider();
  });

  core.provider('NavHelper', function() {
    var menu = [];

    var NavHelperProvider = (function() {

      function NavHelperProvider() {

      }

      NavHelperProvider.prototype = new BaseCoreHelper();

       getMenuWithId = function(menuSection, level) {
        if(menuSection === undefined) {
          return null;
        }
        var currentLevel = level[0];

        var menuItem = $.grep(menuSection, function(item) {
          return item.id == currentLevel;
        })[0];

        if (!menuItem) {
          return menuItem;
        }

        if (level.length === 1) {
          return menuItem;
        } else {
          return getMenuWithId(menuItem.submenu, level.slice(1));
        }
      };

      NavHelperProvider.prototype.addToMenu = function(id, obj) {
        var lvl = id.split(".");
        obj["id"] = lvl.pop();

        if (lvl.length === 0) {
          menu.push(obj);
        } else {
          var menuItem = getMenuWithId(menu, lvl);

        if(menuItem !== undefined) {
          if(!menuItem.submenu) {
            menuItem.submenu = [];
          }
          menuItem.submenu.push(obj);
        } else {
           var submenu = {
              "id" : lvl[0],
              "title" : lvl[0],
              "active" : "",
              "submenu" : [obj]
            };
            menu.push(submenu);
          }
        }
      };

      NavHelperProvider.prototype.getMenu = function() {
        return menu;
      };

      NavHelperProvider.prototype.$get =  function NavHelperFactory() {
        return new NavHelperProvider();
      };

      return NavHelperProvider;
    })();

    var persistentProvider = new NavHelperProvider();

    return persistentProvider;

   });

  core.provider('ContentHelper', function() {

    var ContentHelperProvider = (function() {

      function ContentHelperProvider() {

      }

      ContentHelperProvider.prototype = new BaseCoreHelper();

      ContentHelperProvider.prototype.$get = function() {
        return new ContentHelperProvider();
      };

    return ContentHelperProvider;

   })();

   return new ContentHelperProvider();

  });
});
