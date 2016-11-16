define([], function () {
    'use strict';

    function YinParserService($http, SyncService, constants, PathUtilsService, YangUiApisService, NodeUtilsService){
        var augmentType = 'augment',
            path = './assets',
            service = {
                parseYang: parseYang,
                parseYangMP: parseYangMP,
                Augmentations: Augmentations,
                Module: Module,
                yangParser: new YangParser(),
                __test: {
                    path: path,
                    parentTag: parentTag,
                    yangParser: new YangParser(),
                    Augmentation: Augmentation,
                    Module: Module,
                },
            };

        return service;

        // TODO: add service's description
        function parseYangMP(baseApiPath, name, rev, callback, errorCbk) {
            var path = baseApiPath + '/' + name + '/' + rev + '/schema';

            YangUiApisService.getSingleModuleInfo(path)
                .then(function (data) {
                    if ($.parseXML(data.data) !== null) {
                        parseModule(data.data, callback);
                    } else {
                        loadStaticModule(name, callback, errorCbk);
                    }
                }, function () {
                    loadStaticModule(name, callback, errorCbk);
                });
        }

        // TODO: add service's description
        function parseYang(name, rev, callback, errorCbk) {
            YangUiApisService.getModuleSchema(name, rev).get()
                .then(function (data) {
                    if ($.parseXML(data) !== null) {
                        parseModule(data, callback);
                    } else {
                        loadStaticModule(name, callback, errorCbk);
                    }
                }, function () {
                    loadStaticModule(name, callback, errorCbk);
                });
        }

        // TODO: add service's description
        function parentTag(xml) {
            if (xml.get(0).tagName.toLowerCase() === 'module') {
                return xml.get(0);
            } else {
                return parentTag(xml.parent());
            }
        }

        // TODO: add function's description
        function parseModule(data, callback) {
            var yangParser = new YangParser();

            var moduleName = $($.parseXML(data).documentElement).attr('name'),
                moduleNamespace = $($.parseXML(data)).find('namespace').attr('uri'),
                moduleoduleRevision = $($.parseXML(data)).find('revision').attr('date'),
                moduleObj = new Module(moduleName, moduleoduleRevision, moduleNamespace);

            yangParser.setCurrentModuleObj(moduleObj);
            yangParser.parse($.parseXML(data).documentElement, moduleObj);

            yangParser.sync.waitFor(function () {
                callback(moduleObj);
            });
        }

        // TODO: add function's description
        function loadStaticModule(name, callback, errorCbk) {
            var yinPath = '/yang2xml/' + name + '.yang.xml';
            $http.get(path + yinPath).success(function (data) {
                parseModule(data, callback);
            }).error(function () {
                errorCbk();
                return null;
            });
        }

        /**
         * Base Module object
         * @param name
         * @param revision
         * @param namespace
         * @constructor
         */
        function Module(name, revision, namespace) {
            this._name = name;
            this._revision = revision;
            this._namespace = namespace;
            this._statements = {};
            this._roots = [];
            this._augments = [];

            this.getRoots = function () {
                return this._roots;
            };

            this.getImportByPrefix = function (prefix) {
                var importNode = null;

                if (this._statements.hasOwnProperty('import')) {
                    importNode = this._statements.import.filter(function (importItem) {
                        return importItem._prefix === prefix;
                    })[0];
                }

                return importNode;
            };

            this.getRawAugments = function () {
                return this._augments;
            };

            this.getAugments = function () {
                var self = this;

                return this.getRawAugments().map(function (augNode) {
                    augNode.path = PathUtilsService.translate(augNode.pathString, prefixConverter, self._statements.import, getDefaultModule);

                    return new Augmentation(augNode);

                    // TODO: add function's description
                    function prefixConverter(prefix) {
                        var importNode = self.getImportByPrefix(prefix);
                        return importNode ? importNode.label : null;
                    }

                    // TODO: add function's description
                    function getDefaultModule() {
                        return null;
                    }
                });
            };

            this.addChild = function (node) {
                if (!this._statements.hasOwnProperty(node.type)) {
                    this._statements[node.type] = [];
                }

                var duplicates = this._statements[node.type].filter(function (item) {
                    return node.label === item.label && node.nodeType === item.nodeType;
                });

                if (duplicates && duplicates.length > 0) {
                } else {
                    this._statements[node.type].push(node);

                    if (NodeUtilsService.isRootNode(node.type)) {
                        this._roots.push(node);
                    }

                    if (node.type === 'augment') {
                        this._augments.push(node);
                    }
                }
            };

            this.searchNode = function (type, name) {
                var searchResults = null,
                    searchedNode = null;

                if (this._statements[type]) {
                    searchResults = this._statements[type].filter(function (node) {
                        return name === node.label;
                    });
                }

                if (searchResults && searchResults.length === 0) {
                } else if (searchResults && searchResults.length > 1) {
                } else if (searchResults && searchResults.length === 1) {
                    searchedNode = searchResults[0];
                }

                return searchedNode;
            };
        }

        /**
         * Base Node element object
         * @param id
         * @param name
         * @param type
         * @param module
         * @param namespace
         * @param parent
         * @param nodeType
         * @param moduleRevision
         * @constructor
         */
        function Node(id, name, type, module, namespace, parent, nodeType, moduleRevision) {
            this.id = id;
            this.label = name;
            this.localeLabel = constants.LOCALE_PREFIX + name.toUpperCase();
            this.type = type;
            this.module = module;
            this.children = [];
            this.parent = parent;
            this.nodeType = nodeType;
            this.namespace = namespace;
            this.moduleRevision = moduleRevision;

            this.appendTo = function (parentNode) {
                parentNode.addChild(this);
            };

            this.addChild = function (node) {
                if (this.children.indexOf(node) === -1) {
                    this.children.push(node);
                    node.parent = this;
                }

            };

            this.deepCopy = function deepCopy(additionalProperties) {
                var copy = new Node(this.id, this.label, this.type, this.module, this.namespace, null,
                                    this.nodeType, this.moduleRevision),
                    self = this;

                additionalProperties = (additionalProperties || []).concat(['pathString']);

                additionalProperties.forEach(function (prop) {
                    if (prop !== 'children' && self.hasOwnProperty(prop) && copy.hasOwnProperty(prop) === false) {
                        copy[prop] = self[prop];
                    }
                });

                this.children.forEach(function (child) {
                    var childCopy = child.deepCopy(additionalProperties);
                    childCopy.parent = copy;
                    copy.children.push(childCopy);
                });
                return copy;
            };

            this.getCleanCopy = function (){
                return new Node(this.id, this.label, this.type, this.module, this.namespace, null,
                                this.nodeType, this.moduleRevision);
            };

            this.getChildren = function (type, name, nodeType, property) {
                var filteredChildren = this.children.filter(function (item) {
                    return (name != null ? name === item.label : true) &&
                                            (type != null ? type === item.type : true) &&
                                            (nodeType != null ? nodeType === item.nodeType : true);
                });

                if (property) {
                    return filteredChildren.filter(function (item) {
                        return item.hasOwnProperty(property);
                    }).map(function (item) {
                        return item[property];
                    });
                } else {
                    return filteredChildren;
                }
            };

        }

        /**
         * Base Augment group object
         * @constructor
         */
        function AugmentationsGroup(){
            this.obj = {};

            this.addAugumentation = function (augumentation){
                this.obj[augumentation.id] = augumentation;
            };
        }

        /**
         * Base augment's groups object
         * @constructor
         */
        function Augmentations(){
            this.groups = {};

            this.addGroup  = function (groupId){
                this.groups[groupId] = !this.groups.hasOwnProperty(groupId) ?
                                                                    new AugmentationsGroup() : this.groups[groupId];
            };

            this.getAugmentation = function (node, augId) {
                return this.groups[node.module + ':' + node.label] ?
                                                        this.groups[node.module + ':' + node.label].obj[augId] : null;
            };
        }

        /**
         * Base Augment object
         * @param node
         * @constructor
         */
        function Augmentation(node) {
            var self = this;
            this.node = node;
            this.path = (node.path ? node.path : []);
            this.id = node.module + ':' + node.label;
            this.expanded = true;
            // AUGMENT FIX
            // node.label = node.module + ':' + node.label;


            this.toggleExpand = function () {
                this.expanded = !this.expanded;
            };

            this.setAugmentationGroup = function (targetNode, augumentations){
                var targetNodeId = targetNode.module + ':' + targetNode.label;
                targetNode.augmentionGroups = targetNode.augmentionGroups ? targetNode.augmentionGroups : [];
                targetNode.augmentionGroups.push(self.id);

                augumentations.addGroup(targetNodeId);
                augumentations.groups[targetNodeId].addAugumentation(self);
            };

            this.apply = function (nodeList, augumentations) {
                var targetNode = this.getTargetNodeToAugment(nodeList);

                if (targetNode) {
                    this.setAugmentationGroup(targetNode, augumentations);

                    this.node.children.forEach(function (child) {
                        child.appendTo(targetNode);
                        child.augmentationId = self.id;
                        // AUGMENT FIX
                        // child.children.forEach(function (moduleChild) {
                        //     moduleChild.label = moduleChild.module + ':' + moduleChild.label;
                        // });
                    });
                } else {
                }
            };

            this.getTargetNodeToAugment = function (nodeList) {
                return PathUtilsService.search({ children: nodeList }, this.path.slice());
            };

            this.getPathString = function () {
                return this.path.map(function (elem) {
                    return elem.module + ':' + elem.name;
                }).join('/');
            };

        }

        /**
         * Base yang xml parser
         * @constructor
         */
        function YangParser() {
            this.rootNodes = [];
            this.nodeIndex = 0;
            this.sync = SyncService.generateObj();
            this.moduleObj = null;

            this.setCurrentModuleObj = function (moduleObj) {
                this.moduleObj = moduleObj;
            };

            this.createNewNode = function (name, type, parentNode, nodeType) {
                var node = new Node(this.nodeIndex++, name, type, this.moduleObj._name, this.moduleObj._namespace, parentNode, nodeType, this.moduleObj._revision);

                if (parentNode) {
                    parentNode.addChild(node);
                }

                return node;
            };

            this.parse = function (xml, parent) {
                var self = this;

                $(xml).children().each(function (_, item) {
                    var prop = item.tagName.toLowerCase();
                    if (self.hasOwnProperty(prop)) {
                        self[prop](item, parent);
                    } else {
                        // self.parse(this, parent);
                    }
                });
            };

            this.config = function (xml, parent) {
                var type = constants.DATA_STORE_CONFIG,
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_ALTER;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.presence = function (xml, parent) {
                var type = 'presence',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_ALTER;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.leaf = function (xml, parent) {
                var type = 'leaf',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this['leaf-list'] = function (xml, parent) {
                var type = 'leaf-list',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.container = function (xml, parent) {
                var type = 'container',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.choice = function (xml, parent) {
                var type = 'choice',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.case = function (xml, parent) {
                var type = 'case',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.list = function (xml, parent) {
                var type = 'list',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };


            this.key = function (xml, parent) {
                var type = 'key',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_ALTER,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.description = function (xml, parent) {
                var type = 'description',
                    name = $(xml).attr('text') ? $(xml).attr('text') : $(xml).children('text:first').text(),
                    nodeType = constants.NODE_ALTER,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.typedef = function (xml, parent, typedefName) {
                var type = 'typedef',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_LINK_TARGET,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.grouping = function (xml, parent, groupingName) {
                var type = 'grouping',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_LINK_TARGET,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.uses = function (xml, parent) {
                var type = 'uses',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_LINK,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.import = function (xml, parent) {
                var type = 'import',
                    name = $(xml).attr('module'),
                    nodeType = constants.NODE_ALTER,
                    node = this.createNewNode(name, type, parent, nodeType);

                node._prefix = $(xml).children('prefix:first').attr('value');
                node._revisionDate = $(xml).children('revision-date:first').attr('date');
            };

            this.augment = function (xml, parent) {
                var type = augmentType,
                    nodeType = constants.NODE_ALTER,
                    augmentIndentifier = $(xml).children('ext\\:augment-identifier:first').attr('ext:identifier'),
                    name = augmentIndentifier ? augmentIndentifier : 'augment' + (this.nodeIndex + 1).toString(),
                    pathString = $(xml).attr('target-node'),
                    augmentRoot = this.createNewNode(name, type, parent, nodeType);

                augmentRoot.pathString = pathString;
                this.parse(xml, augmentRoot);
            };


            this.rpc = function (xml, parent) {
                var type = constants.NODE_RPC,
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.input = function (xml, parent) {
                var type = 'input',
                    name = 'input',
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.output = function (xml, parent) {
                var type = 'output',
                    name = 'output',
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.pattern = function (xml, parent) {
                var type = 'pattern',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_RESTRICTIONS;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.range = function (xml, parent) {
                var type = 'range',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_RESTRICTIONS;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.length = function (xml, parent) {
                var type = 'length',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_RESTRICTIONS;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.enum = function (xml, parent) {
                var type = 'enum',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_ALTER;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.bit = function (xml, parent) {
                var type = 'bit',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_ALTER,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };

            this.position = function (xml, parent) {
                var type = 'position',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_ALTER;

                this.createNewNode(name, type, parent, nodeType);
            };

            this.type = function (xml, parent) {
                var type = 'type',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_ALTER,
                    node = this.createNewNode(name, type, parent, nodeType);

                this.parse(xml, node);
            };
        }
    }

    YinParserService.$inject = ['$http', 'SyncService', 'constants', 'PathUtilsService', 'YangUiApisService',
                                'NodeUtilsService'];

    return YinParserService;

});
