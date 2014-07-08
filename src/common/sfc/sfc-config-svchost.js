(function () {

  // **** module for sfc config service *****
  var module = angular.module('sfc.config.svchost', ['sfc.schemas.svchost']);

  module.factory("SfcConfigSvc", function (SfcJsonSchemasSvc, JsonSchemaValidatorSvc, ServiceFunctionSvc, ServiceNodeSvc, ServiceChainSvc) {

    var sfcModelRevision = "sfc-rev-2014-06-30";

    var sfcModelJsonSchemas =  SfcJsonSchemasSvc.getSchemasForRevision(sfcModelRevision);

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

    // synchronously (thru recursive callbacks) send PUT requests based on data in 'pool' array
    svc.applyConfigPool = function (pool, finalCallback) {

      // define common callback fn after REST operation
      var callback = function (response, containerData) {
        try {
          if (response) {
            throw new Error(format("status code: {0}, for PUT opration:\n\n{1}\n\n{2}", response.status, containerData, response.data));
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


    // throws exception with formatted message in case of invalid json
    svc.checkJsonSchema = function (dataObject, jsonSchema) {
      var env = JsonSchemaValidatorSvc.getJSV().createEnvironment();
      var report = env.validate(dataObject, jsonSchema);

      // check
      if (report.errors.length === 0) {
        //JSON is valid against the schema - OK
      } else {

        var error = report.errors[0];
        var schemaId = jsonSchema.id;
        var schemaUri = error.schemaUri;
        var message = error.message;
        var detail = error.detail || '';
        var path = schemaUri.replace(new RegExp("^[\\w\\W]*" + _.str.escapeRegExp(schemaId)), "")
          .replace(new RegExp("/items/properties", "g"), "").replace(new RegExp("/properties", "g"), "");

        throw new Error(format("Does not validate to schema: input:\n{0}\n\n{1} : {2}\n\ndetail: {3}", dataObject, path, message, detail));
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
        svc.checkJsonSchema(parsedJson, sfcModelJsonSchemas.SF_SCHEMA);

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
        svc.checkJsonSchema(parsedJson, sfcModelJsonSchemas.SN_SCHEMA);

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
        svc.checkJsonSchema(parsedJson, sfcModelJsonSchemas.SFC_SCHEMA);

        pool.push({model: "sfc", container: parsedJson});

      } catch (e) {
        throw e;
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

    svc.loadValidator = function () {
      return JsonSchemaValidatorSvc.loadValidator();
    };

    // export
    return {
      processGeneral: svc.processGeneral,
      loadValidator: svc.loadValidator
    };

  });


  // **** service: SfcFileReaderSvc ****
  module.factory("SfcFileReaderSvc",
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


  // **** service: JsonSchemaValidator ****
  module.factory("JsonSchemaValidatorSvc", function ($q) {

    var validator = null;

    // loads the library with dependencies, returns promise with future JSV object
    var loadValidator = function () {
      var deferred = $q.defer();

      if (!validator) {

        // load only once
        require(['assets/js/jsv/uri'], function () {
          require(['assets/js/jsv/urn'], function () {
            require(['assets/js/jsv/jsv'], function () {
              require(['assets/js/jsv/json-schema-draft-01', 'assets/js/jsv/json-schema-draft-02', 'assets/js/jsv/json-schema-draft-03'], function () {
                validator = exports.JSV;
                deferred.resolve(validator);
              });
            });
          });
        });

      } else {
        deferred.resolve(validator);
      }

      return deferred.promise;
    };


    // returns JSV object
    var getJSV = function () {
      if (validator !== null) {
        return validator;
      } else {
        alert("JSV probably not fully loaded yet!");
      }
    };

    loadValidator(); // launch loading asynchronously!!!

    // service exports
    return {
      loadValidator: loadValidator,
      getJSV: getJSV
    };
  });


}());
