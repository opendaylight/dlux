(function () {

  // **** module for sfc config service *****
  var module = angular.module('sfc.schemas.svchost', []);

  var IPV4_REGEXP_PATTERN = "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$";


  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  // FFFFFFFFFFFFFFF SfcSchemaStoreSvc FFFFF
  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  module.factory("SfcSchemaStoreSvc", function () {

    var REVISION_COLLECTIONS = {};

    // func
    getRevisionCollectionForRevision = function (revision) {
      return  REVISION_COLLECTIONS[revision];
    };

    // func - registers new collecion for validation schemas for particular model revision
    getSchemaRegisterFuncForRevision = function (revision) {

      var revisionCollection = REVISION_COLLECTIONS[revision];

      if (revisionCollection) {
        throw new Error('collection already exists!!!');
      }

      // new
      revisionCollection = {
        schemas: [],
        typeForName: {},
        uriForType: {}
      };

      REVISION_COLLECTIONS[revision] = revisionCollection;

      var registerFunc = function (name, data, typeForName) {
        revisionCollection.schemas[name] = data;
        if (typeForName) {
          revisionCollection['typeForName'][name] = typeForName;
        }
      };

      return registerFunc;
    };

    return {
      getRevisionCollectionForRevision: getRevisionCollectionForRevision,
      getSchemaRegisterFuncForRevision: getSchemaRegisterFuncForRevision
    };
  });


  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  // FFFFFFFFFFFFFFF SfcJsonValidationSvc FFFFF
  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  module.factory("SfcJsonValidationSvc", function (SfcSchemaStoreSvc, JsvLoaderSvc) {

    // validate instanceJSON to schema(configured for type [sf, sfc, sn] using configured JSV environment)
    // if environment does not exist yet, create and configure environment for revision
    var sfcValidate = function (instanceJSON, type, revision) {

      var revisionCollection = SfcSchemaStoreSvc.getRevisionCollectionForRevision(revision);

      if (!revisionCollection) {
        throw new Error("revision collection does not exist!");
      }

      var env = revisionCollection.env;

      if (!env) {
        // create new JSV environment
        env = JsvLoaderSvc.getJSV().createEnvironment();

        var schemas = revisionCollection.schemas;

        _.each(_.keys(schemas), function (name) {
          var jsonSchema = env.createSchema(schemas[name], undefined, schemas[name].id);

          if (revisionCollection['typeForName'][name]) {
            var type = revisionCollection['typeForName'][name];
            revisionCollection['uriForType'][type] = jsonSchema._uri;
          }
        });

        // store - cache JSV environment
        revisionCollection.env = env;
      }

      var actualShemaUri = revisionCollection['uriForType'][type];

      var schemaJSON = env.findSchema(actualShemaUri);

      return env.validate(instanceJSON, schemaJSON);
    };

    // exports
    return {
      sfcValidate: sfcValidate
    };

  });

  // register json validation schemas for revision 'sfc-rev-2014-07-01'
  module.run(function (SfcSchemaStoreSvc) {

    var registerFunc = SfcSchemaStoreSvc.getSchemaRegisterFuncForRevision("sfc-rev-2014-07-01");

    // locator
    registerFunc("SL_DATA_PLANE_LOCATOR_SCHEMA_CASE_IP_14_07_01", {

      "$schema": "http://json-schema.org/draft-03/schema#",
      "id": "#sfc-sl:data-plane-locator:case-ip",
      "type": "object",

      "properties": {
        "ip": {
          "type": "string",
          "pattern": IPV4_REGEXP_PATTERN,
          "optional": false
        },

        "port": {
          "type": "number",
          "optional": false
        }
      },
      additionalProperties: false
    });

    // locator
    registerFunc("SL_DATA_PLANE_LOCATOR_SCHEMA_14_07_01", {

      "$schema": "http://json-schema.org/draft-03/schema#",
      "id": "#sfc-sl:data-plane-locator",
      "type": [
        {"$ref": "#sfc-sl:data-plane-locator:case-ip"}
      ]  // choice locator-type
    });

    // sf-entry
    registerFunc("SF_ENTRY_SCHEMA_14_07_01", {

      "$schema": "http://json-schema.org/draft-03/schema#",
      "id": "#sfc-sf:service-function-entry",
      "type": "object",

      properties: {

        "name": {
          "type": "string",
          "optional": false
        },

        "type": {
          "type": "string",
          "optional": false
        },

        "ip-mgmt-address": {
          "type": "string",
          "pattern": IPV4_REGEXP_PATTERN,
          "optional": true
        },

        "sf-data-plane-locator": {
          "$ref": "#sfc-sl:data-plane-locator",
          "optional": true
        },

        "service-function-forwarder": {
          "type": "string",
          "optional": true
        }

      },

      additionalProperties: false
    });

    // main sf
    registerFunc("SF_SERVICE_FUNCTIONS_SCHEMA_14_07_01", {

      "$schema": "http://json-schema.org/draft-03/schema#",
      "id": "#sfc-sf:service-functions",
      "type": "object",
      "properties": {

        "service-functions": {
          "type": "object",
          "optional": false,
          "properties": {

            "service-function": {
              "type": "array",
              "optional": false,
              "items": {
                "$ref": "#sfc-sf:service-function-entry"
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }, "sf");


    registerFunc("SFC_SCHEMA_14_07_01", {
      "$schema": "http://json-schema.org/draft-03/schema#",
      "id": "#sfc-sfc:service-function-chains",
      "type": "object",
      "properties": {

        "service-function-chains": {
          "type": "object",
          "optional": false,
          "properties": {

            "service-function-chain": {
              "type": "array",
              "optional": false,
              "items": {

                properties: {
                  "name": {
                    "type": "string",
                    "optional": false
                  },

                  "sfc-service-function": {
                    "type": "array",
                    "optional": false,
                    "items": {

                      "properties": {
                        "name": {
                          "type": "string",
                          "optional": false
                        },

                        "type": {
                          "type": "string",
                          "optional": false
                        }
                      },
                      additionalProperties: false
                    }
                  },

                  "sfc-service-function-path" : {
                    "type" : "array",
                    "optional": true,
                    "items": {
                      "type": "string"
                    }
                  }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }, "sfc");

    registerFunc("SN_SCHEMA_14_07_01", {
      "$schema": "http://json-schema.org/draft-03/schema#",
      "id": "#sfc-sn:service-nodes",
      "type": "object",
      "properties": {

        "service-nodes": {
          "type": "object",
          "optional": false,
          "properties": {

            "service-node": {
              "type": "array",
              "optional": false,
              "items": {

                properties: {
                  "name": {
                    "type": "string",
                    "optional": false
                  },

                  "ip-mgmt-address": {
                    "type": "string",
                    "pattern": IPV4_REGEXP_PATTERN,
                    "optional": false
                  },

                  "service-function": {
                    "type": "array",
                    "optional": false,
                    "items": {
                      "type": "string"
                    }
                  }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }, "sn");

  });


  // **** service: JsvLoaderSvc ****
  module.factory("JsvLoaderSvc", function ($q) {

    var validator = null;

    // loads the library with dependencies, returns promise with future JSV object
    var loadValidator = function () {
      var deferred = $q.defer();

      if (!validator) {

        // load only once
        require(['assets/js/jsv/uri'], function () {
          require(['assets/js/jsv/urn'], function () {
            require(['assets/js/jsv/jsv'], function () {
              require([/*'assets/js/jsv/json-schema-draft-01', 'assets/js/jsv/json-schema-draft-02',*/ 'assets/js/jsv/json-schema-draft-03'], function () {
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
      return null;
    };

    loadValidator(); // launch loading asynchronously!!!

    // service exports
    return {
      loadValidator: loadValidator,
      getJSV: getJSV
    };
  });


}());