define(['app/sfc/sfc.global', 'common/layout/layout.module', 'angular-ui-router', 'app/core/core.module', 'common/navigation/navigation.module'], function (sfc) {

  ddescribe('SFC app', function () {
    var rootScope, scope, state, stateParams;
    var serviceFunctionSvcMock, serviceForwarderSvcMock;
    var modalDeleteSvcMock;
    var exampleData = {};

    serviceFunctionSvcMock = {
      getArray: function (callback) {
        return callback(exampleData.sfs);
      },
      deleteItem: function (sfName, callback) {
        exampleData.sfs.splice(0, 1);
        return callback();
      },
      putItem: function (sfName, callback) {
        return callback();
      }
    };
    serviceForwarderSvcMock = {
      getArray: function (callback) {
        callback(exampleData.sffs);
      }
    };
    modalDeleteSvcMock = {
      open: function (snName, callback) {
        return callback('delete');
      }
    };

    beforeEach(function () {
      exampleData.sfs = [
        {"name": "sf1", "type": "firewall", "ip": "10.0.0.1"}
      ];
      exampleData.sffs = [
        {"name": "sff1", "service-node": "sn1"}
      ];
    });

    beforeEach(angular.mock.module('ui.router'));
    beforeEach(angular.mock.module('pascalprecht.translate'));
    beforeEach(angular.mock.module('app.common.layout'));
    beforeEach(angular.mock.module('app.sfc'));

    beforeEach(angular.mock.inject(function ($controller, $q, $state, $stateParams, $rootScope, $templateCache) {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      state = $state;
      stateParams = $stateParams;
//      $templateCache.put('src/common/layout/index.tpl.html', '');
//      $templateCache.put('src/app/sfc/root.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicenode/servicenode.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicenode/servicenode.create.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicenode/servicenode.edit.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicefunction/servicefunction.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicefunction/servicefunction.create.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicechain/servicechain.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicechain/servicechain.create.tpl.html', '');
//      $templateCache.put('src/app/sfc/servicepath/servicepath.tpl.html', '');
    }));

    beforeEach(angular.mock.inject(function ($controller) {
      return $controller('rootSfcCtrl', {$scope: scope});
    }));

    describe('servicechain.controller', function () {

      describe("serviceFunctionCtrl", function () {
        var createServiceFunctionCtrl;

        beforeEach(angular.mock.inject(function ($controller) {
          createServiceFunctionCtrl = function () {
            return $controller('serviceFunctionCtrl', {$scope: scope, ServiceFunctionSvc: serviceFunctionSvcMock, ModalDeleteSvc: modalDeleteSvcMock});
          };
        }));

        it("should call get Service Functions", function () {
          spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
          createServiceFunctionCtrl();
          expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
          expect(scope.sfs).toEqual(exampleData.sfs);
        });

        it("should open modal dialog and delete service function", function () {
          spyOn(modalDeleteSvcMock, 'open').andCallThrough();
          spyOn(serviceFunctionSvcMock, 'deleteItem').andCallThrough();
          createServiceFunctionCtrl();
          scope.deleteSF(exampleData.sfs[0].name, 0);
          expect(modalDeleteSvcMock.open).toHaveBeenCalledWith("sf1", jasmine.any(Function));
          expect(serviceFunctionSvcMock.deleteItem).toHaveBeenCalledWith({name: "sf1"}, jasmine.any(Function));
          expect(scope.sfs).toEqual([]);
        });
      });

      describe("serviceFunctionCreateCtrl", function () {
        var createServiceFunctionCreateCtrl;

        beforeEach(function () {
          rootScope.translateLoadingEnd = true;
        });

        beforeEach(angular.mock.inject(function ($controller) {
          createServiceFunctionCreateCtrl = function () {
            return $controller('serviceFunctionCreateCtrl', {$scope: scope, $state: state, ServiceFunctionSvc: serviceFunctionSvcMock, ServiceForwarderSvc: serviceForwarderSvcMock});
          };
        }));

        it("ensure that scope.data variable is properly initialized", function () {
          createServiceFunctionCreateCtrl();
          expect(scope.data).toEqual({"sf-data-plane-locator": {}});
        });

        it("should PUT Service function data to controller and transition to sfc.servicefunction", function () {
          spyOn(serviceFunctionSvcMock, 'putItem').andCallThrough();
          createServiceFunctionCreateCtrl();
          scope.data = exampleData.sfs[0];
          scope.submit();
          expect(serviceFunctionSvcMock.putItem).toHaveBeenCalledWith(scope.data, jasmine.any(Function));
//          rootScope.$digest();
//          expect(state.current.name).toBe('sfc.servicefunction');
        });
      });
    });
  });
});
