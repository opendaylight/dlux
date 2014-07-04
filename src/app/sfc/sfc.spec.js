describe("SFC", function () {
  var scope, state, serviceFunctionSvcMock, serviceNodeSvcMock, modalDeleteSvcMock, rootScope;

  var exampleData = {};
  exampleData.sfs = [{"name": "sf1", "type": "firewall", "ip": "10.0.0.1"}];
  exampleData.sns = [{"name": "sn1", "ip": "10.0.0.1", "service-function": ["sf1"]}];
  exampleData.snsGraph = [{
    "name": "sn1",
    "ip": "10.0.0.1",
    "children": {"name": "sf1", "type": "firewall", "ip": "10.0.0.1"}
  }];

  beforeEach(angular.mock.module('ui.state'));
  beforeEach(angular.mock.module('console.sfc'));
  beforeEach(angular.mock.inject(function ($controller, $q, $state, $rootScope, $templateCache) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    state = $state;
    $templateCache.put('sfc/root.tpl.html', '');
    $templateCache.put('sfc/servicenode.tpl.html', '');
    serviceFunctionSvcMock = {
      getArray: function (callback) {
        callback(exampleData.sfs);
      }
    };
    serviceNodeSvcMock = {
      getArray: function (callback) {
        callback(exampleData.sns);
      },
      deleteItem: function (snName, callback) {
        exampleData.sns.splice(0,1);
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
    var createServiceNodeCtrl, serviceNodeCtrlFuncMock;

    beforeEach(angular.mock.inject(function ($controller) {
      createServiceNodeCtrl = function () {
        return $controller('serviceNodeCtrl', { $scope: scope, ServiceFunctionSvc: serviceFunctionSvcMock,
          ServiceNodeSvc: serviceNodeSvcMock, ServiceNodeCtrlFunc: serviceNodeCtrlFuncMock, ModalDeleteSvc: modalDeleteSvcMock});
      };
      serviceNodeCtrlFuncMock = {
        createGraphData: function(nodeArray, sfs) {
          if(exampleData.sns.length === 0) {
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

    it("should call createGraphData", function() {
      spyOn(serviceNodeCtrlFuncMock, 'createGraphData').andCallThrough();
      createServiceNodeCtrl();
      state.transitionTo('sfc.servicenode');
      rootScope.$digest();
      expect(serviceNodeCtrlFuncMock.createGraphData).toHaveBeenCalledWith(exampleData.sns, exampleData.sfs);
      expect(scope.snsGraph).toEqual(exampleData.snsGraph);
    });

    it("should open modal dialog, delete service node, refresh Service Nodes and call createGraphData ", function () {
      spyOn(modalDeleteSvcMock, 'open').andCallThrough();
      spyOn(serviceNodeSvcMock, 'deleteItem').andCallThrough();
      spyOn(serviceNodeSvcMock, 'getArray').andCallThrough();
      spyOn(serviceNodeCtrlFuncMock, 'createGraphData').andCallThrough();
      createServiceNodeCtrl();
      scope.deleteServiceNode({name: exampleData.sns[0].name});
      expect(modalDeleteSvcMock.open).toHaveBeenCalledWith("sn1", jasmine.any(Function));
      expect(serviceNodeSvcMock.deleteItem).toHaveBeenCalledWith({name: "sn1"}, jasmine.any(Function));
      expect(serviceNodeSvcMock.getArray).toHaveBeenCalledWith(jasmine.any(Function));
      expect(scope.sns).toEqual([]);
      expect(serviceNodeCtrlFuncMock.createGraphData).toHaveBeenCalledWith([], exampleData.sfs);
      expect(scope.snsGraph).toEqual([]);
    });

  });
});

