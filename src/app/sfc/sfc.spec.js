describe("SFC", function () {
  var scope, state, stateParams, serviceFunctionSvcMock, serviceChainSvcMock, serviceNodeSvcMock, servicePathSvcMock, rootScope;
  var modalDeleteSvcMock, modalSfNameSvcMock, modalInfoSvcMock, modalErrorSvcMock, sfcRpcErrorMock, sfcFormatMessageMock;
  var sfcState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};
  var sfpState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};


  var exampleData = {};
  beforeEach(function () {
    exampleData.sfs = [
      {"name": "sf1", "type": "firewall", "ip": "10.0.0.1"}
    ];
    exampleData.sfcs = [
      {"name": "sfc1", "sfc-service-function": [
        {"name": "firewall", type: "firewall"}
      ]}
    ];
    exampleData.sfcsPreLoad = [
      {"name": "sfcToBeDeleted", "sfc-service-function": [
        {"name": "firewall", type: "firewall"}
      ]},
      {"name": "sfc2", "state": "edited", "sfc-service-function": [
        {"name": "firewall", type: "firewall"}
      ]}
    ];
    exampleData.sfcsWithTemporary = [
      {"name": "sfc2", "state": "edited", "sfc-service-function": [
        {"name": "firewall", type: "firewall"}
      ]},
      {"name": "sfc1", "state": "persisted", "sfc-service-function": [
        {"name": "firewall", type: "firewall"}
      ]}
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
    exampleData.sns = [
      {"name": "sn1", "ip": "10.0.0.1", "service-function": ["sf1"]}
    ];
    exampleData.snsGraph = [
      {
        "name": "sn1",
        "ip": "10.0.0.1",
        "children": {"name": "sf1", "type": "firewall", "ip": "10.0.0.1"}
      }
    ];
  });

  beforeEach(angular.mock.module('ui.state'));
  beforeEach(angular.mock.module('console.sfc'));
  beforeEach(angular.mock.inject(function ($controller, $q, $state, $stateParams, $rootScope, $templateCache) {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      state = $state;
      stateParams = $stateParams;
      $templateCache.put('sfc/root.tpl.html', '');
      $templateCache.put('sfc/servicenode.tpl.html', '');
      $templateCache.put('sfc/servicenode.create.tpl.html', '');
      $templateCache.put('sfc/servicenode.edit.tpl.html', '');
      $templateCache.put('sfc/servicefunction.tpl.html', '');
      $templateCache.put('sfc/servicefunction.create.tpl.html', '');
      $templateCache.put('sfc/servicechain.tpl.html', '');
      $templateCache.put('sfc/servicechain.create.tpl.html', '');
      $templateCache.put('sfc/servicepath.tpl.html', '');

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
      serviceChainSvcMock = {
        getArray: function (callback) {
          callback(exampleData.sfcs);
        },
        deleteItem: function (sfcName, callback) {
          exampleData.sfcs.splice(0, 1);
          return callback();
        },
        putItem: function (sfcName, callback) {
          return callback();
        },
        getItem: function (sfpName, callback) {
          return exampleData.sfps[0];
        },
        deployChain: function (sfc, callback) {
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
          return exampleData.sfps[0];
        }
      };
      serviceNodeSvcMock = {
        getArray: function (callback) {
          return callback(exampleData.sns);
        },
        getItem: function (key, callback) {
          return callback(exampleData.sns[0]);
        },
        putItem: function (item, callback) {
          return callback();
        },
        deleteItem: function (snName, callback) {
          exampleData.sns.splice(0, 1);
          return callback();
        }
      };
      modalDeleteSvcMock = {
        open: function (snName, callback) {
          return callback('delete');
        }
      };
      modalSfNameSvcMock = {
        open: function (sfc, sf, callback) {
          return callback({"name": "egress-firewall", "type": "firewall"});
        }
      };
      modalInfoSvcMock = {};
      modalErrorSvcMock = {};
      sfcRpcErrorMock = {
        default: function () {
          return this;
        }
      };
      sfcFormatMessageMock = {
        default: function () {
          return this;
        }
      };
    })
  );

  beforeEach(angular.mock.inject(function ($controller) {
    return $controller('rootCtrl', {$scope: scope});
  }));


  describe("Service Nodes tab", function () {

    describe("serviceNodeCtrl", function () {
      var createServiceNodeCtrl, serviceNodeCtrlFuncMock;

      beforeEach(angular.mock.inject(function ($controller) {
        createServiceNodeCtrl = function () {
          return $controller('serviceNodeCtrl', { $scope: scope, $state: state, ServiceFunctionSvc: serviceFunctionSvcMock,
            ServiceNodeSvc: serviceNodeSvcMock, ServiceNodeCtrlFunc: serviceNodeCtrlFuncMock, ModalDeleteSvc: modalDeleteSvcMock});
        };

        serviceNodeCtrlFuncMock = {
          createGraphData: function (nodeArray, sfs) {
            if (exampleData.sns.length === 0) {
              return [];
            }
            else {
              return exampleData.snsGraph;
            }
          }
        };
      }));

      it("should call get Service Functions", function () {
        spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
        createServiceNodeCtrl();
        state.transitionTo('sfc.servicenode');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode');
        expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sfs).toEqual(exampleData.sfs);
      });

      it("should call get Service Nodes", function () {
        spyOn(serviceNodeSvcMock, 'getArray').andCallThrough();
        createServiceNodeCtrl();
        state.transitionTo('sfc.servicenode');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode');
        expect(serviceNodeSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sns).toEqual(exampleData.sns);
      });

      it("should call createGraphData", function () {
        spyOn(serviceNodeCtrlFuncMock, 'createGraphData').andCallThrough();
        createServiceNodeCtrl();
        state.transitionTo('sfc.servicenode');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode');
        expect(serviceNodeCtrlFuncMock.createGraphData).toHaveBeenCalledWith(exampleData.sns, exampleData.sfs);
        expect(scope.snsGraph).toEqual(exampleData.snsGraph);
      });

      it("should open modal dialog, delete service node, refresh Service Nodes and call createGraphData ", function () {
        spyOn(modalDeleteSvcMock, 'open').andCallThrough();
        spyOn(serviceNodeSvcMock, 'deleteItem').andCallThrough();
        spyOn(serviceNodeSvcMock, 'getArray').andCallThrough();
        spyOn(serviceNodeCtrlFuncMock, 'createGraphData').andCallThrough();
        createServiceNodeCtrl();
        scope.deleteServiceNode(exampleData.sns[0].name);
        expect(modalDeleteSvcMock.open).toHaveBeenCalledWith("sn1", jasmine.any(Function));
        expect(serviceNodeSvcMock.deleteItem).toHaveBeenCalledWith({name: "sn1"}, jasmine.any(Function));
        expect(serviceNodeSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sns).toEqual([]);
        expect(serviceNodeCtrlFuncMock.createGraphData).toHaveBeenCalledWith([], exampleData.sfs);
        expect(scope.snsGraph).toEqual([]);
      });

      it("should make transition to sfc.servicenode.edit state and pass service node name", function () {
        createServiceNodeCtrl();
        scope.editServiceNode(exampleData.sns[0].name);
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.edit');
        expect(stateParams.snName).toBe(exampleData.sns[0].name);
      });
    });

    describe("serviceNodeEditCtrl", function () {
      var createServiceNodeEditCtrl;

      beforeEach(angular.mock.inject(function ($controller) {
        createServiceNodeEditCtrl = function () {
          return $controller('serviceNodeEditCtrl', {$scope: scope, $state: state, $stateParams: {snName: exampleData.sns[0].name},
            ServiceFunctionSvc: serviceFunctionSvcMock, ServiceNodeSvc: serviceNodeSvcMock});
        };
      }));

      it("should call get Service Functions", function () {
        spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
        createServiceNodeEditCtrl();
        state.transitionTo('sfc.servicenode.edit');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.edit');
        expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sfs).toEqual(exampleData.sfs);
      });

      it("should get Service Node with specified name", function () {
        spyOn(serviceNodeSvcMock, 'getItem').andCallThrough();
        createServiceNodeEditCtrl();
        state.transitionTo('sfc.servicenode.edit', {snName: exampleData.sns[0].name});
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.edit');
        expect(stateParams.snName).toBe(exampleData.sns[0].name);
        expect(serviceNodeSvcMock.getItem).toHaveBeenCalledWith(stateParams.snName, jasmine.any(Function));
        expect(scope.data).toEqual(exampleData.sns[0]);
      });

      it("ensure that scope.data variable is initialized", function () {
        createServiceNodeEditCtrl();
        state.transitionTo('sfc.servicenode.edit');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.edit');
        expect(scope.data).toBeDefined();
      });

      it("should POST Service Node data to controller and transition to sfc.servicenode", function () {
        spyOn(serviceNodeSvcMock, 'putItem').andCallThrough();
        createServiceNodeEditCtrl();
        scope.data = exampleData.sns[0];
        scope.submit();
        expect(serviceNodeSvcMock.putItem).toHaveBeenCalledWith(scope.data, jasmine.any(Function));
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode');
      });

    });

    describe("serviceNodeCreateCtrl", function () {
      var createServiceNodeCreateCtrl;

      beforeEach(angular.mock.inject(function ($controller) {
        createServiceNodeCreateCtrl = function () {
          return $controller('serviceNodeCreateCtrl', {$scope: scope, $state: state, ServiceFunctionSvc: serviceFunctionSvcMock, ServiceNodeSvc: serviceNodeSvcMock});
        };
      }));

      it("should call get Service Functions", function () {
        spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
        createServiceNodeCreateCtrl();
        state.transitionTo('sfc.servicenode.create');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.create');
        expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sfs).toEqual(exampleData.sfs);
      });

      it("ensure that scope.data variable is initialized", function () {
        createServiceNodeCreateCtrl();
        state.transitionTo('sfc.servicenode.create');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.create');
        expect(scope.data).toBeDefined();
      });

      it("should POST Service Node data to controller and transition to sfc.servicenode", function () {
        spyOn(serviceNodeSvcMock, 'putItem').andCallThrough();
        createServiceNodeCreateCtrl();
        scope.data = exampleData.sns[0];
        scope.submit();
        expect(serviceNodeSvcMock.putItem).toHaveBeenCalledWith(scope.data, jasmine.any(Function));
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode');
      });
    });

  });

  describe("Service Functions tab", function () {

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
        state.transitionTo('sfc.servicefunction');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicefunction');
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

      beforeEach(angular.mock.inject(function ($controller) {
        createServiceFunctionCreateCtrl = function () {
          return $controller('serviceFunctionCreateCtrl', {$scope: scope, $state: state, ServiceFunctionSvc: serviceFunctionSvcMock});
        };
      }));

      it("ensure that scope.data variable is properly initialized", function () {
        createServiceFunctionCreateCtrl();
        state.transitionTo('sfc.servicefunction.create');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicefunction.create');
        expect(scope.data).toEqual({"sf-data-plane-locator": {}});
      });

      it("should POST Service function data to controller and transition to sfc.servicefunction", function () {
        spyOn(serviceFunctionSvcMock, 'putItem').andCallThrough();
        createServiceFunctionCreateCtrl();
        scope.data = exampleData.sfs[0];
        scope.submit();
        expect(serviceFunctionSvcMock.putItem).toHaveBeenCalledWith(scope.data, jasmine.any(Function));
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicefunction');
      });
    });
  });

  describe("Service Chains tab", function () {

    describe("serviceChainCtrl", function () {
      var createServiceChainCtrl;

      beforeEach(angular.mock.inject(function ($controller) {
        createServiceChainCtrl = function () {
          return $controller('serviceChainCtrl', {$scope: scope, $rootScope: rootScope, ServiceFunctionSvc: serviceFunctionSvcMock, ServiceChainSvc: serviceChainSvcMock,
            ModalDeleteSvc: modalDeleteSvcMock, ModalInfoSvc: modalInfoSvcMock, ModalErrorSvc: modalErrorSvcMock,
            ModalSfNameSvc: modalSfNameSvcMock, SfcRpcError: sfcRpcErrorMock, sfcFormatMessage: sfcFormatMessageMock});
        };
      }));

      beforeEach(function () {
        exampleData.sfcs = [
          {"name": "sfc1", "sfc-service-function": [
            {"name": "firewall", type: "firewall"}
          ]}
        ];
      });

      it("ensure that scope.effectMe object is initialized", function () {
        createServiceChainCtrl();
        state.transitionTo('sfc.servicechain');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain');
        expect(scope.sfcEffectMe).toBeDefined();
      });

      it("ensure that (root)scope.sfcs variable is initialized", function () {
        createServiceChainCtrl();
        state.transitionTo('sfc.servicechain');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain');
        expect(rootScope.sfcs).toBeDefined();
        expect(scope.sfcs).toBeDefined();
      });

      it("ensure that scope.sortableOptions variable is initialized", function () {
        createServiceChainCtrl();
        state.transitionTo('sfc.servicechain');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain');
        expect(scope.sortableOptions).toBeDefined();
      });


      it("should call get Service Functions", function () {
        spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
        createServiceChainCtrl();
        state.transitionTo('sfc.servicechain');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain');
        expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sfs).toEqual(exampleData.sfs);
      });

      it("should call get Service Chains, keep temporary and remove persisted data", function () {
        spyOn(serviceChainSvcMock, 'getArray').andCallThrough();
        rootScope.sfcs = exampleData.sfcsPreLoad;
        expect(scope.sfcs).toEqual(exampleData.sfcsPreLoad);
        createServiceChainCtrl();
        state.transitionTo('sfc.servicechain');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain');
        expect(serviceChainSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(rootScope.sfcs).toEqual(exampleData.sfcsWithTemporary);
        expect(scope.sfcs).toEqual(exampleData.sfcsWithTemporary);
      });

      it("should return current state of SFC", function () {
        createServiceChainCtrl();
        expect(scope.getSFCstate(exampleData.sfcs[0])).toBe(sfcState.PERSISTED);
        exampleData.sfcs[0].state = sfcState.EDITED;
        expect(scope.getSFCstate(exampleData.sfcs[0])).toBe(sfcState.EDITED);
      });

      it("should set SFC to proper state", function () {
        createServiceChainCtrl();
        scope.setSFCstate(exampleData.sfcs[0], sfcState.EDITED);
        expect(exampleData.sfcs[0].state).toBe(sfcState.EDITED);
        scope.setSFCstate(exampleData.sfcs[0], sfcState.NEW);
        expect(exampleData.sfcs[0].state).toBe(sfcState.NEW);
        scope.setSFCstate(exampleData.sfcs[0], sfcState.PERSISTED);
        expect(exampleData.sfcs[0].state).toBe(sfcState.NEW);
      });

      it("should check if SFC is in given state", function () {
        createServiceChainCtrl();
        //should return persisted even if there is not state set
        expect(scope.isSFCstate(exampleData.sfcs[0], sfcState.PERSISTED)).toBeTruthy();
        exampleData.sfcs[0].state = sfcState.PERSISTED;
        expect(scope.isSFCstate(exampleData.sfcs[0], sfcState.PERSISTED)).toBeTruthy();
        exampleData.sfcs[0].state = sfcState.EDITED;
        expect(scope.isSFCstate(exampleData.sfcs[0], sfcState.EDITED)).toBeTruthy();
        exampleData.sfcs[0].state = sfcState.NEW;
        expect(scope.isSFCstate(exampleData.sfcs[0], sfcState.NEW)).toBeTruthy();
      });

      it("should unset SFC state", function () {
        createServiceChainCtrl();
        exampleData.sfcs[0].state = sfcState.NEW;
        scope.unsetSFCstate(exampleData.sfcs[0]);
        expect(exampleData.sfcs[0].state).toBeUndefined();
      });


      it("should add SF into SFC['sfc-service-function']  (non-existent SF)", function () {
        createServiceChainCtrl();
        var emptySfc = {"name": "test SFC"};
        scope.onSFCdrop(exampleData.sfs[0], emptySfc);
        expect(emptySfc['sfc-service-function']).toBeDefined();
        expect(emptySfc['sfc-service-function'][0]).toEqual({"name": exampleData.sfs[0].type, "type": exampleData.sfs[0].type});
        expect(emptySfc.state).toBe(sfcState.EDITED);
      });

      it("should add SF into SFC['sfc-service-function']  (existent SF)", function () {
        spyOn(modalSfNameSvcMock, 'open').andCallThrough();
        createServiceChainCtrl();
        scope.onSFCdrop(exampleData.sfs[0], exampleData.sfcs[0]);
        expect(exampleData.sfcs[0]['sfc-service-function']).toBeDefined();
        expect(modalSfNameSvcMock.open).toHaveBeenCalledWith(exampleData.sfcs[0], exampleData.sfs[0], jasmine.any(Function));
        expect(exampleData.sfcs[0]['sfc-service-function'][1]).toEqual({"name": "egress-firewall", "type": exampleData.sfs[0].type});
        expect(exampleData.sfcs[0].state).toBe(sfcState.EDITED);
      });

      it("should open modal dialog and delete SFC from controller and scope", function () {
        spyOn(serviceChainSvcMock, 'deleteItem').andCallThrough();
        spyOn(modalDeleteSvcMock, 'open').andCallThrough();
        createServiceChainCtrl();
        rootScope.sfcs = exampleData.sfcs;
        expect(scope.sfcs).toEqual(exampleData.sfcs);
        scope.deleteSFC(rootScope.sfcs[0].name, 0);
        expect(modalDeleteSvcMock.open).toHaveBeenCalledWith("sfc1", jasmine.any(Function));
        expect(serviceChainSvcMock.deleteItem).toHaveBeenCalledWith({"name": "sfc1"}, jasmine.any(Function));
        expect(rootScope.sfcs).toEqual([]);
        expect(scope.sfcs).toEqual([]);
        expect(exampleData.sfcs).toEqual([]);
      });

      it("should remove SF from SFC", function () {
        createServiceChainCtrl();
        scope.removeSFfromSFC(exampleData.sfcs[0], 0);
        expect(exampleData.sfcs[0]['sfc-service-function']).toEqual([]);
        expect(exampleData.sfcs[0].state).toBe(sfcState.EDITED);
      });

      it("should POST SFC to controller", function () {
        spyOn(serviceChainSvcMock, 'putItem').andCallThrough();
        createServiceChainCtrl();
        scope.persistSFC(exampleData.sfcs[0]);
        expect(exampleData.sfcs[0].state).toBeUndefined();
        expect(serviceChainSvcMock.putItem).toHaveBeenCalledWith(exampleData.sfcs[0], jasmine.any(Function));
      });

      it("should UNDO SFC creation", function() {
        createServiceChainCtrl();
        rootScope.sfcs = exampleData.sfcs;
        expect(scope.sfcs).toEqual(exampleData.sfcs);
        scope.undoSFCnew(exampleData.sfcs[0], 0);
        expect(rootScope.sfcs).toEqual([]);
        expect(scope.sfcs).toEqual([]);
      });

      it("should UNDO changes in SFC", function() {
        spyOn(serviceChainSvcMock, 'getItem').andCallThrough();
        createServiceChainCtrl();
        rootScope.sfcs = exampleData.sfcs;
        rootScope.sfcs[0].change = "someChanges";
        expect(scope.sfcs).toEqual(rootScope.sfcs);
        scope.undoSFCchanges(exampleData.sfcs[0], 0);
        expect(serviceChainSvcMock.getItem).toHaveBeenCalledWith(exampleData.sfcs[0].name, jasmine.any(Function));
        expect(rootScope.sfcs[0]).toEqual(exampleData.sfcs[0]);
        expect(scope.sfcs[0]).toEqual(exampleData.sfcs[0]);
      });

      //TODO: test SfcRpcError handling
//      it("should deploy SFC (create SFP instance from it)", function () {
//        spyOn(serviceChainSvcMock, 'deployChain').andCallThrough();
//        createServiceChainCtrl();
//        scope.deploySFC(exampleData.sfcs[0]);
//        expect(serviceChainSvcMock.deployChain).toHaveBeenCalledWith(exampleData.sfcs[0].name, jasmine.any(Function));
//      });
    });

    describe("serviceChainCreateCtrl", function () {
      var createServiceChainCreateCtrl;

      beforeEach(angular.mock.inject(function ($controller) {
        createServiceChainCreateCtrl = function () {
          return $controller('serviceChainCreateCtrl', {$scope: scope, $state: state});
        };
      }));

      it("ensure that scope.data is initialized", function () {
        createServiceChainCreateCtrl();
        state.transitionTo('sfc.servicechain.create');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain.create');
        expect(scope.data).toBeDefined();
      });

      it("should create SFC, set is as new and transition to sfc.servicechain", function(){
        createServiceChainCreateCtrl();
        state.transitionTo('sfc.servicechain.create');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain.create');
        scope.data.name = exampleData.sfcs[0].name;
        scope.submit();
        expect(scope.data).toBeDefined();
        expect(scope.data).toEqual({"sfc-service-function": [], "state": "new", "name": exampleData.sfcs[0].name});
        expect(rootScope.sfcs[0]).toEqual(scope.data);
        expect(scope.sfcs[0]).toEqual(scope.data);
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicechain');
      });
    });
  });

  describe("Service Paths tab", function () {

    describe("servicePathCtrl", function () {
      var createServicePathCtrl;

      beforeEach(angular.mock.inject(function ($controller) {
        createServicePathCtrl = function () {
          return $controller('servicePathCtrl', {$scope: scope, $rootScope: rootScope, ServiceFunctionSvc: serviceFunctionSvcMock, ServicePathSvc: servicePathSvcMock,
            ModalDeleteSvc: modalDeleteSvcMock});
        };
      }));

      beforeEach(function () {
        exampleData.sfps = [
          {"name": "sfp1", "sfp-service-function": [
            {"name": "sf1"}
          ]}
        ];
      });

      it("ensure that (root)scope.sfpEffectMe object is initialized", function() {
        createServicePathCtrl();
        state.transitionTo('sfc.servicepath');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicepath');
        expect(rootScope.sfpEffectMe).toBeDefined();
        expect(scope.sfpEffectMe).toBeDefined();
      });

      it("ensure that (root)scope.sfps variable is initialized", function () {
        createServicePathCtrl();
        state.transitionTo('sfc.servicepath');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicepath');
        expect(rootScope.sfps).toBeDefined();
        expect(scope.sfps).toBeDefined();
      });

      it("ensure that scope.sortableOptions variable is initialized", function () {
        createServicePathCtrl();
        state.transitionTo('sfc.servicepath');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicepath');
        expect(scope.sortableOptions).toBeDefined();
      });

      it("should call get Service Functions", function () {
        spyOn(serviceFunctionSvcMock, 'getArray').andCallThrough();
        createServicePathCtrl();
        state.transitionTo('sfc.servicepath');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicepath');
        expect(serviceFunctionSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
        expect(scope.sfs).toEqual(exampleData.sfs);
      });

      it("should call get Service Paths, keep temporary and remove persisted data", function () {
        spyOn(servicePathSvcMock, 'getArray').andCallThrough();
        rootScope.sfps = exampleData.sfpsPreLoad;
        expect(scope.sfps).toEqual(exampleData.sfpsPreLoad);
        createServicePathCtrl();
        state.transitionTo('sfc.servicepath');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicepath');
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

      it("should POST SFP to controller", function () {
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

      it("should UNDO changes in SFP", function() {
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