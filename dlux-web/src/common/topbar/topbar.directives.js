define(['common/topbar/topbar.module'], function(topbar) {
   topbar.register.directive('mcTopBar', function () {
        return {
            replace: true,
            templateUrl: 'topbar/topbar.tpl.html',
        };
    });

    topbar.register.directive('mcTopBarTasks', function () {
        return {
            replace: true,
            controller: 'topBarTasksCtrl',
            templateUrl: 'topbar/tasks.tpl.html'
        };
    });

    topbar.register.directive('mcTopBarNotifications', function () {
        return {
            replace: true,
            controller: 'topBarNotifsCtrl',
            templateUrl: 'topbar/notifications.tpl.html'
        };
    });

    topbar.register.directive('mcTopBarMessages', function () {
        return {
            replace: true,
            controller: 'topBarMessagesCtrl',
            templateUrl: 'topbar/messages.tpl.html'
        };
    });

    topbar.register.directive('mcTopBarUserMenu', function () {
        return {
            replace: true,
            controller: 'topBarUserMenuCtrl',
            templateUrl: 'topbar/user_menu.tpl.html'
        };
    });
}); 
