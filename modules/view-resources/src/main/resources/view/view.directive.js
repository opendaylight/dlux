define([], function () {
  'use strict';
  var PostRepeat = function () {
    return function (scope) {
      if (scope.$last) {
        scope.dluxModuleLoaded();
      }
    };
  };
  PostRepeat.$inject = [];
  return {
    PostRepeat: PostRepeat
  };
});
