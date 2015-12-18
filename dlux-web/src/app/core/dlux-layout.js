define(['underscore', 'angular', 'DLUX'], function (_, angular, DLUX_CORE) {
  'use strict';

  /** @ignore */
  var $injector = angular.injector(['ng']),
    $q = $injector.get('$q');

  /** @ignore */
  var Components = (function() {
    function LayoutComponent() {
      this.container = [];
      this._defer = $q.defer();
    }

    LayoutComponent.prototype.getElements = function() {
      return this._defer.promise;
    };

    LayoutComponent.prototype.resolve = function() {
      var template = '';
      for(var i = 0; i < this.container.length; ++i) {
        template += this.container[i];
      }
      this._defer.resolve(template);
    };

    return LayoutComponent;
  })();

  /** @namespace DLUX.Layout */
  var DLUX_LAYOUT = (function (DLUX) {
    /** @access private */
    var Layout = {},
      /** @access private */
      topComponent = new Components(),
      /** @access private */
      navComponent = new Components(),
      /** @access private */
      contentComponent = new Components();

    /**
     * @memberof DLUX.Layout.Components
     * Listing all availabile layout componets
     */
    Layout.Components = {
      NAVIGATION_BAR: 1,
      TOP_BAR: 2,
      CONTENT: 3
    };

    /**
     * @memberof DLUX.Layout
     * Add a HTML string to the components list
     * @param {Number} layout components id
     * @param {String} html string to add
     * @see {@link DLUX.Layout.Components}
     */
    Layout.addTemplate = function(componentId, template) {
      switch(componentId) {
      case Layout.Components.NAVIGATION_BAR:
        navComponent.container.push(template);
        break;
      case Layout.Components.TOP_BAR:
        topComponent.container.push(template);
        break;
      case Layout.Components.CONTENT:
        contentComponent.container.push(template);
        break;
      default:
        throw Error('The components does not exits');
      }
    };

    /**
     * @memberof DLUX.Layout
     * Obtain the promise of the layout components
     * @param {Number} layout components id
     * @return {Promise} the promise waited to be resolved
     * @see {@link DLUX.Layout.Components}
     */
    Layout.getView = function(componentId) {
      switch(componentId) {
      case Layout.Components.NAVIGATION_BAR:
        return navComponent.getElements();
      case Layout.Components.TOP_BAR:
        return topComponent.getElements();
      case Layout.Components.CONTENT:
        return contentComponent.getElements();
      default:
        throw Error('The components does not exits');
      }
    };

    /**
     * @memberof DLUX.Layout
     * Resolve the components promise
     */
    Layout.resolveViews = function() {
      navComponent.resolve();
      topComponent.resolve();
      contentComponent.resolve();
    };

    /** @ignore */
    DLUX.Layout = Layout;

    return DLUX;

  })(DLUX_CORE);

  return DLUX_LAYOUT;
});
