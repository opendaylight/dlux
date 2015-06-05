define(['common/authentification/auth.services'], function() {
  describe('Auth Module', function() {
    var _Auth;
    beforeEach(module('app.common.auth'));

    beforeEach(inject(function($injector) {
      _Auth = $injector.get('Auth');
    }));

    it('Should have defined function facilate the authentication process', function() {
      expect(_Auth.setBasic).toBeDefined();
      expect(_Auth.unsetBasic).toBeDefined();
      expect(_Auth.getUser).toBeDefined();
      expect(_Auth.authorize).toBeDefined();
      expect(_Auth.isAuthed).toBeDefined();
      expect(_Auth.isLoggedIn).toBeDefined();
      expect(_Auth.login).toBeDefined();
      expect(_Auth.logout).toBeDefined();
    });
  });
});
