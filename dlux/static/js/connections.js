/*horizonApp.controller('OvsdbController', ['$scope', function($scope) {
    $scope.greeting = 'Hola!';
}]);*/

// Load UI Router
horizonApp.requires.push('ui.router');

horizonApp.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/db");

    $stateProvider.state('db', {
        url: '/db',
        resolve: {
            table_defs: function ($q, $http) {
                var d = $q.defer();
                $http.get('/network/connections/ovsdb/tables').success(function(data) {
                    d.resolve(data);
                })
                return d.promise;
            }
        },
        views: {
            'menu@': {
                templateUrl: '/static/partials/ovsdb/menu.html',
                controller: function ($scope, table_defs) {
                    $scope.table_defs = table_defs;
                }
            }
        }
    })

    $stateProvider.state('db.table', {
        url: '/{name}',
        resolve: {
            table_data: ['$stateParams', '$q', '$http', function ($stateParams, $q, $http) {
                var d = $q.defer();

                $http.get('ovsdb/' + $stateParams.name).success(function(data) {
                    d.resolve(data);
                })

                return d.promise;
            }]
        },
        views: {
            'content@': {
                templateUrl: '/static/partials/ovsdb/table.html',
                controller: function($scope, $state, $http, table_defs, table_data) {
                    $scope.table_defs = table_defs;
                    $scope.table_data = table_data;

                    $scope.checkType = function (data) {
                        if (typeof data === "string") {
                            return "string";
                        }
                        else if ($.isArray(data)) {
                            return "array";
                        }
                        else if (typeof data === "object") {
                            return "object";
                        }
                     };
                }
            }
        }
    });
/*
    $stateProvider.state('db.table.row', {
        url: '/{row',

    });
*/
});

// NOTE(ekarlso): Is there a better way to do this?
horizonApp.run(
    ['$rootScope', '$state', '$stateParams',
    function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
}]);