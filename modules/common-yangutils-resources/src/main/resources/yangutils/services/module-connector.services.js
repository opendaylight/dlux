define([], function () {
    'use strict';

    function ModuleConnectorService(){

        var service = {
                processModuleObjs: processModuleObjs,
                __test: {
                    isBuildInType: isBuildInType,
                    linkFunctions: linkFunctions,
                    findLinkedStatement: findLinkedStatement,
                    appendChildren: appendChildren,
                    searchModule: searchModule,
                    applyLinks: applyLinks,
                    interConnectModules: interConnectModules,
                    applyModuleRevision: applyModuleRevision,
                },
            },
            linkFunctions = {
                uses: uses,
                type: type,
            };

        return service;

        // TODO: add service's description
        function processModuleObjs(modules) {
            var rootNodes = [],
                augments = [],
                connectedModules = interConnectModules(modules.slice());

            connectedModules.forEach(function (module) {
                rootNodes = rootNodes.concat(module.getRoots());
                augments = augments.concat(module.getAugments());
            });

            return { rootNodes: rootNodes, augments: augments };
        }

        // TODO: add function's description
        function uses(usesNode, currentModule) {
            var targetType = 'grouping';
            return function (modules) {
                var data = findLinkedStatement(usesNode, targetType, currentModule, modules),
                    node = data.node,
                    module = data.module,
                    changed = false;

                if (node && module) {
                    usesNode.parent.children.splice(usesNode.parent.children.indexOf(usesNode), 1); // delete uses node
                    for (var i = 0; i < node.children.length; i++) {
                        applyLinks(node.children[i], module, modules);
                    }
                    appendChildren(usesNode.parent, node);
                    changed = true;
                }

                return changed;
            };
        }

        // TODO: add function's description
        function type(typeNode, currentModule) {
            var targetType = 'typedef';

            if (isBuildInType(typeNode.label) === false) {
                return function (modules) {
                    var data = findLinkedStatement(typeNode, targetType, currentModule, modules),
                        node = data.node ? data.node.getChildren('type')[0] : null,
                        changed = false;

                    if (node) {
                        // delete referencing type node
                        typeNode.parent.children.splice(typeNode.parent.children.indexOf(typeNode), 1);
                        typeNode.parent.addChild(node);
                        changed = true;
                    }

                    return changed;
                };
            } else {
                return function (modules) {
                    return false;
                };
            }
        }

        // TODO: add function's description
        function isBuildInType(type) {
            return ['int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64',
                    'decimal64', 'string', 'boolean', 'enumeration', 'bits', 'binary',
                    'leafref', 'identityref', 'empty', 'union', 'instance-identifier'].indexOf(type) > -1;
        }

        // TODO: add function's description
        function findLinkedStatement(node, targetType, currentModule, modules) {
            var sourceNode,
                sourceModule,
                link = node.label;

            if (link.indexOf(':') > -1) {
                var parts = link.split(':'),
                    targetImport = currentModule.getImportByPrefix(parts[0]);

                sourceModule = targetImport ?
                                    searchModule(modules, targetImport.label, targetImport.revisionDate) : null;
                sourceNode = sourceModule ? sourceModule.searchNode(targetType, parts[1]) : null;
            } else {
                sourceModule = searchModule(modules, node.module, node.moduleRevision);
                sourceNode = sourceModule ? sourceModule.searchNode(targetType, link) : null;
            }

            return { node: sourceNode, module: sourceModule };
        }

        // TODO: add function's description
        function appendChildren(targetNode, sourceNode) {
            sourceNode.children.forEach(function (child) {
                targetNode.addChild(child);
            });
        }

        // TODO: add function's description
        function searchModule(modules, moduleName, moduleRevision) {
            var searchResults = modules.filter(function (item) {
                    return (moduleName === item._name && (moduleRevision ? moduleRevision === item._revision : true));
                }),
                targetModule = (searchResults && searchResults.length) ? searchResults[0] : null;

            return targetModule;
        }

        // TODO: add function's description
        function applyLinks(node, module, modules) {
            var changed = false;
            if (linkFunctions.hasOwnProperty(node.type)) { // applying link function to uses.node
                changed = linkFunctions[node.type](node, module)(modules);
            }

            for (var i = 0; i < node.children.length; i++) {
                if (applyLinks(node.children[i], module, modules)) {
                    i--;
                    // need to repeat current index because we are deleting uses nodes,
                    // so in case there are more uses in row, it would skip second one
                }
            }

            return changed;
        }

        // TODO: add function's description
        function interConnectModules(modules) {

            modules.forEach(function (module) {
                module.getRoots().concat(module.getRawAugments()).forEach(function (node) {
                    applyLinks(node, module, modules);
                });
            });

            modules.forEach(function (module) {
                var copy = null;

                module._roots = module.getRoots().map(function (node) {
                    copy = node.deepCopy();
                    return applyModuleRevision(copy, module._name, module._revision);
                });

                module._augments = module.getRawAugments().map(function (node) {
                    copy = node.deepCopy();
                    return applyModuleRevision(copy, module._name, module._revision);
                });
            });

            return modules;
        }

        // TODO: add function's description
        function applyModuleRevision(node, module, revision) {
            node.module = module;
            node.moduleRevision = revision;

            node.children.map(function (child) {
                return applyModuleRevision(child, module, revision);
            });

            return node;
        }
    }

    ModuleConnectorService.$inject = [];

    return ModuleConnectorService;

});
