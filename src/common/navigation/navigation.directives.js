define(['common/navigation/navigation.module'], function(nav) { 
  nav.register.directive('mcNavigation', function() {
    return {
      templateUrl: 'navigation/navigation.tpl.html',
      replace: true
    };
  });
});
