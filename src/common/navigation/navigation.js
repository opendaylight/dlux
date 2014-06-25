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
                        "title": "Nodes",
                        "icon": "icon-sitemap",
                        "page": {
                            "title": "Nodes",
                            "description": "Nodes"
                        }
                    },
                    {
                        "link": "index.html#/connection_manager/index",
                        "active": "connection_manager",
                        "title": "Connection Manager",
                        "icon": "icon-bolt",
                        "page": {
                            "title": "Connection Manager",
                            "description": "Connection Manager"
                        }
                    },
                    {
                        "link": "index.html#/flow/index",
                        "active": "flow",
                        "title": "Flows",
                        "icon": "icon-level-down",
                        "page": {
                            "title": "Flows",
                            "description": "Flows"
                        }
                    },
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
                        "title": "Topology",
                        "active": "topology",
                        "icon": "icon-link",
                        "page": {
                            "title": "Topology",
                            "description": "Topology"
                        }
                    },
                    {
                        "link": "index.html#/network/staticroute",
                        "title": "Network",
                        "active": "network",
                        "icon": "icon-cloud",
                        "page": {
                            "title": "Network",
                            "description": "Network"
                        }
                    },
                    {
                        "link": "index.html#/container/index",
                        "title": "Container",
                        "active": "container",
                        "icon": "icon-sign-blank",
                        "page": {
                            "title": "Container",
                            "description": "Container"
                        }
                    }/*,
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
