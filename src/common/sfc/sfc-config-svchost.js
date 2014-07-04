(function () {

  // **** module for sfc config service *****
  var sfcConfigModule = angular.module('sfc.config.svchost', []);

  sfcConfigModule.factory("SfcConfigSvc", function (ServiceFunctionSvc, ServiceNodeSvc, ServiceChainSvc) {

    // replace placeholder formatting helper function; usage:  format("... {0} {1}", arg0, arg1);
    var format = function () {
      var template = arguments[0],
        templateArgs = arguments,
        stringify = function (obj) {
          if (typeof obj === 'function') {
            return obj.toString().replace(/ \{[\s\S]*$/, '');
          } else if (typeof obj === 'undefined') {
            return 'undefined';
          } else if (typeof obj !== 'string') {
            return JSON.stringify(obj);
          }
          return obj;
        },
        message;

      message = template.replace(/\{\d+\}/g, function (match) {
        var index = +match.slice(1, -1), arg;

        if (index + 1 < templateArgs.length) {
          arg = templateArgs[index + 1];
          return stringify(arg);
        }

        return match;
      });

      return message;
    };

    var SF_PARSE = "\\{\\s*\"service-functions\"\\s*:\\s*\\{[\\w\\W]*\\]\\s*\\}\\s*\\}";
    var SN_PARSE = "\\{\\s*\"service-nodes\"\\s*:\\s*\\{[\\w\\W]*\\]\\s*\\}\\s*\\}";
    var SFC_PARSE = "\\{\\s*\"service-function-chains\"\\s*:\\s*\\{[\\w\\W]*\\]\\s*\\}\\s*\\}";

    var svc = {};

    // synchronously send PUT requests based on data in 'pool' array
    svc.applyConfigPool = function (pool, finalCallback) {

      var callback = function (response, container) {
        try {
          if (response) {
            throw new Error(format("status code: {0}, for PUT object:\n{1}", response.status, container));
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
        finalCallback(null);       // done
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
        // todo - validation

        pool.push({model: "sf", container: parsedJson});

      } catch (e) {
        throw new Error(e);
      }

      return true;
    };

    // check for SF json, and in case store in pool
    svc.processSN = function (token, pool) {

      var regexp = new RegExp(SN_PARSE);

      var match = regexp.exec(token);

      if (!match || match === null) {
        return false;
      }

      try {
        var parsedJson = $.parseJSON(match);

        // todo - validation

        pool.push({model: "sn", container: parsedJson});
      } catch (e) {
        throw new Error(e);
      }

      return true;
    };

    // check for SF json, and in case store in pool
    svc.processSFC = function (token, pool) {

      var regexp = new RegExp(SFC_PARSE);

      var match = regexp.exec(token);

      if (!match || match === null) {
        return false;
      }
      try {
        var parsedJson = $.parseJSON(match);
        //var parsedJson = angular.fromJson(match);

        // todo - validation

        pool.push({model: "sfc", container: parsedJson});

      } catch (e) {
        throw new Error(e);
      }
      return true;
    };

    // main exported function
    svc.processGeneral = function (fileContent) {

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
              throw new Error(format("Error in input - unsupported object:\n {0}", token));
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
      processGeneral: svc.processGeneral
    };

  });


  // **** service: SfcFileReaderSvc ****
  sfcConfigModule.factory("SfcFileReaderSvc",
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

      var readAsText = function (file, scope) {
        $log.debug(file);

        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        reader.readAsText(file);

        return deferred.promise;
      };

      // export
      return {
        readAsText: readAsText
      };
    }]);


}());
