angular.module('common.topbar', ['ngCookies', 'common.auth', 'common.navigation'])
    .factory('taskFactory',function () {
        var factory = {};
        factory.getTaskData = function () {
            return {
                count: 4,
                latest: [
                    {
                        title: "Software Update",
                        percentage: 65
                    },  
                    {
                        title: "Hardware Upgrade" ,
                        percentage: 35 ,
                        progressBarClass: "progress-bar-danger"
                    },
                    {
                        title: "Unit Testing" ,
                        percentage: 15  ,
                        progressBarClass: "progress-bar-warning"
                    },
                    {
                        title: "Bug Fixes" ,
                        percentage: 90 ,
                        progressClass: "progress-striped active",
                        progressBarClass: "progress-bar-success"
                    }
                ]
            };

        };
        return factory;
    }).factory('messageFactory', function () {
        var factory = {};
        factory.getMessageData = function () {
            return {
                count: 5,
                latest: [
                    {
                        name: "Alex",
                        img: "avatar.png",
                        time: "a moment ago",
                        summary: "Ciao sociis natoque penatibus et auctor ..."
                    },
                    {
                        name: "Susan",
                        img: "avatar3.png",
                        time: "20 minutes ago",
                        summary: "Vestibulum id ligula porta felis euismod ..."
                    },
                    {
                        name: "Bob",
                        img: "avatar4.png",
                        time: "3:15 pm",
                        summary: "Nullam quis risus eget urna mollis ornare ..."
                    }
                ]
            };
        };
        return factory;
    })
    .factory('notifsFactory', function () {
        var factory = {};
        factory.getNotifsData = function () {
            return {
                "count": 8,
                "latest": [
                    {
                        title: "New Comments",
                        icon: "icon-comment",
                        iconClass: "btn-pink",
                        badge: "+12",
                        badgeClass: "badge-info"
                    },
                    {
                        title: "Bob just signed up as an editor ...",
                        icon: "icon-user",
                        iconClass: "btn-primary"
                    },
                    {
                        title: "New Orders",
                        icon: "icon-shopping-cart",
                        iconClass: "btn-success",
                        badge: "+8",
                        badgeClass: "badge-success"
                    },
                    {
                        title: "Followers",
                        icon: "icon-twitter",
                        iconClass: "btn-info",
                        badge: "+11",
                        badgeClass: "badge-info"
                    }
                ]
            };

        };
        return factory;
    })
    .directive('mcTopBar', function () {
        return {
            replace: true,
            templateUrl: 'topbar/topbar.tpl.html',
        };
    })
    .directive('mcTopBarTasks', function () {
        return {
            replace: true,
            controller: 'topBarTasksCtrl',
            templateUrl: 'topbar/tasks.tpl.html'
        };
    })
    .directive('mcTopBarNotifications', function () {
        return {
            replace: true,
            controller: 'topBarNotifsCtrl',
            templateUrl: 'topbar/notifications.tpl.html'
        };
    })
    .directive('mcTopBarMessages', function () {
        return {
            replace: true,
            controller: 'topBarMessagesCtrl',
            templateUrl: 'topbar/messages.tpl.html'
        };
    })
    .directive('mcTopBarUserMenu', function () {
        return {
            replace: true,
            controller: 'topBarUserMenuCtrl',
            templateUrl: 'topbar/user_menu.tpl.html'
        };
    })
    .controller('topBarTasksCtrl',function ($scope, taskFactory) {
        $scope.tasks = taskFactory.getTaskData();
    }).controller('topBarNotifsCtrl',function ($scope, notifsFactory) {
        $scope.notifs = notifsFactory.getNotifsData();
        $scope.isValid = function (value) {
            if (angular.isUndefined(value) || value === null) {
                return false;
            }
            else {
                return true;
            }
        };
    }).controller('topBarMessagesCtrl',function ($scope, messageFactory) {
        $scope.messages = messageFactory.getMessageData();
        $scope.isValid = function (value) {
            if (angular.isUndefined(value) || value === null) {
                return false;
            }
            else {
                return true;
            }
        };
    }).controller('topBarUserMenuCtrl', function ($scope, $cookieStore, Auth, $window) {
        $scope.logOut = function () {
            Auth.logout(
            function(res) {
                $window.location.href = 'login.html'; 
            });

        };
    });