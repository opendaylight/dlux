describe("Api Service", function() {
  var restangular, httpBackend;
  beforeEach(angular.mock.module('common.nbapi'));
  beforeEach(angular.mock.module('restangular'));
  beforeEach(angular.mock.inject(function(Restangular, $httpBackend){
      restangular = Restangular;
      httpBackend = $httpBackend;
  }));

  describe("Node Inventory Service", function() {
    it("get all Node call should happen", angular.mock.inject(function(NodeInventorySvc) {
      spyOn(restangular, 'one').andCallThrough();
      var mockToReturn = {"nodes":[{"nodeId" :2}, {"nodeId" :3}]};
      httpBackend.expectGET('/operational/opendaylight-inventory:nodes').respond(mockToReturn);
      NodeInventorySvc.getAllNodes().then(function(data) {
        expect(data.nodes.length).toBe(2);
        expect(data.nodes[0].nodeId).toBe(2);
        expect(data.nodes[1].nodeId).toBe(3);
      });
      expect(restangular.one).toHaveBeenCalledWith('operational');
      httpBackend.flush();
    }));

    it("get null current data", angular.mock.inject(function(NodeInventorySvc) {
      var data = NodeInventorySvc.getCurrentData();
      expect(data).toBeNull();
    }));

    it("get valid current data", angular.mock.inject(function(NodeInventorySvc) {
      NodeInventorySvc.data = "testData";
      expect(NodeInventorySvc.getCurrentData()).toBe("testData");
    }));

    it("get node should fetch node data", angular.mock.inject(function(NodeInventorySvc) {
      spyOn(restangular, 'one').andCallThrough();
      var mockToReturn = {"nodeId" :2};
      httpBackend.expectGET('/operational/opendaylight-inventory:nodes/node/2').respond(mockToReturn);
      NodeInventorySvc.getNode(2).then(function(data) {
        expect(data.nodeId).toBe(2);
      });
      httpBackend.flush();
    }));
  });
});
