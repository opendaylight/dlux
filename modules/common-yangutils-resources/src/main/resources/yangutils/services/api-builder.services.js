define([], function () {
    'use strict';

    function ApiBuilderService(ArrayUtilsService, PathUtilsService, NodeUtilsService, YangUtilsRestangularService,
                               CustomFuncService){

        var service = {
                Api: Api,
                SubApi: SubApi,
                processAllRootNodes: processAllRootNodes,
                processSingleRootNode: processSingleRootNode,
            },
            storageOperations = {
                config: ['GET', 'PUT', 'POST', 'DELETE'],
                operational: ['GET'],
                operations: ['POST'],
            },
            nodePathStringCreator = {
                list: function (node, pathstr) {
                    return pathstr + addNodePathStr(node) + '/' + (node.refKey.length ?
                            (getKeyIndentifiers(node.refKey).join('/') + '/') : '');
                },
                container: function (node, pathstr) {
                    return pathstr + addNodePathStr(node) + '/';
                },
                rpc: function (node, pathstr) {
                    return pathstr + addNodePathStr(node) + '/';
                },
            };

        return service;

        /**
         * Base Api object
         * @param basePath
         * @param module
         * @param revision
         * @param subApis
         * @constructor
         */
        function Api(basePath, module, revision, subApis) {
            this.basePath = basePath;
            this.module = module;
            this.revision = revision;
            this.subApis = subApis || [];

            this.addSubApis = function (subApis) {
                var self = this;
                subApis.forEach(function (sa) {
                    sa.parent = self;
                    self.subApis.push(sa);
                });
            };
        }

        /**
         * Base SubApi object
         * @param pathTemplateString
         * @param operations
         * @param node
         * @param storage
         * @param parent
         * @constructor
         */
        function SubApi(pathTemplateString, operations, node, storage, parent) {
            this.node = node;
            this.pathTemplateString = pathTemplateString;
            this.operations = operations;
            this.storage = storage;
            this.custFunct = [];
            this.parent = parent ? parent : null;

            this.pathArray = (function (st, path) {
                var pathString = (st ? st + '/' : '') + path;
                return PathUtilsService.translate(pathString);
            })(this.storage, this.pathTemplateString);

            this.equals = function (pathArray, compareIdentifierValues) {
                return this.pathArray.every(function (pa, i) {
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

            this.clone = function (options) {
                var getOption = function (optName) {
                        var res = null;
                        if (options) {
                            res = options[optName] || null;
                        }
                        return  res;
                    },
                    clone = new SubApi(getOption('pathTemplateString') || this.pathTemplateString,
                        getOption('operations') || this.operations,
                        getOption('withoutNode') ? null : this.node,
                        getOption('storage') || this.storage,
                        getOption('parent') || this.parent);

                if (getOption('clonePathArray')) {
                    clone.pathArray = this.pathArray.map(function (pe) {
                        return pe.clone();
                    });
                }

                return clone;
            };
        }

        // TODO: add function's description
        function removeDuplicatedApis(apis) {
            var toRemove = [],
                sortApisByRevision = function (a, b) {
                    var dateA = new Date(a.revision + 'Z'),
                        dateB = new Date(b.revision + 'Z');

                    return dateB - dateA;
                };

            apis.forEach(function (a) {
                if (toRemove.indexOf(a) === -1) {
                    var sortedApis = apis.filter(function (af) {
                        return a.module === af.module;
                    }).sort(sortApisByRevision);

                    toRemove = toRemove.concat(sortedApis.slice(1));
                }
            });

            toRemove.forEach(function (a) {
                apis.splice(apis.indexOf(a), 1);
            });

            return apis;
        }

        // TODO: add function's description
        function isConfigNode(node) {
            var result = false;

            if (node.hasOwnProperty('isConfigStm')) {
                result = node.isConfigStm;
            } else if (node.parent) {
                result = isConfigNode(node.parent);
            }

            return result;
        }

        // TODO: add function's description
        function addNodePathStr(node) {
            return (!node.parent || (node.parent.module !== node.module) ? node.module + ':' : '') + node.label;
        }

        // TODO: add function's description
        function getBasePath() {
            return YangUtilsRestangularService.configuration.baseUrl + '/restconf/';
        }

        // TODO: add function's description
        function getApiByModuleRevision(apis, module, revision) {
            return apis.filter(function (a) {
                return a.module === module && a.revision === revision;
            })[0];
        }

        // TODO: add function's description
        function getKeyIndentifiers(keys) {
            return keys.map(function (k) {
                return '{' + k.label + '}';
            });
        }

        // TODO: add function's description
        function getStoragesByNodeType(node) {
            var storages = [];
            if (NodeUtilsService.isRootNode(node.type)) {
                if (node.type === 'rpc') {
                    storages.push('operations');
                } else {
                    storages.push('operational');
                    if (isConfigNode(node)) {
                        storages.push('config');
                    }
                }
            }

            return storages;
        }

        // TODO: add function's description
        function getOperationsByStorage(storage) {
            var operations =  [];
            if (storageOperations.hasOwnProperty(storage)) {
                operations = storageOperations[storage];
            }

            return operations;
        }

        // TODO: add function's description
        function createSubApis(node, pathstr) {
            var storages = getStoragesByNodeType(node);

            return storages.map(function (storage) {
                var subApi = new SubApi(pathstr, getOperationsByStorage(storage), node, storage);
                return subApi;
            });
        }

        // TODO: add function's description
        function nodeChildrenProcessor(node, pathstr, subApis) {
            if (NodeUtilsService.isRootNode(node.type) && nodePathStringCreator.hasOwnProperty(node.type)) {
                var templateStr = nodePathStringCreator[node.type](node, pathstr),
                    newSubApis = createSubApis(node, templateStr);

                ArrayUtilsService.pushElementsToList(subApis, newSubApis);

                node.children.forEach(function (ch) {
                    nodeChildrenProcessor(ch, templateStr, subApis);
                });
            }
        }

        /**
         * Function for showing available apis in web browser's console
         * @param apis
         */
        function printApis(apis) {
            var co = '';
            apis.forEach(function (a) {
                a.subApis.forEach(function (sa) {
                    co += (sa.storage + '/' + sa.pathTemplateString + '\n');
                });
            });

        }

        // TODO: add service's description
        function processAllRootNodes(nodes) {
            var apis = [];

            nodes.forEach(function (node) {
                var api = getApiByModuleRevision(apis, node.module, node.moduleRevision),
                    newApi = false;

                if (!api) {
                    api = new Api(getBasePath(), node.module, node.moduleRevision);
                    newApi = true;
                }

                api.addSubApis(processSingleRootNode(node));

                if (newApi) {
                    apis.push(api);
                }
            });

            apis = removeDuplicatedApis(apis);

            printApis(apis);

            return apis;
        }

        // TODO: add service's description
        function processSingleRootNode(node) {
            var templateStr = nodePathStringCreator[node.type](node, ''),
                subApis = createSubApis(node, templateStr);

            node.children.forEach(function (ch) {
                nodeChildrenProcessor(ch, templateStr, subApis);
            });

            return subApis;
        }

    }

    ApiBuilderService.$inject = ['ArrayUtilsService', 'PathUtilsService', 'NodeUtilsService',
                                'YangUtilsRestangularService', 'CustomFuncService'];

    return ApiBuilderService;

});
