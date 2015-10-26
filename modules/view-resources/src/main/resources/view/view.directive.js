define([], function () {
  'use strict';
  var PostRepeat = function () {
    return {
      restrict: 'A',
      scope: {
        postRepeat: '='
      },
      link: function (scope) {
        if (scope.$parent.$last) {
          scope.postRepeat();
        }
      }
    };
  };
  return {
    PostRepeat: PostRepeat
  };
});
