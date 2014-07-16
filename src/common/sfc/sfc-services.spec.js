describe("SFC REST Services", function () {
  var restangular, httpBackend;
  beforeEach(angular.mock.module('common.sfc.api'));
  beforeEach(angular.mock.module('restangular'));
  beforeEach(angular.mock.inject(function (Restangular, $httpBackend) {
    restangular = Restangular;
    httpBackend = $httpBackend;
  }));

  describe("Test SfcRestBaseSvc", function () {

    var testRestBaseSvc;

    beforeEach(angular.mock.inject(function (SfcRestBaseSvc) {
      var modelUrl = 'url';
      var containerName = 'container';
      var listName = 'listname';

      testRestBaseSvc = new SfcRestBaseSvc(modelUrl, containerName, listName);
    }));

    it("should call Restangular.one('config')", angular.mock.inject(function () {
      spyOn(restangular, 'one').andCallThrough();
      testRestBaseSvc.baseRest();
      expect(restangular.one).toHaveBeenCalledWith('config');
    }));

    it("should call Restangular.one('operations')", angular.mock.inject(function () {
      spyOn(restangular, 'one').andCallThrough();
      testRestBaseSvc.baseRpcRest();
      expect(restangular.one).toHaveBeenCalledWith('operations');
    }));

    it("should send correct POST", angular.mock.inject(function () {

      var testObject = {"input": {"test": 0}};
      var testParams = {"x": "y"};
      var expectHeaders = {
        "Content-Type": "application/yang.data+json",
        "Accept": "application/yang.data+json"
      };

      httpBackend.expectPOST('/operations/url:testrpc?x=y', testObject, expectHeaders).respond({});

      testRestBaseSvc.postRpc(testObject, "testrpc", testParams);

      httpBackend.flush();
    }));

    it("getArray - should receive nested array from container on REST OK", angular.mock.inject(function () {
      var mockToRespond = {
        "container": {
          "listname": [
            {
              "test": "test"
            }
          ]
        }
      };

      httpBackend.expectGET('/config/url:container').respond(mockToRespond);

      testRestBaseSvc.getArray(function (sfArrayData) {
        expect(sfArrayData).toEqual(mockToRespond["container"]["listname"]);
      });

      httpBackend.flush();
    }));

    it("getArray - should receive empty array on REST ERROR", angular.mock.inject(function (ServiceFunctionSvc) {
      var mockToRespond = {};

      httpBackend.expectGET('/config/url:container').respond(404, mockToRespond); //status 404 - not found

      testRestBaseSvc.getArray(function (data) {
        expect(data).toEqual([]);
      });

      httpBackend.flush();
    }));

  });

});
