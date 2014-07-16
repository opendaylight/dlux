angular.module('common.login', [
    'ngCookies',
    'common.auth',
    'templates-app',
    'templates-common',
    'ui.state',
    'ui.route',
    'common.auth'])

    .controller('loginCtrl', function ($cookieStore, $scope, $http, $window, Auth, $location) {
        // default values
        $scope.login = {};
        $scope.login.username = "";
        $scope.login.password = "";
        $scope.login.remember = false;
        $scope.rememberme = true;

        $scope.sendLogin = function () {
            Auth.login($scope.login.username, $scope.login.password, $scope.success, $scope.error);
        };
        
        
        $scope.success = function(response) {
            $window.location.href = 'index.html'; 
        };
        $scope.error = function (error) {
           $scope.error = "Unable to login";

        };
    })

    .controller('forgotPasswordCtrl', function ($scope, $http) {
        $scope.recover = {};
        $scope.recover.email = "";
        $scope.sendForgotPassword = function () {
            $http.post('/recover', $scope.recover).success(function (data) {
                if (data.recover) {
                    console.log("email sent");
                }
                else {
                    console.log("email not sent");
                }
            });

        };
    })

    .directive('mcRegister', function () {
        return {
            templateUrl: 'login/register.tpl.html',
            controller: 'registerCtrl',
            restrict: 'A'
        };
    })

    .directive('mcLogin', function () {
        return {
            templateUrl: 'login/login.tpl.html',
            restrict: 'A',
            controller: 'loginCtrl',
            link: function (scope, element, attrs) {

            }
        };
    })

    .directive('mcForgotPassword', function () {
        return {
            templateUrl: 'login/forgot_password.tpl.html',
            controller: 'forgotPasswordCtrl',
            restrict: 'A',
            link: function (scope, element, attrs) {

            }
        };
    })
    .controller('registerCtrl', function ($scope, $http) {
        $scope.register = {};
        $scope.register.email = "";
        $scope.register.username = "";
        $scope.register.password = "";
        $scope.register.repeatPassword = "";
        $scope.register.userAgreement = false;

        $scope.sendRegister = function () {
            $http.post('/register', $scope.register).success(function (data) {
                if (data.register) {
                    console.log("registration is successful");
                }
                else {
                    console.log("registration failed");
                }
            });
        };
    });


