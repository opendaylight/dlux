define(['common/topbar/topbar.module'], function(topbar) {

    topbar.register.controller('topBarTasksCtrl',function ($scope, taskFactory) {
        $scope.tasks = taskFactory.getTaskData();
    });
    
    topbar.register.controller('topBarNotifsCtrl',function ($scope, notifsFactory) {
        $scope.notifs = notifsFactory.getNotifsData();
        $scope.isValid = function (value) {
            if (angular.isUndefined(value) || value === null) {
                return false;
            }
            else {
                return true;
            }
        };
    });
    
    topbar.register.controller('topBarMessagesCtrl',function ($scope, messageFactory) {
        $scope.messages = messageFactory.getMessageData();
        $scope.isValid = function (value) {
            if (angular.isUndefined(value) || value === null) {
                return false;
            }
            else {
                return true;
            }
        };
    });
    
    topbar.register.controller('topBarUserMenuCtrl', function ($scope, $cookieStore, Auth, $window) {
        $scope.logOut = function () {
            Auth.logout(
            function(res) {
                $window.location.href = 'login.html'; 
            });

        };
    });
});
