define(['common/login/login.controller'], function() {
  describe('Login Module', function() {
    var scope, state, controller, AuthMock;

    beforeEach(module('ui.router'));
    beforeEach(module('app.common.login', function($provide) {
      AuthMock = jasmine.createSpyObj('AuthMock', ['isAuthed']);
      $provide.value('Auth', AuthMock);
    }));

    beforeEach(inject( function($rootScope, $controller, $state) {
      scope = $rootScope.$new();
      controller = $controller;
      state = $state;
    }));

    it('Should load the login state', function() {
      var stateName = 'login';

      controller('LoginCtrl', {$scope: scope, $state: state});
      expect(state.href(stateName, {})).toBe('#/login');
    });
  });
});
