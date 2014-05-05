/* jshint ignore:start */
'use strict';


angular.module('common.auth', [])
.factory('Auth', function($http, $cookieStore, Base64){
        var factory = {};
        // Set Authorization header to username + password
        factory.setBasic = function(user, pw) {
            var string = user + ':' + pw;

            var auth = 'Basic ' + Base64.encode(string);
            $http.defaults.headers.common.Authorization = auth;
        };

        factory.unsetBasic = function() {
            if ($http.defaults.headers.common.Authorization !== null) {
              delete $http.defaults.headers.common.Authorization;
            }
        };

        factory.setUser = function(user) {
            $cookieStore.put('odl.user', user);
        };

        factory.unsetUser = function() {
            $cookieStore.remove('odl.user');
        };

        // Return the current user object
        factory.getUser = function() {
            var user = $cookieStore.get('odl.user') || null;
            return user;
        };


        factory.authorize = function(accessLevel, role) {
            if(role === undefined)
                role = currentUser.role;
            return accessLevel.bitMask & role.bitMask;
        };
        factory.isAuthed = function () {
            var authed = factory.getUser() ? true : false;
            return authed;
        };
        factory.isLoggedIn = function(user) {
            if(user === undefined)
                user = currentUser;
            return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
        };
        /*factory.register = function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                changeUser(res);
                success();
            }).error(error);
        };*/
        factory.login = function (user, pw, cb, eb) {
            factory.setBasic(user, pw);
            $http.get("http://127.0.0.1:8080/controller/nb/v2/flowprogrammer/default")
                .success(function (data, status, headers, config) {
                    factory.setUser({username: user});
                    cb(data);
                })
                .error(function (resp) {
                    eb(resp);
                });
        };
        factory.logout = function(success) {
            
                factory.unsetBasic();
                factory.unsetUser();
                success();
        };
        return factory;
})
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
/* jshint ignore:end */