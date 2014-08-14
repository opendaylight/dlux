angular.module('common.navigation', ['ngCookies'])

    .directive('mcNavigation', function () {
        return {
            templateUrl: 'navigation/navigation.tpl.html',
            replace: true
        };
    })


    .factory('navigationFactory', function ($cookieStore) {
        var factory = {};
        factory.getNavigationData = function (mobile) { // used for mock only

            /* this part need to be different for each usesr ( if the user cannot access razor page,
             we shouldn't let him access that page).      */
            var navItem = [
                    
                    {
                        "link": "index.html#/node/index",
                        "active": "node",
                        "title": "NODES",
                        "icon": "icon-sitemap",
                        "page": {
                            "title": "NODES",
                            "description": "NODES"
                        }
                    },
                    // {
                    //     "link": "index.html#/connection_manager/index",
                    //     "active": "connection_manager",
                    //     "title": "CONNECTION_MANAGER",
                    //     "icon": "icon-bolt",
                    //     "page": {
                    //         "title": "CONNECTION_MANAGER",
                    //         "description": "CONNECTION_MANAGER"
                    //     }
                    // },
                    // {
                    //     "link": "index.html#/flow/index",
                    //     "active": "flow",
                    //     "title": "FLOWS",
                    //     "icon": "icon-level-down",
                    //     "page": {
                    //         "title": "FLOWS",
                    //         "description": "FLOWS"
                    //     }
                    // },
                    {
                        "link": "index.html#/yangui/index",
                        "active": "yangui",
                        "title": "Yang UI",
                        "icon": "icon-level-down",
                        "page": {
                            "title": "Yang UI",
                            "description": "Yang UI"
                        }
                    },
                    {
                        "link": "index.html#/topology",
                        "title": "TOPOLOGY",
                        "active": "topology",
                        "icon": "icon-link",
                        "page": {
                            "title": "TOPOLOGY",
                            "description": "TOPOLOGY"
                        }
                    },
                    // {
                    //     "link": "index.html#/network/staticroute",
                    //     "title": "NETWORK",
                    //     "active": "network",
                    //     "icon": "icon-cloud",
                    //     "page": {
                    //         "title": "NETWORK",
                    //         "description": "NETWORK"
                    //     }
                    // },
                    // {
                    //     "link": "index.html#/container/index",
                    //     "title": "CONTAINER",
                    //     "active": "container",
                    //     "icon": "icon-sign-blank",
                    //     "page": {
                    //         "title": "CONTAINER",
                    //         "description": "CONTAINER"
                    //     }
                    // }
                    /*,
                    {
                        "link": "index.html#/user/index",
                        "title": "User",
                        "active": "user",
                        "icon": "icon-user",
                        "page": {
                            "title": "User",
                            "description": "User Management"
                        }
                    }*/
                ];
             if (mobile) { //temporary, we have an issue with topology preview
                navItem.splice(3,1);   
             }
            
            return navItem;

        };
        return factory;
    })
    .controller('navItemCtrl', function ($scope, $location, $window) {

        $scope.display = 'none';
        $scope.isOpen = false;

        $scope.isValid = function (value) {
            if (angular.isUndefined(value) || value === null) {
                return false;
            }
            else {
                return true;
            }
        };

        $scope.updateTemplate = function (e, item) {

            e.stopPropagation();
            e.preventDefault();


            $scope.isOpen = !$scope.isOpen;
            if ($scope.display == 'none') {
                $scope.display = 'block';
            }
            else {
                $scope.display = 'none';
            }


        };
    });
