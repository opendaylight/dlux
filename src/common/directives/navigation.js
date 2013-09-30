angular.module('dlux.directives.navigation', [])

/*
 * Helper to set CSS class to active via ng-class using $location.path()
 * or $state.includes()
*/
.directive('isActive', function($compile) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      state: '@',
      stateParams: '=',
      stateActive: '@',
      url: '@'
    },

    controller: function ($scope, $location, $state) {
      $scope.$state = $state;
      $scope.$location = $location;
    },
    compile: function() {
      return function (scope, iElement, iAttrs, controller) {
        var active;
        if (scope.state) {
          var state = scope.stateActive || scope.$state.current.name.split('.')[0];
          active = 'active: $state.includes(\'' + scope.state + '\')';
        } else if (scope.url) {
          active = 'active: url === $location.path()';
        } else {
          active = "false";
        }
        iElement.attr('ng-class', '{ ' + active  + ' }'); // Adding the ngClass
        iElement.removeAttr('is-active'); // Avoid infinite loop
        $compile(iElement)(scope);
      };
    }
  };
})


.directive('brdAnchor', function ($compile, $rootScope) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      label: '@',
      state: '@',
      stateParams: '=',
      url: '@'
    },

    /* The idea is to support both state and url, to be able to set {active} either
     if stateActive matches via $state.includes() or if the url matches
     Change this into a actual href later on ? - see https://github.com/angular-ui/ui-router/issues/395
    */
    template: '<a href="" ng-click="doClick()">{{label}}</a>',
    controller: function ($scope, $rootScope, $location, $state) {
      $scope.$location = $location;
      $scope.$state = $state;

      $scope.doClick = function () {
        var args = {
          label: $scope.label,
          state: $scope.state,
          stateParams: $scope.stateParams,
          url: $scope.url
        };

        $rootScope.$broadcast('event:navigation', args);

        if (!$scope.url && $scope.state) {
          var params = $scope.stateParams || {};
          $state.go($scope.state, params);
        } else if ($scope.url) {
          $location.path($scope.url);
        }
      };
    }
  };
})


.directive('buttonCancel', function() {
    // Runs during compile
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'btnLabel': '@label',
            'btnSize': '@size',
            'btnGlyph': '@glyph',
            'cancelFunc': '=function',
            'state': '@',
            'stateParams': '=',
        },
        template: '<button class="btn btn-{{size}} btn-danger" ng-click="doCancel()"><span class="glyphicon glyphicon-{{glyph}}"></span> {{label}}</button>',
        controller: function ($scope, $state) {
          $scope.label = $scope.btnLabel || 'Cancel';
          $scope.size = $scope.btnSize || 'md';
          $scope.glyph = $scope.btnGlyph || 'remove-circle';

          $scope.doCancel = function () {
            if (angular.isFunction($scope.cancelFunc)) {
              $scope.cancelFunc();
              return;
            }

            var params = $scope.stateParams || {};
            $state.go($scope.state, params);
          };
        }
    };
})

.directive('buttonSubmit', function(){
  // Runs during compile
  return {
    restrict: 'E',
    replace: true,
    scope: {
      'btnLabel': '@label',
      'btnSize': '@size',
      'btnGlyph': '@glyph',
      'submitFunc': '=function',
      'form': '=form',
      'validator': '='
    },
    template: '<button class="btn btn-{{size}} btn-success" ng-click="doSubmit()" ng-disabled="submitDisabled"><span class="glyphicon glyphicon-{{glyph}}"></span> {{label}}</button>',
    controller: function ($scope) {
      $scope.label = $scope.btnLabel || 'Submit';
      $scope.size = $scope.btnSize || 'md';
      $scope.glyph = $scope.btnGlyph || 'ok-circle';

      $scope.submitDisabled = true;

      $scope.doSubmit = function () {
        if ($scope.submitFunc) {
          $scope.submitFunc();
        }
      };

      $scope.toggle = function (newVal) {
        $scope.submitDisabled = newVal ? false : true;
      };


      // Setup a watch for form.$valid if it's passed
      if (!$scope.validator && $scope.form) {
        $scope.$watch('form.$valid', function (newVal, oldVal) {
          $scope.toggle(newVal);
        });
      }

      // This overrules the form watch if set - use with cauthion!
      if ($scope.validator && angular.isFunction($scope.validator)) {
        $scope.$watch(
          function() {
            return $scope.validator();
          },
          function(newVal, oldVal) {
            $scope.toggle(newVal);
          }
        );
      }

      // Lastly if none of the above goes we'll just enable ourselves
      if (!$scope.form && !$scope.validator) {
        $scope.submitDisabled = false;
      }
    }
  };
});
