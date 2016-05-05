define([], function () {
    'use strict';

    function YangUtilsService(YinParserService, NodeWrapperService, RequestBuilderService, SyncService, constants,
                              ModuleConnectorService, YangUiApisService, EventDispatcherService, ApiBuilderService){
        var utils = {};

        utils.stripAngularGarbage = function(obj, prop) {
            var strippedObj = {},
                propsToRemove = ['$$hashKey', 'route', 'reqParams', 'parentResource', 'restangularCollection'],
                removeGarbage = function(obj) {
                    propsToRemove.forEach(function(p) {
                        delete obj[p];
                    });

                    return obj;
                };

            if(obj.hasOwnProperty(prop)) {
                strippedObj[prop] = obj[prop];
            } else {
                strippedObj = removeGarbage(obj);
            }

            return strippedObj;
        };

        utils.switchConfigOper = function(apiStr, swtichTo) {
            var c = 'config',
                o = 'operational',
                str = apiStr;

            if(apiStr.indexOf(c) === 0) {
                str = swtichTo + apiStr.slice(c.length);
            } else if(apiStr.indexOf(o) === 0) {
                str =  swtichTo + apiStr.slice(o.length);
            }

            return str;
        };

        utils.generateNodesToApis = function (callback, errorCbk) {
            var allRootNodes = [],
                topLevelSync = SyncService.generateObj(),
                reqAll = topLevelSync.spawnRequest('all'),
                allAugmentationGroups = {};

            YangUiApisService.getAllModules().get().then(
                function (data) {
                    utils.processModules(data.modules, function (result, aGroups) {
                        allAugmentationGroups = aGroups;
                        allRootNodes = result.map(function (node) {
                            var copy = node.deepCopy(['augmentionGroups', 'augmentationId']);

                            NodeWrapperService.wrapAll(copy);
                            return copy;
                        });
                        topLevelSync.removeRequest(reqAll);
                    });
                }, function (result) {
                    console.error('Error getting API data:', result);
                    topLevelSync.removeRequest(reqAll);
                }
            );

            topLevelSync.waitFor(function () {
                try {
                    EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Building apis');
                    var abApis = ApiBuilderService.processAllRootNodes(allRootNodes);
                    callback(abApis, allRootNodes, allAugmentationGroups);
                } catch (e) {
                    errorCbk(e);
                    throw(e); //do not lose debugging info
                }
            });

        };

        utils.generateApiTreeData = function (apis) {
            var newElem = function (pathElem, array) {
                    var getIdentifierStr = function(path){
                            return path.identifiers.map(function(identifier){
                                return '{' + identifier.label + '}';
                            }).join(' ');
                        },
                        element = {
                            label: pathElem.name,
                            module: pathElem.module,
                            identifier: pathElem.hasIdentifier() ? getIdentifierStr(pathElem) : '',
                            identifiersLength: pathElem.identifiers.length,
                            children: []
                        };

                    array.push(element);
                },
                fillPath = function (path, array, indexSubApi, indexApi, itemSub, childIndex) {
                    var existElem = false,
                        arrayIndex = null,
                        currentPathItem = path[childIndex],
                        continueProcessing = false;

                    if (childIndex < path.length) {
                        if (array.length > 0) {
                            existElem = array.some(function (arrayItem, index) {
                                var condition = arrayItem.label === currentPathItem.name;
                                if (condition) {
                                    arrayIndex = index;
                                }

                                return condition;
                            });

                            if (!existElem) {
                                newElem(currentPathItem, array);
                            }
                        } else {
                            newElem(currentPathItem, array);
                        }

                        arrayIndex = arrayIndex !== null ? arrayIndex : array.length - 1;
                        var isContinuing = fillPath(path, array[arrayIndex].children, indexSubApi, indexApi, itemSub, childIndex+1);
                        if (isContinuing === false) {
                            array[arrayIndex].indexApi = indexApi;
                            array[arrayIndex].indexSubApi = indexSubApi;
                        }

                        continueProcessing = true;
                    }

                    return continueProcessing;
                },
                getApisAndPath = function (item, indexApi) {
                    var childrenArray = [];

                    item.subApis.map(function (itemSub, indexSubApi) {
                        var childIndex = 0;
                        fillPath(itemSub.pathArray, childrenArray, indexSubApi, indexApi, itemSub, childIndex);
                    });

                    return childrenArray;
                },
                dataTree = apis.map(function (item, indexApi) {
                    var apisPath = getApisAndPath(item, indexApi);

                    return {
                        label: item.module + (item.revision ? ' rev.' + item.revision : ''),
                        module: item.module,
                        revision: item.revision,
                        children: apisPath
                    };
                }),
                sortedDataTree = dataTree.sort(function(a, b) {
                    var sortRes = 0;
                    if(a.label < b.label) {
                        sortRes = -1;
                    }
                    if(a.label > b.label) {
                        sortRes = 1;
                    }
                    return sortRes;
                });

            return sortedDataTree;
        };

        utils.processModules = function (loadedModules, callback) {
            var modules = [],
                rootNodes = [],
                augments = [],
                syncModules = SyncService.generateObj(),
                augmentionGroups = new YinParserService.Augmentations();

            EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Processing modules');
            loadedModules.module.forEach(function (module) {
                var reqId = syncModules.spawnRequest(module.name);

                YinParserService.parseYang(module.name, module.revision, function (module) {
                    modules.push(module);
                    syncModules.removeRequest(reqId);
                }, function () {
                    syncModules.removeRequest(reqId);
                });
            });

            syncModules.waitFor(function () {
                EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Linking uses and typedefs');
                var processedData = ModuleConnectorService.processModuleObjs(modules);
                rootNodes = processedData.rootNodes;
                augments = processedData.augments;

                EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Linking augments');

                var sortedAugments = augments.sort(function (a, b) {
                    return a.path.length - b.path.length;
                });

                sortedAugments.map(function (elem) {
                    elem.apply(rootNodes, augmentionGroups);
                });

                callback(rootNodes, augmentionGroups);
            });
        };

        utils.processModulesMP = function (loadedModules, basePath, callback) {
            var modules = [],
                rootNodes = [],
                augments = [],
                syncModules = SyncService.generateObj(),
                augmentionGroups = new YinParserService.Augmentations();

            EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Processing modules');
            loadedModules.module.forEach(function (module) {
                var reqId = syncModules.spawnRequest(module.name);

                YinParserService.parseYangMP(basePath, module.name, module.revision, function (module) {
                    modules.push(module);
                    syncModules.removeRequest(reqId);
                }, function () {
                    syncModules.removeRequest(reqId);
                });
            });

            syncModules.waitFor(function () {
                EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Linking uses and typedefs');
                var processedData = ModuleConnectorService.processModuleObjs(modules);
                rootNodes = processedData.rootNodes;
                augments = processedData.augments;

                EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Linking augments');

                var sortedAugments = augments.sort(function (a, b) {
                    return a.path.length - b.path.length;
                });

                sortedAugments.map(function (elem) {
                    elem.apply(rootNodes, augmentionGroups);
                });

                callback(rootNodes, augmentionGroups);
            });
        };

        utils.getRequestString = function (node) {
            var request = RequestBuilderService.createObj(),
                reqStr = '';

            node.buildRequest(RequestBuilderService, request, node.module);

            if (request && $.isEmptyObject(request) === false) {
                reqStr = RequestBuilderService.resultToString(request);
            }
            return reqStr;
        };

        utils.transformTopologyData = function (data, callback) {
            var links = [],
                nodes = [],
                getNodeIdByText = function getNodeIdByText(inNodes, text) {
                    var nodes = inNodes.filter(function (item, index) {
                            return item.label === text;
                        }),
                        nodeId;

                    if (nodes.length > 0 && nodes[0]) {
                        nodeId = nodes[0].id;
                    } else {
                        return null;
                    }

                    return nodeId;
                };


            if (data['network-topology'] && data['network-topology'].topology.length) {
                var topoData = callback ? callback(data['network-topology'].topology) : data['network-topology'].topology[0],
                    nodeId = 0,
                    linkId = 0;

                nodes = topoData.hasOwnProperty('node') ? topoData.node.map(function (nodeData) {
                    return {'id': (nodeId++).toString(), 'label': nodeData["node-id"], group: nodeData["node-id"].indexOf('host') === 0 ? 'host' : 'switch', value: 20, title: 'Name: <b>' + nodeData["node-id"] + '</b><br>Type: Switch'};
                }) : [];

                links = topoData.hasOwnProperty('link') ? topoData.link.map(function (linkData) {
                    var srcId = getNodeIdByText(nodes, linkData.source["source-node"]),
                        dstId = getNodeIdByText(nodes, linkData.destination["dest-node"]),
                        srcPort = linkData.source["source-tp"],
                        dstPort = linkData.destination["dest-tp"];
                    if (srcId != null && dstId != null) {
                        return {id: (linkId++).toString(), 'from': srcId, 'to': dstId, title: 'Source Port: <b>' + srcPort + '</b><br>Dest Port: <b>' + dstPort + '</b>'};
                    }
                }) : [];
            }

            return {nodes: nodes, links: links};
        };

        utils.objectHandler = function(obj, objCbk, vauleCbk, arrayCbk){
            if ( Array.isArray(obj) ) {
                if (angular.isFunction(arrayCbk)) {
                    arrayCbk(obj);
                }

                obj.forEach(function(item){
                    utils.objectHandler(item, objCbk, vauleCbk);
                });
            } else {
                if ( obj !== null && Object.keys(obj).length > 0 && typeof obj !== 'string' ) {
                    if (angular.isFunction(objCbk)) {
                        objCbk(obj);
                    }

                    for(var property in obj){
                        utils.objectHandler(obj[property], objCbk, vauleCbk);
                    }
                } else {
                    if (angular.isFunction(vauleCbk)) {
                        vauleCbk(obj);
                    }
                }
            }
        };

        var checkSupApiIdentifiers = function(subApi){
                var pathElement = subApi.pathArray[subApi.pathArray.length-1];
                return pathElement.hasIdentifier() ? pathElement.identifiers : [];
            },
            postRequestData = function(requestData, reqString, subApi){
                var identifiersArray = checkSupApiIdentifiers(subApi),
                    lastPathElement = function(path){
                        return path.split('/').pop().split(':').pop();
                    };

                if ( identifiersArray.length ) {
                    var pathArray = reqString.split('/'),
                        reqObj = null;

                    identifiersArray.forEach(function(){
                        pathArray.pop();
                    });

                    reqString = pathArray.join('/');
                    var requestItem = requestData[lastPathElement(reqString)] ? requestData[lastPathElement(reqString)].filter(function(item){
                        return identifiersArray.every(function(i){
                            return item[i.label] === i.value;
                        });
                    }) : [];

                    return requestItem.length ? requestItem[0] : {};
                } else {
                    return requestData[lastPathElement(reqString)];
                }
            };

        utils.prepareRequestData = function(requestData, operation, reqString, subApi){
            var preparedData = requestData;

            if(operation === 'GET'){
                preparedData = null;
            }
            else if(operation === 'POST'){
                return postRequestData(requestData, reqString, subApi);
            }

            return preparedData;
        };

        utils.prepareOperation = function(operation){
            return operation === 'DELETE' ? 'REMOVE' : operation;
        };

        utils.prepareHeaders = function(requestData){
            return requestData === constants.NULL_DATA ? { "Content-Type": undefined} : { "Content-Type": "application/yang.data+json"};
        };

        utils.errorMessages = {
            'method' :
            {
                'GET': {
                    '401':'YANGUI_ERROR_GET_401',
                    '403':'YANGUI_ERROR_GET_403',
                    '404':'YANGUI_ERROR_GET_404',
                    '500':'YANGUI_ERROR_GET_500',
                    '503':'YANGUI_ERROR_GET_503'
                },
                'POST': {
                    '500':'YANGUI_ERROR_GET_500',
                    '503':'YANGUI_ERROR_GET_503'
                },
                'PUT': {
                    '500':'YANGUI_ERROR_GET_500',
                    '503':'YANGUI_ERROR_GET_503'
                },
                'DELETE': {
                    '500':'YANGUI_ERROR_GET_500',
                    '503':'YANGUI_ERROR_GET_503'
                }
            }
        };

        utils.__test = {
        };

        return utils;

    }

    YangUtilsService.$inject=['YinParserService', 'NodeWrapperService', 'RequestBuilderService', 'SyncService', 'constants',
                                'ModuleConnectorService', 'YangUiApisService', 'EventDispatcherService', 'ApiBuilderService'];

    return YangUtilsService;

});