describe("SFC", function () {
  var scope, state, stateParams, serviceFunctionSvcMock, serviceNodeSvcMock, modalDeleteSvcMock, rootScope;

  var exampleData = {};
  exampleData.sfs = [
    {"name": "sf1", "type": "firewall", "ip": "10.0.0.1"}
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

    serviceFunctionSvcMock = {
      getArray: function (callback) {
        callback(exampleData.sfs);
      },
      deleteItem: function (sfName, callback) {
        exampleData.sfs.splice(0, 1);
        return callback();
      }
    };
    serviceNodeSvcMock = {
      getArray: function (callback) {
        callback(exampleData.sns);
      },
      getItem: function(key, callback) {
        callback(exampleData.sns[0]);
      },
      putItem: function(item, callback) {
        callback();
      },
      deleteItem: function (snName, callback) {
        exampleData.sns.splice(0, 1);
        return callback();
      }
    };
    modalDeleteSvcMock = {
      open: function (snName, callback) {
        callback('delete');
      }
    };
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
        scope.editServiceNode('sn1');
        rootScope.$digest();
        expect(state.current.name).toBe('sfc.servicenode.edit');
        expect(stateParams.snName).toBe('sn1');
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

      it("should POST Service Node data to controller", function () {
        spyOn(serviceNodeSvcMock, 'putItem').andCallThrough();
        createServiceNodeCreateCtrl();
        scope.data = {"name": "sn1", "ip": "10.0.0.1", "service-function": ["sf1"]};
        scope.submit();
        expect(serviceNodeSvcMock.putItem).toHaveBeenCalledWith(scope.data, jasmine.any(Function));
      });
    });

    describe("serviceNodeEditCtrl", function () {
      var createServiceNodeEditCtrl;

      beforeEach(function(){
        exampleData.sns = [
          {"name": "sn1", "ip": "10.0.0.1", "service-function": ["sf1"]}
        ];
      });

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

      it("should POST Service Node data to controller", function () {
        spyOn(serviceNodeSvcMock, 'putItem').andCallThrough();
        createServiceNodeEditCtrl();
        scope.data = {"name": "sn1", "ip": "10.0.0.1", "service-function": ["sf1"]};
        scope.submit();
        expect(serviceNodeSvcMock.putItem).toHaveBeenCalledWith(scope.data, jasmine.any(Function));
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

//      it("should open modal dialog and delete service function", function () {
//        spyOn(modalDeleteSvcMock, 'open').andCallThrough();
//        spyOn(serviceFunctionSvcMock, 'deleteItem').andCallThrough();
//        createServiceFunctionCtrl();
//        scope.deleteSF($event, "sf1", 0);
//        expect(modalDeleteSvcMock.open).toHaveBeenCalledWith("sf1", jasmine.any(Function));
//        expect(serviceFunctionSvcMock.deleteItem).toHaveBeenCalledWith({name: "sf1"}, jasmine.any(Function));
//        expect(scope.sfs).toEqual([]);
//      });

    });
  });
});
