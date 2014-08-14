define(['app/sfc/sfc.global', 'common/layout/layout.module', 'angular-ui-router', 'app/core/core.module', 'common/navigation/navigation.module'], function (sfc) {

  ddescribe('SFC app', function () {
    var rootScope, scope, state, stateParams;
    var serviceFunctionSvcMock, servicePathSvcMock, modalDeleteSvcMock;
    var exampleData = {};
    var sfpState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};

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
    servicePathSvcMock = {
      getArray: function (callback) {
        callback(exampleData.sfps);
      },
      deleteItem: function (sfpName, callback) {
        exampleData.sfps.splice(0, 1);
        return callback();
      },
      putItem: function (sfpName, callback) {
        return callback();
      },
      getItem: function (sfpName, callback) {
        return callback(exampleData.sfps[0]);
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
      exampleData.sfps = [
        {"name": "sfp1", "sfp-service-function": [
          {"name": "sf1"}
        ]}
      ];
      exampleData.sfpsPreLoad = [
        {"name": "sfpToBeDeleted", "sfp-service-function": [
          {"name": "sf1"}
        ]},
        {"name": "sfp2", "state": "edited", "sfp-service-function": [
          {"name": "sf2"}
        ]}
      ];
      exampleData.sfpsWithTemporary = [
        {"name": "sfp2", "state": "edited", "sfp-service-function": [
          {"name": "sf2"}
        ]},
        {"name": "sfp1", "state": "persisted", "sfp-service-function": [
          {"name": "sf1"}
        ]}
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

    describe('servicepath.controller', function () {

      describe("servicePathCtrl", function () {
        var createServicePathCtrl;

        beforeEach(angular.mock.inject(function ($controller) {
          createServicePathCtrl = function () {
            return $controller('servicePathCtrl', {$scope: scope, $rootScope: rootScope, ServiceFunctionSvc: serviceFunctionSvcMock, ServicePathSvc: servicePathSvcMock,
              ModalDeleteSvc: modalDeleteSvcMock});
          };
        }));

        it("ensure that (root)scope.sfpEffectMe object is initialized", function () {
          createServicePathCtrl();
          expect(rootScope.sfpEffectMe).toBeDefined();
          expect(scope.sfpEffectMe).toBeDefined();
        });

        it("ensure that (root)scope.sfps variable is initialized", function () {
          createServicePathCtrl();
          expect(rootScope.sfps).toBeDefined();
          expect(scope.sfps).toBeDefined();
        });

        it("ensure that scope.sortableOptions variable is initialized", function () {
          createServicePathCtrl();
          expect(scope.sortableOptions).toBeDefined();
        });

        it("should call get Service Functions", function () {
          spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
          createServicePathCtrl();
          expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
          expect(scope.sfs).toEqual(exampleData.sfs);
        });

        it("should call get Service Paths, keep temporary and remove persisted data", function () {
          spyOn(servicePathSvcMock, 'getArray').andCallThrough();
          rootScope.sfps = exampleData.sfpsPreLoad;
          expect(scope.sfps).toEqual(exampleData.sfpsPreLoad);
          createServicePathCtrl();
          expect(servicePathSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
          expect(rootScope.sfps).toEqual(exampleData.sfpsWithTemporary);
          expect(scope.sfps).toEqual(exampleData.sfpsWithTemporary);
        });

        it("should return current state of SFP", function () {
          createServicePathCtrl();
          expect(scope.getSFPstate(exampleData.sfps[0])).toBe(sfpState.PERSISTED);
          exampleData.sfps[0].state = sfpState.EDITED;
          expect(scope.getSFPstate(exampleData.sfps[0])).toBe(sfpState.EDITED);
        });

        it("should set SFP to proper state", function () {
          createServicePathCtrl();
          scope.setSFPstate(exampleData.sfps[0], sfpState.EDITED);
          expect(exampleData.sfps[0].state).toBe(sfpState.EDITED);
          scope.setSFPstate(exampleData.sfps[0], sfpState.NEW);
          expect(exampleData.sfps[0].state).toBe(sfpState.NEW);
          scope.setSFPstate(exampleData.sfps[0], sfpState.PERSISTED);
          expect(exampleData.sfps[0].state).toBe(sfpState.NEW);
        });

        it("should check if SFP is in given state", function () {
          createServicePathCtrl();
          //should return persisted even if there is not state set
          expect(scope.isSFPstate(exampleData.sfps[0], sfpState.PERSISTED)).toBeTruthy();
          expect(scope.isSFPstate(exampleData.sfps[0], sfpState.EDITED)).toBeFalsy();
          expect(scope.isSFPstate(exampleData.sfps[0], sfpState.NEW)).toBeFalsy();
          exampleData.sfps[0].state = sfpState.PERSISTED;
          expect(scope.isSFPstate(exampleData.sfps[0], sfpState.PERSISTED)).toBeTruthy();
          exampleData.sfps[0].state = sfpState.EDITED;
          expect(scope.isSFPstate(exampleData.sfps[0], sfpState.EDITED)).toBeTruthy();
          exampleData.sfps[0].state = sfpState.NEW;
          expect(scope.isSFPstate(exampleData.sfps[0], sfpState.NEW)).toBeTruthy();
        });

        it("should unset SFP state", function () {
          createServicePathCtrl();
          exampleData.sfps[0].state = sfpState.NEW;
          scope.unsetSFPstate(exampleData.sfps[0]);
          expect(exampleData.sfps[0].state).toBeUndefined();
        });

        it("should add SF into SFP['sfp-service-function']", function () {
          createServicePathCtrl();
          var emptySfp = {"name": "test SFP"};
          scope.onSFPdrop(exampleData.sfs[0].name, emptySfp);
          expect(emptySfp['sfp-service-function']).toBeDefined();
          expect(emptySfp['sfp-service-function'][0]).toEqual({"name": exampleData.sfs[0].name});
          expect(emptySfp.state).toBe(sfpState.EDITED);
        });

        it("should open modal dialog and delete SFP from controller and scope", function () {
          spyOn(servicePathSvcMock, 'deleteItem').andCallThrough();
          spyOn(modalDeleteSvcMock, 'open').andCallThrough();
          createServicePathCtrl();
          rootScope.sfps = exampleData.sfps;
          expect(scope.sfps).toEqual(exampleData.sfps);
          scope.deleteSFP(scope.sfps[0].name, 0);
          expect(modalDeleteSvcMock.open).toHaveBeenCalledWith("sfp1", jasmine.any(Function));
          expect(servicePathSvcMock.deleteItem).toHaveBeenCalledWith({"name": "sfp1"}, jasmine.any(Function));
          expect(rootScope.sfps).toEqual([]);
          expect(scope.sfps).toEqual([]);
          expect(exampleData.sfps).toEqual([]);
        });

        it("should remove SF from SFC", function () {
          createServicePathCtrl();
          scope.removeSFfromSFP(exampleData.sfps[0], 0);
          expect(exampleData.sfps[0]['sfp-service-function']).toEqual([]);
          expect(exampleData.sfps[0].state).toBe(sfpState.EDITED);
        });

        it("should PUT SFP to controller", function () {
          spyOn(servicePathSvcMock, 'putItem').andCallThrough();
          createServicePathCtrl();
          scope.persistSFP(exampleData.sfps[0]);
          expect(exampleData.sfps[0].state).toBeUndefined();
          expect(servicePathSvcMock.putItem).toHaveBeenCalledWith(exampleData.sfps[0], jasmine.any(Function));
        });

        it("should get index of SF in scope.sfs array", function () {
          createServicePathCtrl();
          var index = scope.getSFindexInSFS(exampleData.sfs[0].name);
          expect(index).toBe(0);
        });

        it("should UNDO changes in SFP", function () {
          spyOn(servicePathSvcMock, 'getItem').andCallThrough();
          createServicePathCtrl();
          rootScope.sfps = exampleData.sfps;
          rootScope.sfps[0].change = "someChanges";
          expect(scope.sfps).toEqual(rootScope.sfps);
          scope.undoSFPchanges(exampleData.sfps[0], 0);
          expect(servicePathSvcMock.getItem).toHaveBeenCalledWith(exampleData.sfps[0].name, jasmine.any(Function));
          expect(rootScope.sfps[0]).toEqual(exampleData.sfps[0]);
          expect(scope.sfps[0]).toEqual(exampleData.sfps[0]);
        });
      });
    });
  });
});
