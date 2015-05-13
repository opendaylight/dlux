define(['app/gbp/gbp.module'], function(gbp) {

    gbp.register.factory('GBPRestangular', function(Restangular, ENV) {
        return Restangular.withConfig(function(RestangularConfig) {
            RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
        });
    });

    gbp.register.factory('GBPConstants', function() {
        var c = { colors: {}, strings: {}};

        c.strings.flood = 'flood';
        c.strings.bridge = 'bridge';
        c.strings.l3ctx = 'l3ctx';
        c.strings.subnet = 'subnet';

        c.strings.config = 'CONFIG';
        c.strings.oper = 'OPERATIONAL';
        c.strings.l2l3 = 'L2L3';
        c.strings.mock = 'MOCK';
        c.strings.sigmaTopoDefaultText = 'SIGMATOPODEFAULTTEXT';
        c.strings.sigmaTopoDefault = 'SIGMATOPODEFAULTTEXT';

        c.colors[c.strings.flood] = '#DF0101';
        c.colors[c.strings.bridge] = '#0080FF';
        c.colors[c.strings.l3ctx] = '#3ADF00';
        c.colors[c.strings.subnet] = '#FF9933';
        c.colors[c.strings.sigmaTopoDefaultText] = '#fff';

        c.colors[c.strings.flood+'-'+c.strings.bridge] = '#6666FF';
        c.colors[c.strings.bridge+'-'+c.strings.l3ctx] = '#6666FF';

        c.colors[c.strings.subnet+'-'] = '#6666FF';

        return c;
    });

    gbp.register.factory('MockServices', function() {

        var ms = {};

        ms.mockTopoData = function() {
            var lid = 0,
                nodeRaw = [0, 1, 2, 3],
                linkRaw = [[0, 1], [2, 3], [3, 0], [0, 3]],
                nodes = nodeRaw.map(function(data) {
                    return {
                                'id': 'n' + data,
                                'label': 'LABEL'+data,
                                'size': 3,
                                'x': Math.random(),
                                'y': Math.random(),
                                'color': GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault]
                            };
                }),
                links = linkRaw.map(function(data) {
                    var obj = {
                                id: 'e' + lid,
                                source: 'n' + data[0],
                                target: 'n' + data[1],
                                color: GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault]
                            };
                    lid = lid + 1;
                    return obj;
                });

            return {nodes: nodes, links: links};
        };

        return ms;
    });

    gbp.register.factory('TopologyDataLoaders', function(GBPRestangular, GBPConstants) {
        var tdl = {};

        tdl.getSubjectsBetweenEndpointGroups = function(storage, tenantId, successCbk, errorCbk) {
            var restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'ui-backend:get-subjects-between-endpoint-groups',
                reqData = { "input": { "tenant-id": tenantId }};

            if(storage) {
                reqData.input['from-oper-data'] = {};
            }

            restObj.post(rpcRes, reqData).then(function(data) {
                // console.info('got data', data.output);
                successCbk(data);
            }, function(res) {
                errorCbk(res);
            });
        };

        //Policies are representing links in PGN topology
        tdl.getGroupRulesBetweenEndpointGroups = function(successCbk, errorCbk) {
            var restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'pgn-application:get-group-rules-between-endpoint-groups',
                reqData = { "input": { "endpoint-group-pair":[] }};

            restObj.post(rpcRes, reqData).then(function(data) {
                successCbk(data); //set topology links
            }, function(res) {
                errorCbk(res);
            });
        };

        //Groups are representing nodes in PGN topology
        tdl.getEndpointGroups = function(successCbk, errorCbk) {
            var tenantId = getId(idTypes.tenant),
                restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'pgn-application:get-endpoint-groups',
                reqData = {
                            "input": {
                                "endpoint-group-id":[
                                    {
                                        "pgn-application:tenant-id": tenantId
                                    }
                                ]
                            }
                        };

          restObj.post(rpcRes, reqData).then(function(data) {
              successCbk(data); //set topology nodes
          }, function(res) {
              errorCbk(res);
          });

        };

        tdl.getEpgTopo = function(data){
            var epgData = data.output['endpoint-group-pair-with-subject'],
                nodes = [],
                edges = [],
                setNode = function(obj){
                    var nodeObj = {
                            'id': 'n' + nodes.length,
                            'label': obj.type + ':' + obj.name,
                            'name': obj.name,
                            'size': 1,
                            'x': Math.random(),
                            'y': Math.random(),
                            'color': GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault]/*,
                            'type' : getNodeType(obj.type)*/
                        };

                    nodes.push(nodeObj);
                    return nodeObj.id;
                },
                setEdge = function(sourceId, destId, data) {
                    var obj = {
                            'id': 'e' + edges.length,
                            'source': sourceId,
                            'target': destId,
                            'color': GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault],
                            'data': data
                            // 'type': 'curve',
                            // 'size' : 100
                        };

                    edges.push(obj);
                },
                getObjByProp = function(val, prop, list) {
                    return list.filter(function(i){
                        return i[prop] === val;
                    });
                };
                

            epgData.forEach(function(e){

                var cepgnId = null,
                    pepgnId = null;

                
                if ( !getObjByProp(e['consumer-endpoint-group-id'],'name', nodes).length ) {
                    // epgArray.push(e['consumer-endpoint-group-id']);
                    var objCepg = {
                        type: 'epg',
                        name: e['consumer-endpoint-group-id']
                    };
                    cepgnId = setNode(objCepg);
                } else {
                    cepgnId = getObjByProp(e['consumer-endpoint-group-id'],'name', nodes)[0].id;
                }

                if ( !getObjByProp(e['provider-endpoint-group-id'],'name', nodes).length ) {
                    var objPepg = {
                        type: 'epg',
                        name: e['provider-endpoint-group-id']
                    };
                    pepgnId = setNode(objPepg);
                } else {
                    pepgnId = getObjByProp(e['provider-endpoint-group-id'],'name', nodes)[0].id;
                }

                if ( cepgnId && pepgnId ) {
                    setEdge(cepgnId, pepgnId, e['ui-subject']);
                }

            });
            
            // console.log('nodes', nodes);
            // console.log('edges', edges);

            return {
                nodes: nodes,
                links: edges
            };
        };

        
        tdl.getL2L3 = function(storage, tenantId, successCbk, errorCbk) {
            //l2-bridge-domain
            var lid = 0,
                nid = 0,
                getL2L3Label = function(node) {
                    return node.id + (node.name ? ':' + node.name : '');
                },
                getSubnetLabel = function(node) {
                    return node.id + (node['ip-prefix'] ? ':' + node['ip-prefix'] : '');
                },
                getNodeColor = function(src) {
                    return GBPConstants.colors[src] || GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault];
                },
                getLinkColor = function(from, to) {
                    return GBPConstants.colors[from+'-'+to] || GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault];
                },
                getNodes = function(data, srcDesc, getLabelCbk) {
                    var nodes = data.map(function(elem) {
                        var obj = {
                            'id': 'n' + nid,
                            'label': getLabelCbk(elem),
                            'uuid': elem.id,
                            'size': 3,
                            'x': Math.random(),
                            'y': Math.random(),
                            'color': getNodeColor(srcDesc)
                        };

                        nid += 1;
                        return obj;
                    });

                    return nodes;
                },
                getLinks = function(data, srcNodes, targetNodes, fromDesc, toDesc) {
                    var findByUUID = function(array, uuid) {
                        return array.filter(function(elem) {
                            return elem.uuid === uuid;
                        })[0];
                    };

                    var links = data.map(function(elem) {
                        var obj = null,
                            src = findByUUID(srcNodes, elem.id),
                            trg = findByUUID(targetNodes, elem.parent);

                        if(src && trg) {
                            obj = {
                                'id': 'e' + lid,
                                'source': src.id,
                                'target': trg.id,
                                'color': getLinkColor(fromDesc, toDesc)
                            };
                            lid += 1;
                        }

                        return obj;
                    }).filter(function(elem) {
                        return elem !== null;
                    });

                    return links;
                };

            restObj = GBPRestangular.one('restconf').one(storage).one('policy:tenants').one('tenant').one(tenantId);

            restObj.get().then(function(data) {
                var l2FloodNodes = getNodes(data.tenant[0]['l2-flood-domain'] || [], GBPConstants.strings.flood, getL2L3Label),
                    l2BridgeNodes = getNodes(data.tenant[0]['l2-bridge-domain'] || [], GBPConstants.strings.bridge, getL2L3Label),
                    l3ContextNodes = getNodes(data.tenant[0]['l3-context'] || [], GBPConstants.strings.l3ctx, getL2L3Label),
                    subnetNodes = getNodes(data.tenant[0]['subnet'] || [], GBPConstants.strings.subnet, getSubnetLabel),
                    l2FloodLinks = getLinks(data.tenant[0]['l2-flood-domain'] || [], l2FloodNodes, l2BridgeNodes, GBPConstants.strings.flood, GBPConstants.strings.bridge),
                    l2BridgeLinks = getLinks(data.tenant[0]['l2-bridge-domain'] || [], l2BridgeNodes, l3ContextNodes, GBPConstants.strings.bridge, GBPConstants.strings.l3ctx),
                    subnetLinks = getLinks(data.tenant[0]['subnet'] || [], subnetNodes, l2BridgeNodes.concat(l2FloodNodes).concat(l3ContextNodes), GBPConstants.strings.subnet, ''),
                    allNodes = l2BridgeNodes.concat(l2FloodNodes).concat(l3ContextNodes).concat(subnetNodes),
                    allLinks = l2BridgeLinks.concat(l2FloodLinks).concat(subnetLinks);

                successCbk(allNodes, allLinks);
            }, function(res) {
                errorCbk(res.data, res.status);
            });
        };

        return tdl;

    });

    gbp.register.factory('TopoServices', function(TopologyDataLoaders, MockServices, GBPConstants) {

        var ts = {};

        var loaders = {};

        var legends = {};

        var transformPGNTopoNodes = function(data) {
            return data.output['endpoint-group'].map(function(d) {
                return {
                    id: d.id,
                    group: d.name,
                    sgt: d['security-group-tag']
                };
            });
        };

        var transformPGNTopoLinks = function(data) {
            return data.output['endpoint-group-pair-with-rules'].map(function(d) {
                return {
                    source: d['provider-group-id'],
                    target: d['consumer-group-id'],
                    policy: d['group-rule'][0]['action-ref'].map(function(r) {
                        return r.name;
                    })
                };
            });
        };

        var gbpLegend = {
            'epg' : GBPConstants.colors[GBPConstants.strings.sigmaTopoDefault]
        };

        legends[GBPConstants.strings.empty] = {};
        legends[GBPConstants.strings.config] = gbpLegend;
        legends[GBPConstants.strings.oper] = gbpLegend;
        legends[GBPConstants.strings.mock] = gbpLegend;
        legends[GBPConstants.strings.l2l3] = {
            'l2-flood': GBPConstants.colors[GBPConstants.strings.flood],
            'l2-bridge': GBPConstants.colors[GBPConstants.strings.bridge],
            'l3-context': GBPConstants.colors[GBPConstants.strings.l3ctx],
            'subnet': GBPConstants.colors[GBPConstants.strings.subnet],
            'link': GBPConstants.colors[GBPConstants.strings.subnet+'-']
        };

        loaders[GBPConstants.strings.empty] = function(successCbk, errorCbk) {
            successCbk([], []);
        };

        loaders[GBPConstants.strings.config] = function(successCbk, errorCbk, args) {
            var storage = args.storage || 'config',
                tenantId = args.tenantId;
                
       
            TopologyDataLoaders.getSubjectsBetweenEndpointGroups(false, tenantId, function(data){
                var topo = TopologyDataLoaders.getEpgTopo(data);
                successCbk(topo.nodes, topo.links);
                //successCbk
            }, errorCbk);
        };

        loaders[GBPConstants.strings.oper] = function(successCbk, errorCbk, args) {
            var storage = args.storage || 'config',
                tenantId = args.tenantId;

            TopologyDataLoaders.getSubjectsBetweenEndpointGroups(true, successCbk, errorCbk);
        };

        loaders[GBPConstants.strings.l2l3] = function(successCbk, errorCbk, args) {
            var storage = args.storage || 'config',
                tenantId = args.tenantId;

            if(storage && tenantId) {
                TopologyDataLoaders.getL2L3(storage, tenantId, successCbk, errorCbk);
            } else {
                //different kind of error
                errorCbk();
            }
        };

        loaders[GBPConstants.strings.mock] = function(successCbk, errorCbk) {
            var data = MockServices.mockTopoData();
            successCbk(data.nodes, data.links);
        };

        ts.getConsProvLabel = function(edge, topo){
            var provName = '',
                conName = '';

            topo.nodes.forEach(function(n){

                if ( edge.source === n.id ) {
                    provName = n.name;
                }

                if ( edge.target === n.id ) {
                    conName = n.name;
                }
            });

            return provName + ':' + conName;
        };

        ts.getLegend = function(type) {
            if(type === null || legends.hasOwnProperty(type) === false) {
                type = GBPConstants.strings.empty;
            }

            return legends[type];
        };

        ts.loadTopology = function(type, successCbk, errorCbk, args) {
            if(type === null || loaders.hasOwnProperty(type) === false) {
                type = GBPConstants.strings.empty;
            }

            loaders[type](successCbk, errorCbk, args);
        };

        return ts;
    });

    gbp.register.factory('GPBServices', function(GBPRestangular) {

        var s = {};

        s.getDefinitions = function(successCbk, errorCbk) {
            var restObj = GBPRestangular.one('restconf').one('operational').one('policy:subject-feature-definitions');

            restObj.get().then(function(data) {
                if(data['subject-feature-definitions']) {
                    var classifiersDefs = data['subject-feature-definitions']['classifier-definition'] || [],
                        actionsDefs = data['subject-feature-definitions']['action-definition'] || [];
                        successCbk(classifiersDefs, actionsDefs);
                } else {
                    //TODO log error
                }
            }, function(res) {
                // errorCbk(res);
            });
        };

        s.getUUIDnumber = function() {
            var d = new Date().getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = (d + Math.random()*16)%16 | 0;
                        d = Math.floor(d/16);
                        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                    });
        };

        s.createRestObj = function(storage) {
            storage = storage || 'config';
            restObj = GBPRestangular.one('restconf').one(storage);

            return restObj;
        };

        s.send = function(restObj, reqData, successCbk, errorCbk) {
            restObj.customPUT(reqData).then(function(data) {
                successCbk(data);
            }, function(res) {
                errorCbk(res.data, res.status);
            });
        };

        s.post = function(restObj, reqData, successCbk, errorCbk) {
            restObj.customPOST(reqData).then(function(data) {
                successCbk(data);
            }, function(res) {
                errorCbk(res.data, res.status);
            });
        };

        s.delete = function(restObj, successCbk, errorCbk) {
            restObj.remove().then(function(data) {
                successCbk(data);
            }, function(res) {
                errorCbk(res.data, res.status);
            });
        };

        s.load = function(restObj, transformCallback, successCbk, errorCbk) {
            restObj.get().then(function(data) {
                var objs = transformCallback(data) || [];
                successCbk(objs);
            }, function(res) {
                errorCbk(res.data, res.status);
            });
        };

        s.stripNullValues = function(obj) {
            Object.keys(obj).forEach(function(k) {
                if(obj[k] === null) {
                    delete obj[k];
                }
            });

            return obj;
        };

        s.removeEmptyElementsFromList = function(list) {
            return list.filter(function(e) {
                return e !== "";
            });
        };

        s.createParamObj = function(name, type, value) {
            var obj = { name: name };

            obj[type+'-value'] = value;

            return obj;
        };

        s.getInstanceParamValue = function(param) {
            return param['int-value'] || param['string-value'] || param['range-value'];
        };

        s.getDefinitionObjParams = function(defObj, id) {
            var obj = defObj.filter(function(def) {
                    return def.id === id;
                })[0],
                params = (obj && obj.parameter) ? obj.parameter : [];

            return params;

        };

        return s;

    });

    gbp.register.factory('GBPTenantServices', function(GPBServices) {

        var s = {};

        var Tenant = function(id, name, description) {
            this.id = id || GPBServices.getUUIDnumber();
            this.name = name || null;
            this.description = description || null;
        };

        var createBaseRestObj = function() {
            return GPBServices
                .createRestObj().one('policy:tenants');
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj().one('tenant').one(pathObj.tenantId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new Tenant(rawObj.id, rawObj.name, rawObj.description);
            // });
            return rawData.tenants.tenant;
        };

        var createData = function(obj) {
            return { tenant : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId) {
            return {
                tenantId: tenantId
            };
        };

        s.createObj = function() {
            return new Tenant();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.modify = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(successCbk, errorCbk) {
            var restObj = createBaseRestObj();
            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPContractServices', function(GPBServices) {

        var s = {};

        var Contract = function(id, description, parent) {
            this.id = id || GPBServices.getUUIDnumber();
            this.description = description || null;
            this.parent = parent || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj().one('policy:tenants').one('tenant').one(pathObj.tenantId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('contract').one(pathObj.contractId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new Contract(rawObj.id, rawObj.description);
            // });
            return rawData.tenant[0].contract;
        };

        var createData = function(obj) {
            return { contract : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, contractId) {
            return {
                tenantId: tenantId,
                contractId: contractId
            };
        };

        s.createObj = function() {
            return new Contract();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPClauseServices', function(GPBServices) {

        var s = {};

        var Clause = function(name, subjectRefs) {
            this.name = name || null;
            this['subject-refs'] = subjectRefs || [];
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId)
                .one('contract').one(pathObj.contractId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('clause').one(pathObj.clauseId);
        };

        var transformCallback = function(rawData) {
            var data = null,
                clauseData = rawData.contract[0].clause;

            if(clauseData) {
                data = clauseData.map(function(elem) {
                    if(elem.hasOwnProperty('subject-refs') === false) {
                        elem['subject-refs'] = [];
                    }
                    return elem;
                });
            }

            return data;
        };

        var createData = function(obj) {
            var o = GPBServices.stripNullValues(obj);

            if(o['subject-refs']) {
                o['subject-refs'] = GPBServices.removeEmptyElementsFromList(o['subject-refs']);
            }

            return { clause : [ o ] };
        };

        s.createPathObj = function(tenantId, contractId, clauseId) {
            return {
                tenantId: tenantId,
                contractId: contractId,
                clauseId: clauseId
            };
        };

        s.createObj = function() {
            return new Clause();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPSubjectServices', function(GPBServices) {

        var s = {};

        var Subject = function(name, order) {
            this.name = name || null;
            this.order = order || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId)
                .one('contract').one(pathObj.contractId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('subject').one(pathObj.subjectId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new Subject(rawObj.name, rawObj.order);
            // });
            return rawData.contract[0].subject;
        };

        var createData = function(obj) {
            return { subject : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, contractId, subjectId) {
            return {
                tenantId: tenantId,
                contractId: contractId,
                subjectId: subjectId
            };
        };

        s.createObj = function() {
            return new Subject();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPRuleServices', function(GPBServices) {

        var s = {};

        var Rule = function(name, order) {
            this.name = name || null;
            this.order = order || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant')
                .one(pathObj.tenantId).one('contract').one(pathObj.contractId)
                .one('subject').one(pathObj.subjectId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('rule').one(pathObj.ruleId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new Rule(rawObj.name, rawObj.order);
            // });
            return rawData.subject[0].rule;
        };

        var createData = function(obj) {
            return { rule : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, contractId, subjectId, ruleId) {
            return {
                tenantId: tenantId,
                contractId: contractId,
                subjectId: subjectId,
                ruleId: ruleId
            };
        };

        s.createObj = function() {
            return new Rule();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPClassifierRefsServices', function(GPBServices) {

        var s = {};

        var ClassifierRef = function(name, direction, instanceName, connectionTracking) {
            this.name = name || null;
            this.direction = direction || null;
            this['instance-name'] = instanceName || null;
            this['connection-tracking'] = connectionTracking || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant')
                .one(pathObj.tenantId).one('contract').one(pathObj.contractId)
                .one('subject').one(pathObj.subjectId)
                .one('rule').one(pathObj.ruleId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('classifier-ref').one(pathObj.classifierRefId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new ClassifierRef(rawObj.name, rawObj.direction, rawObj['instance-name']);
            // });
            return rawData.rule[0]['classifier-ref'];
        };

        var createData = function(obj) {
            return { 'classifier-ref' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, contractId, subjectId, ruleId, classifierRefId) {
            return {
                tenantId: tenantId,
                contractId: contractId,
                subjectId: subjectId,
                ruleId: ruleId,
                classifierRefId: classifierRefId
            };
        };

        s.createObj = function() {
            return new ClassifierRef();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPActionRefsServices', function(GPBServices) {

        var s = {};

        var ActionRef = function(name, order, instanceName) {
            this.name = name || null;
            this.order = order || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant')
                .one(pathObj.tenantId).one('contract').one(pathObj.contractId)
                .one('subject').one(pathObj.subjectId)
                .one('rule').one(pathObj.ruleId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('action-ref').one(pathObj.actionRefId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new ActionRef(rawObj.name, rawObj.order);
            // });
            return rawData.rule[0]['action-ref'];
        };

        var createData = function(obj) {
            return { 'action-ref' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, contractId, subjectId, ruleId, actionRefId) {
            return {
                tenantId: tenantId,
                contractId: contractId,
                subjectId: subjectId,
                ruleId: ruleId,
                actionRefId: actionRefId
            };
        };

        s.createObj = function() {
            return new ActionRef();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPL2FloodDomainServices', function(GPBServices) {

        var s = {};

        var L2FloodDomain = function(id, name, description, parent) {
            this.id = id || GPBServices.getUUIDnumber();
            this.name = name || null;
            this.description = description || null;
            this.parent = parent || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('l2-flood-domain').one(pathObj.l2FloodDomain);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new L2FloodDomain(rawObj.id, rawObj.name, rawObj.description, rawObj.parent);
            // });
            return rawData.tenant[0]['l2-flood-domain'];
        };

        var createData = function(obj) {
            return { 'l2-flood-domain' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, l2FloodDomain) {
            return {
                tenantId: tenantId,
                l2FloodDomain: l2FloodDomain
            };
        };

        s.createObj = function() {
            return new L2FloodDomain();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPL2BridgeDomainServices', function(GPBServices) {

        var s = {};

        var L2BridgeDomain = function(id, name, description, parent) {
            this.id = id || GPBServices.getUUIDnumber();
            this.name = name || null;
            this.description = description || null;
            this.parent = parent || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant')
                .one(pathObj.tenantId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('l2-bridge-domain').one(pathObj.l2BridgeDomain);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new L2BridgeDomain(rawObj.id, rawObj.name, rawObj.description, rawObj.parent);
            // });
            return rawData.tenant[0]['l2-bridge-domain'];
        };

        var createData = function(obj) {
            return { 'l2-bridge-domain' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, l2BridgeDomain) {
            return {
                tenantId: tenantId,
                l2BridgeDomain: l2BridgeDomain
            };
        };

        s.createObj = function() {
            return new L2BridgeDomain();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPL3ContextServices', function(GPBServices) {

        var s = {};

        var L3Context = function(id, name, description) {
            this.id = id || GPBServices.getUUIDnumber();
            this.name = name || null;
            this.description = description || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('l3-context').one(pathObj.l3Context);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new L3Context(rawObj.id, rawObj.name, rawObj.description);
            // });
            return rawData.tenant[0]['l3-context'];
        };

        var createData = function(obj) {
            return { 'l3-context' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, l3Context) {
            return {
                tenantId: tenantId,
                l3Context: l3Context
            };
        };

        s.createObj = function() {
            return new L3Context();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPSubnetServices', function(GPBServices) {

        var s = {};

        var Subnet = function(id, name, description, parent, ipPrefix, virtualRouterIp) {
            this.id = id || GPBServices.getUUIDnumber();
            this.name = name || null;
            this.description = description || null;
            this.parent = parent || null;
            this['ip-prefix'] = ipPrefix || null;
            this['virtual-router-ip'] = virtualRouterIp || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('subnet').one(pathObj.subnet);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new L3Context(rawObj.id, rawObj.name, rawObj.description);
            // });
            return rawData.tenant[0]['subnet'];
        };

        var createData = function(obj) {
            return { 'subnet' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, subnet) {
            return {
                tenantId: tenantId,
                subnet: subnet
            };
        };

        s.createObj = function() {
            return new Subnet();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPGatewayServices', function(GPBServices) {

        var s = {};

        var Gateway = function(gateway) {
            this.gateway = gateway || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId).one('subnet').one(pathObj.subnetId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('gateways').one(pathObj.gateway);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new L3Context(rawObj.id, rawObj.name, rawObj.description);
            // });
            return rawData.subnet[0]['gateways'];
        };

        var createData = function(obj) {
            return { 'gateways' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, subnetId, gateway) {
            return {
                tenantId: tenantId,
                subnetId: subnetId,
                gateway: gateway
            };
        };

        s.createObj = function() {
            return new Gateway();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPPrefixServices', function(GPBServices) {

        var s = {};

        var Prefix = function(prefix) {
            this.prefix = prefix || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId).one('subnet').one(pathObj.subnetId).one('gateways').one(pathObj.gatewayId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('prefixes').one(pathObj.prefixId);
        };

        var transformCallback = function(rawData) {
            // return rawData.map(function(rawObj){
            //     return new L3Context(rawObj.id, rawObj.name, rawObj.description);
            // });
            return rawData.gateways[0].prefixes;
        };

        var createData = function(obj) {
            return { 'prefixes' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, subnetId, gatewayId, prefixId) {
            return {
                tenantId: tenantId,
                subnetId: subnetId,
                gatewayId: gatewayId,
                prefixId: prefixId ? prefixId.replace("/", "%2F") : prefixId
            };
        };

        s.createObj = function() {
            return new Prefix();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPClassifierInstanceServices', function(GPBServices) {

        var s = {};

        var ClassifierService = function(name, classifierDefId) {
            this.name = name || null;
            this['classifier-definition-id'] = classifierDefId || null;
            this['parameter-value'] = [];
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId).one('subject-feature-instances');
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('classifier-instance').one(pathObj.classfierInstanceId);
        };

        var transformCallback = function(rawData) {
            return rawData['subject-feature-instances']['classifier-instance'];
        };

        var createData = function(obj) {
            return { 'classifier-instance' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, classfierInstanceId) {
            return {
                tenantId: tenantId,
                classfierInstanceId: classfierInstanceId
            };
        };

        s.createObj = function() {
            return new ClassifierService();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPActionInstanceServices', function(GPBServices) {

        var s = {};

        var ActionService = function(name, actionDefId) {
            this.name = name || null;
            this['action-definition-id'] = actionDefId || null;
            this['parameter-value'] = [];
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId).one('subject-feature-instances');
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('action-instance').one(pathObj.actionInstanceId);
        };

        var transformCallback = function(rawData) {
            return rawData['subject-feature-instances']['action-instance'];
        };

        var createData = function(obj) {
            return { 'action-instance' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, actionInstanceId) {
            return {
                tenantId: tenantId,
                actionInstanceId: actionInstanceId
            };
        };

        s.createObj = function() {
            return new ActionService();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        s.getDefinitions = function(successCbk, errorCbk) {
            var restObj = GBPRestangular.one('restconf').one('operational').one('policy:subject-feature-definitions');
                
            restObj.get().then(function(data) {
                successCbk(data['subject-feature-definitions']['action-definition']);
            }, function(res) {
                // errorCbk(res);
            });
        };

        return s;

    });

    gbp.register.factory('GBPEpgServices', function(GPBServices) {

        var s = {};

        var EPG = function(name, description, intraGroupPolicy, networkDomain, id, parent) {
            this.id = id || GPBServices.getUUIDnumber();
            this.name = name || null;
            this.description = description || null;
            this['intra-group-policy'] = intraGroupPolicy || null;
            this['network-domain'] = networkDomain || null;
            this.parent = parent || null;
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('endpoint-group').one(pathObj.epgId);
        };

        var transformCallback = function(rawData) {
            return rawData.tenant[0]['endpoint-group'];
        };

        var createData = function(obj) {
            return { 'endpoint-group' : [ GPBServices.stripNullValues(obj) ] };
        };

        s.createPathObj = function(tenantId, epgId) {
            return {
                tenantId: tenantId,
                epgId: epgId
            };
        };

        s.createObj = function() {
            return new EPG();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPConNamedSelServices', function(GPBServices) {

        var s = {};

        var ConsumerNamedSelector = function(name, contract) {
            this.name = name || null;
            this.contract = contract || [];
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId).one('endpoint-group').one(pathObj.epgId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('consumer-named-selector').one(pathObj.cnsId);
        };

        var transformCallback = function(rawData) {
            var data = null,
                consumerData = rawData['endpoint-group'][0]['consumer-named-selector'];

            if(consumerData) {
                data = consumerData.map(function(elem) {
                    if(elem.hasOwnProperty('contract') === false) {
                        elem.contract = [];
                    }
                    return elem;
                });
            }

            return data;
        };

        var createData = function(obj) {
            var o = GPBServices.stripNullValues(obj);

            if(o.contract) {
                o.contract = GPBServices.removeEmptyElementsFromList(o.contract);
            }

            return { 'consumer-named-selector' : [ o ] };
        };

        s.createPathObj = function(tenantId, epgId, cnsId) {
            return {
                tenantId: tenantId,
                epgId: epgId,
                cnsId: cnsId
            };
        };

        s.createObj = function() {
            return new ConsumerNamedSelector();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });


    gbp.register.factory('GBPProNamedSelServices', function(GPBServices) {

        var s = {};

        var ProviderNamedSelector = function(name, contract) {
            this.name = name || null;
            this.contract = contract || [];
        };

        var createBaseRestObj = function(pathObj) {
            return GPBServices.createRestObj()
                .one('policy:tenants').one('tenant').one(pathObj.tenantId).one('endpoint-group').one(pathObj.epgId);
        };

        var createRestObj = function(pathObj) {
            return createBaseRestObj(pathObj).one('provider-named-selector').one(pathObj.cnsId);
        };

        var transformCallback = function(rawData) {
            var data = null,
                provderData = rawData['endpoint-group'][0]['provider-named-selector'];

            if(provderData) {
                data = provderData.map(function(elem) {
                    if(elem.hasOwnProperty('contract') === false) {
                        elem.contract = [];
                    }
                    return elem;
                });
            }

            return data;
        };

        var createData = function(obj) {
            var o = GPBServices.stripNullValues(obj);

            if(o.contract) {
                o.contract = GPBServices.removeEmptyElementsFromList(o.contract);
            }

            return { 'provider-named-selector' : [ o ] };
        };

        s.createPathObj = function(tenantId, epgId, cnsId) {
            return {
                tenantId: tenantId,
                epgId: epgId,
                cnsId: cnsId
            };
        };

        s.createObj = function() {
            return new ProviderNamedSelector();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path),
                reqData = createData(obj);

            GPBServices.send(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, successCbk, errorCbk) {
            var restObj = createRestObj(path);

            GPBServices.delete(restObj, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = createBaseRestObj(path);

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPEndpointServices', function(GPBServices) {

        var s = {};

        var Endpoint = function() {
            this.tenant = null;
            this['network-containment'] = null;
            this['endpoint-group'] = null;
            this['endpoint-groups'] = [];
            this.condition = [];
            this['l2-context'] = null;
            this['mac-address'] = null;
            this['l3-address'] = [];
        };

        var createRestObj = function() {
            return GPBServices.createRestObj('operations');
        };

        var transformCallback = function(rawData) {
            return rawData.endpoints.endpoint;
        };

        var createBaseData = function(obj) {
            var o = GPBServices.stripNullValues(obj);

            if(o.condition) {
                o.condition = GPBServices.removeEmptyElementsFromList(o.condition);
            }

            if(o['endpoint-groups']) {
                o['endpoint-groups'] = GPBServices.removeEmptyElementsFromList(o['endpoint-groups']);
            }

            if(o['l3-address']) {
                o['l3-address'] = GPBServices.removeEmptyElementsFromList(o['l3-address']);
            }

            return o;
        };

        var createSendData = function(obj) {
            var o = createBaseData(obj);
            return { 'input': o };
        };

        var createDeleteData = function(obj) {
            var o = { 
                'input': { 
                    'l3': obj['l3-address'],
                    'l2': [
                        { 
                            'l2-context': obj['l2-context'],
                            'mac-address': obj['mac-address']
                        }
                    ] 
                } 
            };

            return o;
        };

        s.createObj = function() {
            return new Endpoint();
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj().one('endpoint:register-endpoint'),
                reqData = createSendData(obj);

            GPBServices.post(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path).one('endpoint:unregister-endpoint'),
                reqData = createDeleteData(obj);
            GPBServices.post(restObj, reqData, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = GPBServices.createRestObj('operational').one('endpoint:endpoints');

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('GBPEndpointL3Services', function(GPBServices) {

        var s = {};

        var EndpointL3 = function(tenantId) {
            this.tenant = tenantId || null;
            this['endpoint-group'] = null;
            this['endpoint-groups'] = [];
            this.condition = [];
            this['l3-context'] = null;
            this['ip-prefix'] = null;
            this['endpoint-l2-gateways'] = [];
            this['endpoint-l3-gateways'] = [];
        };

        var createRestObj = function() {
            return GPBServices.createRestObj('operations');
        };

        var transformCallback = function(rawData) {
            return rawData.endpoints['endpoint-l3-prefix'];
        };

        var createBaseData = function(obj) {
            var o = GPBServices.stripNullValues(obj);

            if(o.condition) {
                o.condition = GPBServices.removeEmptyElementsFromList(o.condition);
            }

            if(o['endpoint-groups']) {
                o['endpoint-groups'] = GPBServices.removeEmptyElementsFromList(o['endpoint-groups']);
            }

            if(o['endpoint-l2-gateways']) {
                o['endpoint-l2-gateways'] = GPBServices.removeEmptyElementsFromList(o['endpoint-l2-gateways']);
            }

            if(o['endpoint-l3-gateways']) {
                o['endpoint-l3-gateways'] = GPBServices.removeEmptyElementsFromList(o['endpoint-l3-gateways']);
            }

            return o;
        };

        var createSendData = function(obj) {
            var o = createBaseData(obj);
            return { 'input': o };
        };

        var createDeleteData = function(obj) {
            var o = { 
                'input': { 
                    'l3-prefix': [
                        {
                            'l3-context': obj['l3-context'],
                            'ip-prefix': obj['ip-prefix']
                        }
                    ],
                    'l2': obj['endpoint-l2-gateways'],
                    'l3': obj['endpoint-l3-gateways']
                } 
            };

            return o;
        };

        s.createObj = function(tenantId) {
            return new EndpointL3(tenantId);
        };

        s.send = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj().one('endpoint:register-l3-prefix-endpoint'),
                reqData = createSendData(obj);

            GPBServices.post(restObj, reqData, successCbk, errorCbk);
        };

        s.delete = function(path, obj, successCbk, errorCbk) {
            var restObj = createRestObj(path).one('endpoint:unregister-endpoint'),
                reqData = createDeleteData(obj);

            GPBServices.post(restObj, reqData, successCbk, errorCbk);
        };

        s.load = function(path, successCbk, errorCbk) {
            var restObj = GPBServices.createRestObj('operational').one('endpoint:endpoints');

            GPBServices.load(restObj, transformCallback, successCbk, errorCbk);
        };

        return s;

    });

    gbp.register.factory('PGNServices', function(GBPRestangular) {

        var s = {};

        var idGetter = {};

        var idTypes = {
            tenant: 'TENANT',
            uuid: 'UUID',
            l3ctx: 'L3CTX',
            pathAction: 'PATHACTION',
            accessAction: 'ACCESSACTION'
        };

        idGetter[idTypes.tenant] = function() {
            return 1;
        };

        idGetter[idTypes.uuid] = function() {
            return 2;
        };

        idGetter[idTypes.l3ctx] = function() {
            return 3;
        };

        idGetter[idTypes.pathAction] = function() {
            return 4;
        };

        idGetter[idTypes.accessAction] = function() {
            return 5;
        };

        var getId = function(type) {
            if(idGetter.hasOwnProperty(type)) {
                return id = idGetter[type]();
            } else {
                throw "Cannot get idGetter for type " + type;
            }
        };

        s.addReplaceEndpointGroup = function(successCbk, errorCbk, groupName, sgt, description) {
            var tenantId = getId(idTypes.tenant),
                uuid = getId(idTypes.uuid),
                restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'pgn-application:create-or-replace-endpoint-groups',
                reqData = {
                               "input": 
                                {
                                    "endpoint-group":[
                                    {
                                        "pgn-application:tenant-id": tenantID, 
                                        "pgn-application:id":uuid,
                                        "pgn-application:security-group-tag":sgt,
                                        "pgn-application:name":groupName,
                                        "pgn-application:description":description
                                    }
                                ]
                            }
                        };

            restObj.post(rpcRes, reqData).then(function(data) {
                successCbk(data);
            }, function(res) {
                errorCbk(res);
            });
        };

        s.deleteEndpointGroup = function(successCbk, errorCbk, uuid) {
            var tenantId = getId(idTypes.tenant),
                restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'pgn-application:delete-endpoint-groups',
                reqData = {
                            "input": {
                                "endpoint-group":[
                                    {
                                        "pgn-application:tenant-id": tenantId, 
                                        "pgn-application:id":uuid
                                    }
                                ]
                            }
                        };

            restObj.post(rpcRes, reqData).then(function(data) {
                successCbk(data);
            }, function(res) {
                errorCbk(res);
            });
        };

        s.getActions = function(successCbk, errorCbk) {
            var tenantId = getId(idTypes.tenant),
                pathActionId = getId(idTypes.pathAction),
                accessActionId = getId(idTypes.accessAction),
                restObj = GBPRestangular.one('restconf').one('config').one('policy:tenants',  tenantId).one('subject-feature-instances');

            restObj.get().then(function(data) {
                successCbk(data); //TODO fill actions
            }, function(res) {
                errorCbk(res);
            });
        };

        s.applyPolicy = function(successCbk, errorCbk, providerId, consumerId, pathSelRule, accessCtrlRule) {
            var restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'pgn-application:wire-endpoint-groups',
                actionRefName = (pathSelRule ? pathSelRule : '') + (accessCtrlRule ? accessCtrlRule : ''),
                reqData = {
                               "input": {
                                    "endpoint-group-pair-with-rules": {
                                        "pgn-application:provider-tenant-id": tenantID, 
                                        "pgn-application:consumer-tenant-id": tenantID, 
                                        "pgn-application:provider-group-id":providerId,
                                        "pgn-application:consumer-group-id":consumerId,
                                        "pgn-application:group-rule": [
                                            {
                                                "action-ref": [pathSelRule, accessCtrlRule].map(function(r) {
                                                    return { "name":r };
                                                }),
                                                "name":actionRefName
                                            }
                                        ]
                                    }
                                }
                            };

            restObj.post(rpcRes, reqData).then(function(data) {
                successCbk(data); //TODO reload policies
            }, function(res) {
                errorCbk(res);
            });
        };

        s.deletePolicy = function(successCbk, errorCbk, providerId, consumerId) {
            var tenantId = getId(idTypes.tenant),
                restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'pgn-application:unwire-endpoint-groups',
                reqData = {
                           "input": 
                            {
                                "endpoint-group-pair":[
                                    {
                                        "pgn-application:provider-tenant-id": tenantId, 
                                        "pgn-application:consumer-tenant-id": tenantId, 
                                        "pgn-application:provider-group-id":providerId,
                                        "pgn-application:consumer-group-id":consumerId
                                    }
                                ]
                            }
                        };

            restObj.post(rpcRes, reqData).then(function(data) {
                successCbk(data); //TODO reload policies
            }, function(res) {
                errorCbk(res);
            });
        };

        s.addEndPoint = function(successCbk, errorCbk, ipAddress, groupId) {
            var l3ctxId = getId(idTypes.l3ctx),
                tenantId = getId(idTypes.tenant),
                restObj = GBPRestangular.one('restconf').one('operations'),
                rpcRes = 'endpoint:register-endpoint',
                reqData = {
                            "input": {
                                "endpoint-group": groupId,
                                "l3-address": [
                                    {
                                        "ip-address": ipAddress,
                                        "l3-context": l3ctxId
                                    }
                                ],
                                "tenant": tenantId
                            }
                        };

            restObj.post(rpcRes, reqData).then(function(data) {
                successCbk(data);
            }, function(res) {
                errorCbk(res);
            });
        };

        s.getUUIDnumber = function() {
            var d = new Date().getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = (d + Math.random()*16)%16 | 0;
                        d = Math.floor(d/16);
                        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                    });
        };

        return s;
    });

    gbp.register.factory('DesignGbpFactory', function(){

        var dvf = {};

        dvf.setMainClass = function(){
            if ( $('.gbpWrapper').length ) {
                $('.gbpWrapper').closest('.col-xs-12').addClass('gbpGlobalWrapper');
              }
        };

        return dvf;

    });
});