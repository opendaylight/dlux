define(['common/layout/layout.module'], function(layout) {
  layout.register.factory('TopBarHelper', function($templateCache) {
    var factory = {};
    var ids = [];

    factory.addToView = function(name, url) {
      ids.push(name);
        $.ajax({
          url : url,
          method: 'GET',
          async : false
        }).done(function(data) {
          $templateCache.put(name, data);
        });
    };

    factory.getViews = function() {
      var template = "";
      
      for(var i = 0; i < ids.length; ++i) {
        template += $templateCache.get(ids[i]);
      }

      return template;

    };

    return factory;
  });
});
