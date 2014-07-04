(function () {

  // **** module for sfc config service *****
  var module = angular.module('sfc.schemas.svchost', []);

  var IPV4_REGEXP_PATTERN = "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$";

  var SCHEMAS = {};

  module.factory("SfcJsonSchemasSvc", function () {

    var getSchemasForRevision = function (revision) {
      return SCHEMAS[revision];
    };

    // exports
    return {
      getSchemasForRevision: getSchemasForRevision
    };

  });

  // define json schema for revision 'sfc-rev-2014-06-30'
  module.config(function () {
      var SF_SCHEMA = {

        "$schema": "http://json-schema.org/draft-03/schema#",
        "id": "urn:cisco:params:xml:ns:yang:sfc-sf/service-functions",
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

                  properties: {
                    "ip-mgmt-address": {
                      "type": "string",
                      "pattern": IPV4_REGEXP_PATTERN,
                      "optional": true
                    },
                    "type": {
                      "type": "string",
                      "optional": false
                    },
                    "name": {
                      "type": "string",
                      "optional": false
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
      };

      var SFC_SCHEMA = {
        "$schema": "http://json-schema.org/draft-03/schema#",
        "id": "urn:cisco:params:xml:ns:yang:sfc-sf/service-function-chains",
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

                    "service-function-type": {
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
      };

      var SN_SCHEMA = {
        "$schema": "http://json-schema.org/draft-03/schema#",
        "id": "urn:cisco:params:xml:ns:yang:sfc-sf/service-nodes",
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
      };

      SCHEMAS['sfc-rev-2014-06-30'] = {
        SF_SCHEMA: SF_SCHEMA,
        SFC_SCHEMA: SFC_SCHEMA,
        SN_SCHEMA: SN_SCHEMA
      };
    }

  );


}());