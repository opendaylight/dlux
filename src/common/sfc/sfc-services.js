angular.module('common.sfc.api', [])

  .factory('BaseSvc', function (Restangular) {
    var svc = {};

    svc.baseRest = function () {
      return Restangular.one('config');
    };

    return svc;
  })


  // ******* SfcRestBaseSvc *********
  .factory('SfcRestBaseSvc', function (Restangular) {

    // constructor
    function SfcRestBaseSvc(_modelUrl, _containerName, _listName) {
      this.modelUrl = _modelUrl;
      this.containerName = _containerName;
      this.listName = _listName;
    }

    SfcRestBaseSvc.prototype.baseRest = function () {
      return Restangular.one('config');
    };

    SfcRestBaseSvc.prototype.put = function (elem, key) {
      return this.baseRest().customPUT(elem, this.modelUrl + '/' + this.listName + '/' + key);
    };

    SfcRestBaseSvc.prototype.putContainer = function (containerElem) {
      return this.baseRest().customPUT(containerElem, this.modelUrl);
    };

    SfcRestBaseSvc.prototype._delete = function (key) {
      return this.baseRest().customDELETE(this.modelUrl + '/' + this.listName + '/' + key);
    };

    SfcRestBaseSvc.prototype.getAll = function () {
      return this.baseRest().customGET(this.modelUrl);
    };

    SfcRestBaseSvc.prototype.getArray = function (callback) {
      var instance = this; // save 'this' to closure

      this.getAll().then(function (result) {
        var stripped = instance.stripNamespacePrefixes(result[instance.containerName][instance.listName]);
        callback(stripped); // return only nested array
      }, /* on error*/ function (response) {

        if (response.status = "404") {
          console.log("No data, returning empty array");
        } else {
          console.error("Error with status code ", response.status);
        }

        callback([]); // return empty array
      });
    };

    SfcRestBaseSvc.prototype.wrapOneInObject = function (serviceFunctionItem) {
      return {
        "Object": serviceFunctionItem
      };
    };

    SfcRestBaseSvc.prototype.checkRequired = function (item) {
      if (!item.name || _.isEmpty(item.name)) {
        throw new Error('Error: service-function/name is not defined');
      }
    };

    SfcRestBaseSvc.prototype.putItem = function (sfItem, callback) {

      this.checkRequired(sfItem);

      var wrappedElem = this.wrapOneInObject(sfItem);

      this.put(wrappedElem, sfItem.name).then(function () {
        if (callback) {
          callback();
        }
      }, /* on error*/ function (response) {
        console.log("Error with status code", response.status, " while PUT");
        if (callback) {
          callback(response); // on REST error pass response
        }
      });
    };

    SfcRestBaseSvc.prototype.putContainerWrapper = function (containerData, callback) {

      this.putContainer(containerData).then(function () {
        if (callback) {
          callback();
        }
      }, /* on error*/ function (response) {
        console.log("Error with status code", response.status, " while PUT");
        if (callback) {
          callback(response, containerData); // on REST error pass response
        }
      });
    };

    SfcRestBaseSvc.prototype.deleteItem = function (sfItem, callback) {

      this.checkRequired(sfItem);

      this._delete(sfItem.name).then(function () {
        if (callback) {
          callback();
        }
      }, /* on error*/ function (response) {
        console.log("Error with status code", response.status, " while DELETE");
        if (callback) {
          callback(response); // on REST error pass response
        }
      });
    };

    // to be overriden
    SfcRestBaseSvc.prototype.stripNamespacePrefixes = function (itemArray) {
      // noop
      return itemArray;
    };

    return SfcRestBaseSvc;  // return uninstatiated prototype
  })


  // ******* ServiceFunctionSvc *********
  .factory('ServiceFunctionSvc', function (SfcRestBaseSvc) {
    var modelUrl = 'service-function:service-functions';
    var containerName = 'service-functions';
    var listName = 'service-function';

    // constructor
    function ServiceFunctionSvc() {
    }

    ServiceFunctionSvc.prototype = new SfcRestBaseSvc(modelUrl, containerName, listName);

    // @override
    ServiceFunctionSvc.prototype.stripNamespacePrefixes = function (sfsArray) {

      var matcher = new RegExp("^service-function:");

      _.each(sfsArray, function (sf) {

        if (!_.isEmpty(sf.type)) {
          sf.type = sf.type.replace(matcher, "");
        }
      });

      return sfsArray;
    };

    return new ServiceFunctionSvc();
  })


  // ******* ServiceChainSvc *********
  .factory('ServiceChainSvc', function (SfcRestBaseSvc) {

    var modelUrl = 'service-function-chain:service-function-chains';
    var containerName = 'service-function-chains';
    var listName = 'service-function-chain';

    // constructor
    function ServiceChainSvc() {
    }

    ServiceChainSvc.prototype = new SfcRestBaseSvc(modelUrl, containerName, listName);

    ServiceChainSvc.prototype.createInstance = function (sfcName, sfNames) {

      var sfsNested = [];

      _.each(sfNames, function (sfName) {
        sfsNested.push({"name": sfName});
      });

      return {
        "service-function": sfsNested,
        "name": sfcName
      };
    };

    return new ServiceChainSvc();
  })


  // ******* ServicePathSvc *********
  .factory('ServicePathSvc', function (SfcRestBaseSvc) {

    var modelUrl = 'service-function-path:service-function-paths';
    var containerName = 'service-function-paths';
    var listName = 'service-function-path';

    // constructor
    function ServicePathSvc() {
    }

    ServicePathSvc.prototype = new SfcRestBaseSvc(modelUrl, containerName, listName);

    ServicePathSvc.prototype.createInstance = function (sfpName, sfNames) {

      var sfsNested = [];

      _.each(sfNames, function (sfName) {
        sfsNested.push(sfName);
      });

      return {
        "service-function-instance": sfsNested,
        "name": sfpName
      };
    };

    return new ServicePathSvc();
  })


  // *** ServiceNodeSvc **********************
  .factory('ServiceNodeSvc', function (SfcRestBaseSvc) {

    var modelUrl = 'service-node:service-nodes';
    var containerName = 'service-nodes';
    var listName = 'service-node';

    // constructor
    function ServiceNodeSvc() {
    }

    ServiceNodeSvc.prototype = new SfcRestBaseSvc(modelUrl, containerName, listName);


    ServiceNodeSvc.prototype.createInstance = function (name, type, transport, ipMgmtAddress, failmode, sfNamesArray) {

      // check is array
      if (_.isEmpty(sfNamesArray) || !_.isArray(sfNamesArray)) {
        throw new Error("Illegal argument: sfNamesArray is not an array");
      }

      // check function names
      _.each(sfNamesArray, function (_sfName) {
        if (_.isEmpty(_sfName) || typeof _sfName !== 'string') {
          throw new Error("Illegal argument: item in sfNamesArray");
        }
      });

      return {
        "service-function": sfNamesArray,
        "name": name,
        "ip-mgmt-address": ipMgmtAddress
      };
    };

    // @override
    ServiceNodeSvc.prototype.stripNamespacePrefixes = function (snArray) {

      var matcher = new RegExp("^service-node:");

      _.each(snArray, function (sn) {

        if (!_.isEmpty(sn.type)) {
          sn.type = sn.type.replace(matcher, "");
          sn.failmode = sn.failmode.replace(matcher, "");
          sn.transport = sn.transport.replace(matcher, "");
        }
      });

      return snArray;
    };

    return new ServiceNodeSvc();
  });