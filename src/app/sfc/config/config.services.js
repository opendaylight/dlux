define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.factory("SfcConfigSvc", function (SfcJsonValidationSvc, ServiceFunctionSvc, ServiceNodeSvc, ServiceChainSvc, sfcFormatMessage) {

    var sfcModelRevision = "sfc-rev-2014-07-01";

    var SF_PARSE = "\\{\\s*\"service-functions\"\\s*:\\s*\\{[\\w\\W]*\\]\\s*\\}\\s*\\}";
    var SN_PARSE = "\\{\\s*\"service-nodes\"\\s*:\\s*\\{[\\w\\W]*\\]\\s*\\}\\s*\\}";
    var SFC_PARSE = "\\{\\s*\"service-function-chains\"\\s*:\\s*\\{[\\w\\W]*\\]\\s*\\}\\s*\\}";

    var svc = {};

    // synchronously (thru recursive callbacks) send PUT requests based on data in 'pool' array
    svc.applyConfigPool = function (pool, finalCallback) {

      // define common callback fn after REST operation
      var callback = function (response, containerData) {
        try {
          if (response) {
            throw new Error(sfcFormatMessage("status code: {0}, for PUT opration:\n\n{1}\n\n{2}", response.status, containerData, response.data));
          } else {
            svc.applyConfigPool(pool, finalCallback);
          }
        } catch (e) {
          finalCallback(e);
        }
      };


      if (pool.length > 0) {
        var poolItem = pool.shift();   // shift from array

        switch (poolItem.model) {

          case 'sf':
          {
            ServiceFunctionSvc.putContainerWrapper(poolItem.container, callback);
            break;
          }

          case 'sn':
          {
            ServiceNodeSvc.putContainerWrapper(poolItem.container, callback);
            break;
          }

          case 'sfc':
          {
            ServiceChainSvc.putContainerWrapper(poolItem.container, callback);
            break;
          }

          default :
          {
            throw new Error("Unknown config item in pool");
          }
        }
      } else {
        finalCallback(null); // done
      }
    };

    // throws exception with formatted message in case of invalid json
    svc.checkJsonSchemaNew = function (dataObject, type, revision) {

      var report = SfcJsonValidationSvc.sfcValidate(dataObject, type, revision);

      // check
      if (report.errors.length === 0) {
        //JSON is valid against the schema - OK
      } else {
        // format error message

        var error = report.errors[0];
        var errorUri = error.uri;
        var message = error.message;
        var detail = error.detail;

        var errorPath = errorUri.replace(new RegExp("^[\\w\\W]*#"), "")
          .replace(new RegExp("\/items\/properties", "g"), "")
          .replace(new RegExp("\/properties", "g"), "")
          .replace(new RegExp("\/([\\d]+)", "g"), "[$1]"); // match array index

        throw new Error(sfcFormatMessage("object:\n{0}\ndoes not validate to schema.\npath: {1}\n\nmessage: {2}{3}",
          dataObject, errorPath, message, detail ? "\n\ndetail: " + detail : ''));
      }
    };


    // check for SF json, and in case store in pool
    svc.processSF = function (token, pool) {

      var regexp = new RegExp(SF_PARSE);

      var match = regexp.exec(token);

      if (!match || match === null) {
        return false;
      }

      try {
        var parsedJson = $.parseJSON(match);

        // Validation to SF schema
        svc.checkJsonSchemaNew(parsedJson, "sf", sfcModelRevision);

        pool.push({model: "sf", container: parsedJson});

      } catch (e) {
        throw new Error(e);
      }

      return true;
    };


    // check for SN json, validate, and in case store in pool
    svc.processSN = function (token, pool) {

      var regexp = new RegExp(SN_PARSE);

      var match = regexp.exec(token);

      if (!match || match === null) {
        return false;
      }

      try {
        var parsedJson = $.parseJSON(match);

        // Validation to SN schema
        svc.checkJsonSchemaNew(parsedJson, "sn", sfcModelRevision);

        pool.push({model: "sn", container: parsedJson});

      } catch (e) {
        throw new Error(e);
      }

      return true;
    };

    // check for SFC json, and in case store in pool
    svc.processSFC = function (token, pool) {

      var regexp = new RegExp(SFC_PARSE);

      var match = regexp.exec(token);

      if (!match || match === null) {
        return false;
      }
      try {
        var parsedJson = $.parseJSON(match);

        // Validation to SFC schema
        svc.checkJsonSchemaNew(parsedJson, "sfc", sfcModelRevision);

        pool.push({model: "sfc", container: parsedJson});

      } catch (e) {
        throw e;
      }

      return true;
    };

    // main exported function
    svc.runConfig = function (fileContent) {

      var pool = [];

      var position = 0;

      var tokens = fileContent.split(";");

      _.each(tokens, function (token) {

        var positionEnd = position + token.length;

        if (!_.str.isBlank(token)) {    // skip blank strings
          try {

            if (svc.processSF(token, pool)) {

            } else if (svc.processSN(token, pool)) {

            } else if (svc.processSFC(token, pool)) {

            } else {
              throw new Error(sfcFormatMessage("Error in input - unsupported object:\n {0}", token));
            }

          } catch (e) {
            throw e;
          }
        }

        position = positionEnd + 2;
      });

      if (pool.length !== 0) {
        svc.applyConfigPool(pool, svc.afterApplyConfigPoolCallback);
      } else {
        alert('No config json in file.');
      }

    };


    // final callback after sending PUT RESTs, or in case of Error
    svc.afterApplyConfigPoolCallback = function (err) {
      if (err) {
        console.error(err);
        alert(err.message);
      } else {
        alert('Config success!');
      }
    };

    // export
    return {
      runConfig: svc.runConfig
    };

  });

  // **** service: SfcConfigExportSvc ****
  sfc.register.factory("SfcConfigExportSvc", function ($q, ServiceFunctionSvc, ServiceNodeSvc, ServiceChainSvc) {

    svc = {};

    svc.exportConfig = function (receiveCallback) {

      var modelSvcList = [ServiceFunctionSvc, ServiceNodeSvc, ServiceChainSvc];

      _.each(modelSvcList, function (restSvcItem) {
        restSvcItem.getAll().then(function (restangularObject) {
          receiveCallback(restSvcItem.extractDataFromRestangular(restangularObject));
        });
      });
    };

    return svc;
  });

  // **** service: SfcFileReaderSvc ****
  sfc.register.factory("SfcFileReaderSvc",
    ["$q", "$log", function ($q, $log) {

      var onLoad = function (reader, deferred, scope) {
        return function () {
          scope.$apply(function () {
            deferred.resolve(reader.result);
          });
        };
      };

      var onError = function (reader, deferred, scope) {
        return function () {
          scope.$apply(function () {
            deferred.reject(reader.result);
          });
        };
      };

      var onProgress = function (reader, scope) {
        return function (event) {
          scope.$broadcast("fileProgress",
            {
              total: event.total,
              loaded: event.loaded
            });
        };
      };

      var getReader = function (deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
      };

      // returns promise with the txt content of the file, registers 'fileProgress' broadcast in scope
      var readAsText = function (file, scope) {
        $log.debug(file);

        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        reader.readAsText(file);

        return deferred.promise;
      };

      // service exports
      return {
        readAsText: readAsText
      };
    }]);


});