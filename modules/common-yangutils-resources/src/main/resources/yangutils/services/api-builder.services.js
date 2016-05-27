define([], function () {
    'use strict';

    function ApiBuilderService(ArrayUtilsService, PathUtilsService, NodeUtilsService, YangUtilsRestangularService, CustomFuncService){
        var ab = {};

        var Api = function(basePath, module, revision, subApis) {
            this.basePath = basePath;
            this.module = module;
            this.revision = revision;
            this.subApis = subApis || [];

            this.addSubApis = function(subApis) {
                var self = this;
                subApis.forEach(function(sa) {
                    sa.parent = self;
                    self.subApis.push(sa);
                });
            };
        };

        var SubApi = function (pathTemplateString, operations, node, storage, parent) {
            this.node = node;
            this.pathTemplateString = pathTemplateString;
            this.operations = operations;
            this.storage = storage;
            this.custFunct = [];
            this.parent = parent ? parent : null;

            this.pathArray = (function(st, path) {
                var pathString = (st ? st + '/' : '') + path;
                return PathUtilsService.translate(pathString);
            }) (this.storage, this.pathTemplateString);

            this.equals = function(pathArray, compareIdentifierValues) {
                return this.pathArray.every(function(pa, i) {
                    pa.equals(pathArray[i], compareIdentifierValues);
                });
            };

            this.buildApiRequestString = function () {
                return PathUtilsService.translatePathArray(this.pathArray).join('/');
            };

            this.addCustomFunctionality = function (label, callback, viewStr, hideButtonOnSelect) {
                var funct = CustomFuncService.createNewFunctionality(label, this.node, callback, viewStr, hideButtonOnSelect);

                if (funct) {
                    this.custFunct.push(funct);
                }
            };

            this.clone = function(options) {
                var getOption = function(optName) {
                        var res = null;
                        if(options) {
                            res = options[optName] || null;
                        }
                        return  res;
                    },
                    clone = new SubApi(getOption('pathTemplateString') || this.pathTemplateString,
                        getOption('operations') || this.operations,
                        getOption('withoutNode') ? null : this.node,
                        getOption('storage') || this.storage,
                        getOption('parent') || this.parent);

                if(getOption('clonePathArray')) {
                    clone.pathArray = this.pathArray.map(function(pe) {
                        return pe.clone();
                    });
                }

                return clone;
            };
        };

        var removeDuplicatedApis = function(apis) {
            var toRemove = [],
                sortApisByRevision = function(a, b) {
                    var dateA = new Date(a.revision+'Z'),
                        dateB = new Date(b.revision+'Z');

                    return dateB - dateA;
                };

            apis.forEach(function(a) {
                if(toRemove.indexOf(a) === -1) {
                    var sortedApis = apis.filter(function(af) {
                        return a.module === af.module;
                    }).sort(sortApisByRevision);

                    toRemove = toRemove.concat(sortedApis.slice(1));
                }
            });

            toRemove.forEach(function(a) {
                apis.splice(apis.indexOf(a), 1);
            });

            return apis;
        };

        var isConfigNode = function(node) {
            var result = false;

            if(node.hasOwnProperty('isConfigStm')) {
                result = node.isConfigStm;
            } else if(node.parent) {
                result = isConfigNode(node.parent);
            }

            return result;
        };

        var addNodePathStr = function(node) {
            return (!node.parent || (node.parent.module !== node.module) ? node.module + ':' : '') + node.label;
        };

        var getBasePath = function() {
            return YangUtilsRestangularService.configuration.baseUrl + '/restconf/';
        };

        var getApiByModuleRevision = function(apis, module, revision) {
            return apis.filter(function(a) {
                return a.module === module && a.revision === revision;
            })[0];
        };

        var getKeyIndentifiers = function(keys) {
            return keys.map(function (k) {
                return '{' + k.label + '}';
            });
        };

        var getStoragesByNodeType = function(node) {
            var storages = [];
            if(NodeUtilsService.isRootNode(node.type)) {
                if(node.type === 'rpc') {
                    storages.push('operations');
                } else {
                    storages.push('operational');
                    if(isConfigNode(node)) {
                        storages.push('config');
                    }
                }
            }

            return storages;
        };

        var getOperationsByStorage = function(storage) {
            var operations =  [];
            if(storageOperations.hasOwnProperty(storage)) {
                operations = storageOperations[storage];
            }

            return operations;
        };

        var storageOperations = {};

        storageOperations.config = ['GET', 'PUT', 'DELETE'];
        storageOperations.operational = ['GET'];
        storageOperations.operations = ['POST'];

        var nodePathStringCreator = {};

        nodePathStringCreator.list = function(node, pathstr) {
            return pathstr + addNodePathStr(node) + '/' + (node.refKey.length ? (getKeyIndentifiers(node.refKey).join('/') + '/') : '');
        };

        nodePathStringCreator.container = function(node, pathstr) {
            return pathstr + addNodePathStr(node) + '/';
        };

        nodePathStringCreator.rpc = function(node, pathstr) {
            return pathstr + addNodePathStr(node) + '/';
        };

        var createSubApis = function(node, pathstr) {
            var storages = getStoragesByNodeType(node);

            return storages.map(function(storage) {
                var subApi = new SubApi(pathstr, getOperationsByStorage(storage), node, storage);
                return subApi;
            });
        };

        var nodeChildrenProcessor = function(node, pathstr, subApis) {
            if(NodeUtilsService.isRootNode(node.type) && nodePathStringCreator.hasOwnProperty(node.type)) {
                var templateStr = nodePathStringCreator[node.type](node, pathstr),
                    newSubApis = createSubApis(node, templateStr);

                ArrayUtilsService.pushElementsToList(subApis, newSubApis);

                node.children.forEach(function(ch) {
                    nodeChildrenProcessor(ch, templateStr, subApis);
                });
            }
        };

        //utility function
        var printApis = function(apis) {
            var co = '';
            apis.forEach(function(a) {
                a.subApis.forEach(function(sa) {
                    co += (sa.storage + '/' + sa.pathTemplateString + '\n');
                });
            });

            // console.info(co);
        };

        ab.processAllRootNodes = function(nodes) {
            var apis = [];

            nodes.forEach(function(node) {
                var api = getApiByModuleRevision(apis, node.module, node.moduleRevision),
                    newApi = false;

                if(!api) {
                    api = new Api(getBasePath(), node.module, node.moduleRevision);
                    newApi = true;
                }

                api.addSubApis(ab.processSingleRootNode(node));

                if(newApi) {
                    apis.push(api);
                }
            });

            apis = removeDuplicatedApis(apis);

            printApis(apis);

            return apis;
        };

        ab.processSingleRootNode = function(node) {
            var templateStr = nodePathStringCreator[node.type](node, ''),
                subApis = createSubApis(node, templateStr);

            node.children.forEach(function(ch) {
                nodeChildrenProcessor(ch, templateStr, subApis);
            });

            return subApis;
        };

        ab.Api = Api;
        ab.SubApi = SubApi;

        return ab;
    }

    ApiBuilderService.$inject=['ArrayUtilsService', 'PathUtilsService', 'NodeUtilsService', 'YangUtilsRestangularService', 'CustomFuncService'];

    return ApiBuilderService;

});
