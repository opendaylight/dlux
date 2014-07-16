angular.module('common.breadcrumb', [])
    .directive('mcBreadcrumb', function () {
        return {
            replaced: true,
            templateUrl: 'breadcrumb/breadcrumb.tpl.html'
        };
    });