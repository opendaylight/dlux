angular.module('dlux.auth', [])

/*
Auth flow:
  1. On login do a api req with basic auth header towards the api
  2. on success set the cookie returned by the api
  3. delete the auth header
*/

.controller('LoginController', ['$scope', '$location', 'AuthService', 'NBApiStatSvc', function ($scope, $location, AuthService, NBApiStatSvc) {
  $scope.username = 'admin';
  $scope.password = 'admin';
  $scope.online = true;

  /*$scope.updateStatus = function () {
    NBApiStatSvc.check(function() {
      $scope.online = true;
    });
  };

  $scope.updateStatus()
  */

  $scope.login = function() {
    AuthService.login($scope.username, $scope.password, $scope.success, $scope.error);
  };

  $scope.success = function (response) {
    $location.path('/');
  };

  $scope.error = function (response) {
  };
}])

.controller('LogoutController', ['$scope', '$location', 'AuthService', function ($scope, $location, AuthService) {
  AuthService.logout(function() {
    $location.path('/login');
  });
}])


.factory('AuthService', ['$http', '$cookieStore', 'config', 'Base64', function ($http, $cookieStore, config, Base64) {
  var factory = {};

  // Is the user currently authed?
  factory.isAuthed = function () {
    var authed = factory.getUser() ? true : false;
    return authed;
  };

  // Return the current user object
  factory.getUser = function () {
    var user = $cookieStore.get('dlux.user') || null;
    return user;
  };

  factory.setUser = function (user) {
    $cookieStore.put('dlux.user', user);
  };

  factory.unsetUser = function() {
    $cookieStore.remove('dlux.user');
  };

  factory.login = function (user, pw, cb, eb) {
    factory.setBasic(user, pw);

    $http.get(config.endpoint + '/flowprogrammer/default')
      .success(function (data, status, headers, config) {
        factory.setUser({username: user});
        factory.unsetBasic();
        cb(data);
      })
      .error(function (resp) {
        eb(resp);
      });
  };

  factory.logout = function (cb) {
    factory.unsetBasic();
    factory.unsetUser();
    cb();
  };

  // Set Authorization header to username + password
  factory.setBasic = function (user, pw) {
    var string = user + ':' + pw;

    var auth = 'Basic ' + Base64.encode(string);
    $http.defaults.headers.common.Authorization = auth;
  };

  factory.unsetBasic = function () {
    if ($http.defaults.headers.common.Authorization !== null) {
      delete $http.defaults.headers.common.Authorization;
    }
  };

  return factory;
}])


.factory('Base64', function() {
  var keyStr = 'ABCDEFGHIJKLMNOP' +
    'QRSTUVWXYZabcdef' +
    'ghijklmnopqrstuv' +
    'wxyz0123456789+/' +
    '=';
  return {
    encode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }

          output = output +
              keyStr.charAt(enc1) +
              keyStr.charAt(enc2) +
              keyStr.charAt(enc3) +
              keyStr.charAt(enc4);
          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },
    decode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
      }

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };
});
