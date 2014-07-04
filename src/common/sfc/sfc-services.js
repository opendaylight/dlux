angular.module('common.sfc.api', [])

.factory('BaseSvc', function (Restangular) {
  var svc = {};

  svc.baseRest = function () {
    return Restangular.one('config');
  };

  return svc;
})


.factory('ServiceFunctionSvc', function (BaseSvc) {
  var sfModelUrl = 'service-function:service-functions';

  var svc = {};

  svc.baseRest = function () {
    return BaseSvc.baseRest();
  };

  svc.put = function (elem, key) {
    return svc.baseRest().customPUT(elem, sfModelUrl + '/service-function/' + key);
  };

    svc.putContainer = function (containerElem) {
      return svc.baseRest().customPUT(containerElem, sfModelUrl);
    };

  svc.delete = function (key) {
    return svc.baseRest().customDELETE(sfModelUrl + '/service-function/' + key);
  };

  svc.getAll = function () {
    return svc.baseRest().customGET(sfModelUrl);
  };

  svc.stripSfTypePrefix = function (sfsArray) {

    var matcher = new RegExp("^service-function:");

    _.each(sfsArray, function (sf) {

      if (!_.isEmpty(sf.type)) {
        sf.type = sf.type.replace(matcher, "");
      }
    });

    return sfsArray;
  };

  svc.wrapOneInObject = function (serviceFunctionItem) {
    return {
      "Object": serviceFunctionItem
    };
  };

  svc.getArray = function (callback) {
    svc.getAll().then(function (result) {
      callback(svc.stripSfTypePrefix(result['service-functions']['service-function'])); // return only nested array
    }, /* on error*/ function (response) {

      if (response.status = "404") {
        console.trace("No service function data, returning empty array");
      } else {
        console.error("Error with status code ", response.status);
      }

      callback([]); // return empty array
    });
  };

  svc.putItem = function (sfItem, callback) {

    if (!sfItem.name || _.isEmpty(sfItem.name)) {
      throw new Error('Error: service-function/name is not defined');
    }

    var wrappedElem = svc.wrapOneInObject(sfItem);

    svc.put(wrappedElem, sfItem.name).then(function () {
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

    svc.putContainerWrapper = function (containerData, callback) {

      svc.putContainer(containerData).then(function () {
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

  svc.deleteItem = function (sfItem, callback) {

    if (!sfItem.name || _.isEmpty(sfItem.name)) {
      throw new Error('Error: service-function/name is not defined');
    }

    svc.delete(sfItem.name).then(function () {
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

  return svc;
})


.factory('ServiceChainSvc', function (BaseSvc) {

  var sfcModelUrl = 'service-function-chain:service-function-chains';

  var svc = {};

  svc.baseRest = function () {
    return BaseSvc.baseRest();
  };

  svc.put = function (elem, key) {
    return svc.baseRest().customPUT(elem, sfcModelUrl + '/service-function-chain/' + key);
  };

    svc.putContainer = function (containerElem) {
      return svc.baseRest().customPUT(containerElem, sfcModelUrl);
    };

    svc.putContainerWrapper = function (containerData, callback) {

      svc.putContainer(containerData).then(function () {
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

  svc.delete = function (key) {
    return svc.baseRest().customDELETE(sfcModelUrl + '/service-function-chain/' + key);
  };

  svc.getAll = function () {
    return svc.baseRest().customGET(sfcModelUrl);
  };

  svc.wrapOneInObject = function (serviceFunctionChainItem) {
    return {
      "Object": serviceFunctionChainItem
    };
  };

  svc.getArray = function (callback) {
    svc.getAll().then(function (result) {
      callback(result['service-function-chains']['service-function-chain']); // return only nested array
    }, /* on error*/ function (response) {

      if (response.status = "404") {
        console.trace("No service function chains data, returning empty array");
      } else {
        console.error("Error with status code ", response.status);
      }

      callback([]); // return empty array
    });
  };

  svc.putItem = function (sfcItem, callback) {

    if (!sfcItem.name || _.isEmpty(sfcItem.name)) {
      throw new Error('Error: name is mandatory');
    }

    var wrappedElem = svc.wrapOneInObject(sfcItem);

    svc.put(wrappedElem, sfcItem.name).then(function () {
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

  svc.createInstance = function (sfcName, sfNames) {

    var sfsNested = [];

    _.each(sfNames, function (sfName) {
      sfsNested.push({"name": sfName});
    });

    return {
      "service-function": sfsNested,
      "name": sfcName
    };

  };

  svc.deleteItem = function (sfcItem, callback) {

    if (!sfcItem.name || _.isEmpty(sfcItem.name)) {
      throw new Error('Error: name is mandatory');
    }

    svc.delete(sfcItem.name).then(function () {
      if (callback) {
        callback();
      }
    }, /* on error*/ function (response) {
      if (response.status = "404") {
        console.trace("Service function chain [name: {0}] not found", sfcItem.name);
      } else {
        console.error("SFC REST DELETE: Error with status code ", response.status);
      }

      if (callback) {
        callback(response); // on REST error pass response
      }
    });
  };


  return svc;
})

.factory('ServicePathSvc', function (BaseSvc) {

  var sfpModelUrl = 'service-function-path:service-function-paths';

  var svc = {};

  svc.baseRest = function () {
    return BaseSvc.baseRest();
  };

  svc.put = function (elem, key) {
    return svc.baseRest().customPUT(elem, sfpModelUrl + '/service-function-path/' + key);
  };

  svc.delete = function (key) {
    return svc.baseRest().customDELETE(sfpModelUrl + '/service-function-path/' + key);
  };

  svc.getAll = function () {
    return svc.baseRest().customGET(sfpModelUrl);
  };

  svc.wrapOneInObject = function (serviceFunctionPathItem) {
    return {
      "Object": serviceFunctionPathItem
    };
  };

  svc.getArray = function (callback) {
    svc.getAll().then(function (result) {
      callback(result['service-function-paths']['service-function-path']); // return only nested array
    }, /* on error*/ function (response) {

      if (response.status = "404") {
        console.trace("No service function paths data, returning empty array");
      } else {
        console.error("Error with status code ", response.status);
      }

      callback([]); // return empty array
    });
  };

  svc.putItem = function (sfpItem, callback) {

    if (!sfpItem.name || _.isEmpty(sfpItem.name)) {
      throw new Error('Error: name is mandatory');
    }

    var wrappedElem = svc.wrapOneInObject(sfpItem);

    svc.put(wrappedElem, sfpItem.name).then(function () {
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

  svc.createInstance = function (sfpName, sfNames) {

    var sfsNested = [];

    _.each(sfNames, function (sfName) {
      sfsNested.push(sfName);
    });

    return {
      "service-function-instance": sfsNested,
      "name": sfpName
    };

  };

  svc.deleteItem = function (sfpItem, callback) {

    if (!sfpItem.name || _.isEmpty(sfpItem.name)) {
      throw new Error('Error: name is mandatory');
    }

    svc.delete(sfpItem.name).then(function () {
      if (callback) {
        callback();
      }
    }, /* on error*/ function (response) {
      if (response.status = "404") {
        console.trace("Service function path [name: {0}] not found", sfpItem.name);
      } else {
        console.error("SFP REST DELETE: Error with status code ", response.status);
      }

      if (callback) {
        callback(response); // on REST error pass response
      }
    });
  };


  return svc;
})

.factory('ServiceNodeSvc', function (BaseSvc) {

  var modelUrl = 'service-node:service-nodes';
  var containerName = 'service-nodes';
  var listName = 'service-node';

  var svc = {};

  svc.baseRest = function () {
    return BaseSvc.baseRest();
  };

  svc.put = function (elem, key) {
    return svc.baseRest().customPUT(elem, modelUrl + '/' + listName + '/' + key);
    };

    svc.putContainer = function (containerElem) {
      return svc.baseRest().customPUT(containerElem, modelUrl);
    };

    svc.putContainerWrapper = function (containerData, callback) {

      svc.putContainer(containerData).then(function () {
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

  svc.delete = function (key) {
    return svc.baseRest().customDELETE(modelUrl + '/' + listName + '/' + key);
  };

  svc.getAll = function () {
    return svc.baseRest().customGET(modelUrl);
  };

  svc.wrapOneInObject = function (data) {
    return {
      "Object": data
    };
  };

  svc.getArray = function (callback) {
    svc.getAll().then(function (result) {
      callback((result[containerName][listName])); // return only nested array
    }, /* on error*/ function (response) {

      if (response.status = "404") {
        console.trace("No service node data, returning empty array");
      } else {
        console.error("Error with status code ", response.status);
      }

      callback([]); // return empty array
    });
  };

  svc.putItem = function (snItem, callback) {

    if (!snItem.name || _.isEmpty(snItem.name)) {
      throw new Error('Error: name is mandatory');
    }

    var wrappedElem = svc.wrapOneInObject(snItem);

    svc.put(wrappedElem, snItem.name).then(function () {
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

  svc.createInstance = function (name, type, transport, ipMgmtAddress, failmode, sfNamesArray) {

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

  svc.deleteItem = function (snItem, callback) {

    if (!snItem.name || _.isEmpty(snItem.name)) {
      throw new Error('Error: name is mandatory');
    }

    svc.delete(snItem.name).then(function () {
      if (callback) {
        callback();
      }
    }, /* on error*/ function (response) {
      if (response.status = "404") {
        console.trace("Service node [name: {0}] not found", snItem.name);
      } else {
        console.error("SFC REST DELETE: Error with status code ", response.status);
      }

      if (callback) {
        callback(response); // on REST error pass response
      }
    });
  };

  svc.stripSnNamespacePrefixes = function (snArray) {

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

  return svc;
})
;