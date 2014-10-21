define(['app/eline/eline.module'], function(eline) {

  eline.register.factory('ElineConfigRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
    });
  });


  eline.register.factory('ElineSvcResponse', function($http, ElineConfigRestangular) {

      var baseUrl = ElineConfigRestangular.configuration.baseUrl;
      var headers = {'Content-Type': 'application/yang.data+xml', 'Accept': 'application/yang.data+json'};

      var processRequest = function(method, url, data, callback, errorCbk) {
          console.debug('REQUEST:', method, 'to', url, 'data', data);
          
          $http({method: method, url: baseUrl + url, data: data, headers: headers})
          .success(function (data, status) {
              console.debug('SUCCESS:', method, 'to', url, 'response:', status, data);
              callback(data);
          })
          .error(function (data, status) {
              console.debug('ERROR:', method, 'to', url, 'response:', status, data);
              errorCbk(data);
          });
      };

      return processRequest;
  });

  eline.register.factory('ElineUtils', function() {

      var utils = {};

      var conditionProperties = function(ep1, ep2, propList) {
          return propList.every(function(p) {
              return (ep1[p] === ep2[p]) && ( ep1[p] !== null && ep2[p] !== null ) && ( ep1[p] !== undefined && ep2[p] !== undefined );
          });
      };

      var matchEpData = function(ep1, ep2) {
          var cMac = conditionProperties(ep1, ep2, ['mac-address']),
              cIp = conditionProperties(ep1, ep2, ['ip-address']),
              cRc = conditionProperties(ep1, ep2, ['remote-id', 'circuit-id']),
              cSpv = conditionProperties(ep1, ep2, ['switch', 'port','vlan']);

          return cMac || cIp || cRc || cSpv;
      };

      var matchSingleEndpoint = function(epToMatch, epList) {
          return epList.filter(function(ep) {
              return matchEpData(epToMatch, ep);
          });
      };
      
      utils.matchEndpoints = function(provisionData, endpointsData) {
        // console.log('for test',provisionData, endpointsData);
          var provisionEps = [],
              srcEndpoints = endpointsData.filter(function(ep) {
                  return ep.hasOwnProperty('matched') === false;
              });

          Object.keys(provisionData).forEach(function(elId) {
              if(provisionData[elId].ep1.hasOwnProperty('matched') === false) {
                  provisionEps.push(provisionData[elId].ep1);
              }
              if(provisionData[elId].ep2.hasOwnProperty('matched') === false) {
                  provisionEps.push(provisionData[elId].ep2);
              }
          });

          provisionEps.forEach(function(epPd) {
              var matchedEp = matchSingleEndpoint(epPd, srcEndpoints);

              if(matchedEp.length) {
                  epPd.matched = matchedEp[0]['endpoint-id'];
                  matchedEp[0].matched = epPd['endpoint-id'];
              }
          });
      };

      utils.convertBase64toHex = function(string){
        var hD='0123456789ABCDEF',
            dec2hex = function(d) {
                var h = hD.substr(d&15,1);
                while (d>15) {
                    d>>=4;
                    h=hD.substr(d&15,1)+h;
                }
                h = h.toLowerCase();
                return h;
            },
            keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            base64_decode = function(input) {
                var output = [];
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;

                var orig_input = input;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                if (input.length % 4) {
                    return "";
                }
                
                var j=0;
                while (i < input.length) {

                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    
                    output[j++] = chr1;
                    if (enc3 != 64) {
                      output[j++] = chr2;
                    }
                    if (enc4 != 64) {
                      output[j++] = chr3;
                    }
                      
                }
                return output;
            },
            convert = function(string){
                var output = base64_decode(string),
                    separator = "-0x",
                    hexText = "";
                
                for (i=0; i<output.length; i++) {
                  hexText = hexText + (i === 0 ? '0x': separator) + (output[i]<16?"0":"") + dec2hex(output[i]);
                }

                return hexText;
            };

        return convert(string);
    };

    utils.convertHexToBase64 = function(string){
      var clean_hex = function(input, remove_0x) {
          input = input.toUpperCase();
          
          if (remove_0x) {
            input = input.replace(/0x/gi, "");        
          }
          
          var orig_input = input;
          input = input.replace(/[^A-Fa-f0-9]/g, "");
          if (orig_input != input){
              // alert ("Warning! Non-hex characters in input string ignored.");
          }

          // console.log(input);
          return input;    
      },
      base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      binary_to_base64 = function(input) {
        var ret = [];
        var i = 0;
        var j = 0;
        var char_array_3 = [];
        var char_array_4 = [];
        var in_len = input.length;
        var pos = 0;
    
        while (in_len--)
        {
            char_array_3[i++] = input[pos++];
            if (i == 3)
            {
                char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
                char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
                char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
                char_array_4[3] = char_array_3[2] & 0x3f;
    
                for (i = 0; (i <4) ; i++){
                    ret += base64_chars.charAt(char_array_4[i]);
                }
                i = 0;
            }
        }
    
        if (i)
        {
            for (j = i; j < 3; j++){
              char_array_3[j] = 0;
            }
    
            char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
            char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
            char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
            char_array_4[3] = char_array_3[2] & 0x3f;
    
            for (j = 0; (j < i + 1); j++){
                ret += base64_chars.charAt(char_array_4[j]);
            }
    
            while ((i++ < 3)){
                ret += '=';
            }
    
        }
    
        return ret;
      },
      convert = function(string) {
        var cleaned_hex = clean_hex(string, true);

        if (cleaned_hex.length % 2) {
          // alert ("Error: cleaned hex string length is odd.");
          return 'error';
        }
        var binary = [];
        for (var i=0; i<cleaned_hex.length/2; i++) {
          var h = cleaned_hex.substr(i*2, 2);
          binary[i] = parseInt(h,16);        
        }
        return binary_to_base64(binary);
      };

      return convert(string);

    };

      var addSingleEp = function(epToAdd, target) {
          if(target.every(function(ep) {
              return matchEpData(ep, epToAdd) === false;
          }) ) {
              target.push(epToAdd);
          }
      };

      utils.addEndpoints = function(existing, epsToAdd) {
          epsToAdd.forEach(function(ep) {
              addSingleEp(ep, existing);
          });
      };

      // utils.getEndpointById = function(epId, endpoints) {
      //     return epsToAdd.filter(function(ep) {
      //         return endpoints['endpoint-id'] === epId;
      //     })[0];
      // };

      utils.deleteDisconnectedElines = function(upElineIds, provisionedElines) {
          Object.keys(provisionedElines).forEach(function(elineId) {
              if(upElineIds.indexOf(elineId) === -1 && provisionedElines.hasOwnProperty(elineId)) {
                  delete provisionedElines[elineId];
              }
          });
      };

      utils.deleteDisconnectedEndpoints = function(upEpIds, endpoints) {
          for(var i=0; i<endpoints.length;) {
              var ep = endpoints[i];

              if(upEpIds.indexOf(ep['endpoint-id']) === -1 && !ep.hasOwnProperty('static')) {
                  endpoints.splice(i, 1);
              } else {
                  i += 1;
              }
          }
      };

      return utils;
  });

  eline.register.factory('ElineSvc', function(ElineConfigRestangular, ElineSvcResponse, ElineUtils) {
    var handler = ElineSvcResponse; 
    var elineServiceType = 'service-eline:eline-service';

    var parseEpStatusObj = function(epStatusObj) {
        var parseRidCid = function(srcObj) {
                var rid = srcObj.hasOwnProperty('remote-id') ? srcObj['remote-id'] : null,
                    cid = srcObj.hasOwnProperty('circuit-id') ? srcObj['circuit-id'] : null;

                return { rid: rid, cid: cid };
            },
            parseSPV = function(srcObj) {
                var s = null,
                    p = null,
                    v = null;

                //TODO data?

                return { switch: s, port: p, vlan: v };
            },
            parseIpAddress = function(srcObj) {
                var ipaddr = null;
                if(srcObj.hasOwnProperty('ce-id') && srcObj['ce-id'].hasOwnProperty('ce-ip')) {
                    ipaddr = srcObj['ce-id']['ce-ip'];
                }
                return ipaddr;
            },
            parseMacAddress = function(srcObj) {
                var macaddr = null;
                if(srcObj.hasOwnProperty('ce-id') && srcObj['ce-id'].hasOwnProperty('ce-mac')) {
                    macaddr = srcObj['ce-id']['ce-mac'];
                }
                return macaddr;
            },
            parseStatus = function(srcObj) {
                var status = true; // TODO find out where to get status from
                return status;
            },
            ridcidParsed = parseRidCid(epStatusObj),
            spvParsed = parseSPV(epStatusObj),
            e = {
                'endpoint-id': epStatusObj['attach-id'],
                'remote-id': ridcidParsed.rid,
                'circuit-id': ridcidParsed.cid,
                'ip-address': parseIpAddress(epStatusObj),
                'mac-address': parseMacAddress(epStatusObj),
                'switch': spvParsed.switch,
                'port': spvParsed.port,
                'vlan': spvParsed.vlan,
                'status': parseStatus(epStatusObj)
            };

        return e;
    };

    var parseElinesStatusObj = function(elinesStatusObj) {
        var o = elinesStatusObj.filter(function(service) {
            return service['service-type'].indexOf(elineServiceType) > -1 && service.endpoint.length === 2;
        }).map(function(eline) {
            var obj = { ep1: eline.endpoint[0], 
                        ep2: eline.endpoint[1],
                        status: eline['service-status:status'] === 'up' ? true : false};

            if ( obj.ep1.hasOwnProperty('circuit-id') && obj.ep1.hasOwnProperty('remote-id') ) {
              obj.ep1['circuit-id'] = ElineUtils.convertBase64toHex(obj.ep1['circuit-id']);
              obj.ep1['remote-id'] = ElineUtils.convertBase64toHex(obj.ep1['remote-id']);
            }

            if ( obj.ep2.hasOwnProperty('circuit-id') && obj.ep2.hasOwnProperty('remote-id') ) {
              obj.ep2['circuit-id'] = ElineUtils.convertBase64toHex(obj.ep2['circuit-id']);
              obj.ep2['remote-id'] = ElineUtils.convertBase64toHex(obj.ep2['remote-id']);
            }

            return {id: eline['service-id'], data: obj};
        });

        return o;
    };

    var getEpObjToRequestString = function(epObj) {
        return '<endpoint>'+Object.keys(epObj).map(function(p) {
          return '<'+p+'>'+epObj[p]+'</'+p+'>';
        }).join('\n')+'</endpoint>';
    };

    var printCbk = function(data) {
        console.info('got data', data);
    };

    var svc = {};

    svc.create_eline = function(provisionInfo, callback, errorCbk) {
        var reqData = provisionInfo.map(function(data) {
              return '<service-instance xmlns=\"urn:cisco:params:xml:ns:yang:service-instance\">\n'+
                         '<service-id>'+data.elineId+'</service-id>\n'+
                         '<service-type xmlns:x=\"urn:cisco:params:xml:ns:yang:service-eline\">'+elineServiceType+'</service-type>\n'+
                           getEpObjToRequestString(data.ep1)+'\n'+getEpObjToRequestString(data.ep2)+'\n'+
                      '</service-instance>';
            });

        reqData.forEach(function(req) {
            var response = handler('POST', '/restconf/config/service-instance:service-instances', req, callback, errorCbk);
        });
        
    };

    svc.get_eline_status = function(callback, errorCbk) {
        var successCallback = function(data) {
          if (data.hasOwnProperty('service-instances') &&
              data['service-instances'].hasOwnProperty('service-instance') &&
              data['service-instances']['service-instance'] instanceof Array) {

            callback(parseElinesStatusObj(data['service-instances']['service-instance']));
          }
        };

        var requestData = '',
            response = handler('GET', '/restconf/config/service-instance:service-instances', requestData, successCallback, errorCbk);
    };

    svc.get_odl_status = function(callback, errorCbk) {
        var successCallback = function(responseObj) {
            if(responseObj.hasOwnProperty('nodes') && responseObj.nodes.hasOwnProperty('node') && 
               responseObj.nodes.node instanceof Array) {
                var nodes = responseObj.nodes.node.map(function(nodeObj) {
                    return { id: nodeObj.id, status: nodeObj['netconf-node-inventory:connected']};
                });

                callback(nodes);
            } else {
                console.log('no nodes found');
            }
        };

        var requestData = '',
            response = handler('GET', '/restconf/operational/opendaylight-inventory:nodes', requestData, successCallback, errorCbk);
    };

    svc.get_ep_status = function(callback, errorCbk) {
        var successCallback = function(responseObj) {
            if(responseObj.hasOwnProperty('output') && responseObj.output.hasOwnProperty('statuses') && 
               responseObj.output.statuses instanceof Array) {
                // console.info(responseObj);
                var endpointList = responseObj.output.statuses.map(function(statusObj) {
                    return parseEpStatusObj(statusObj);
                });
                callback(endpointList);
            }
        };
        var requestData = '<get-endpoints-statuses><query>anything</query></get-endpoints-statuses>',
            response = handler('POST', '/restconf/operations/service-status:get-endpoints-statuses', requestData, successCallback, errorCbk);
    };

    svc.add_static_eps = function(eps){
      var staticEPs = [
          {
            'port': '7',
            'status': true,
            'switch': '2',
            'vlan': '101',
            'circuit-id': null,
            'ip-address': null,
            'mac-address': null,
            'remote-id': null,
            'static': true
          },
          {
            'port': '7',
            'status': true,
            'switch': '2',
            'vlan': '102',
            'circuit-id': null,
            'ip-address': null,
            'mac-address': null,
            'remote-id': null,
            'static': true
          },
          {
            'port': '7',
            'status': true,
            'switch': '2',
            'vlan': '103',
            'circuit-id': null,
            'ip-address': null,
            'mac-address': null,
            'remote-id': null,
            'static': true
          }
      ];
      staticEPs.forEach(function(ep){
        eps.push(ep);
      });

      // console.log('eps',eps);
    };

    return svc;

  });

});