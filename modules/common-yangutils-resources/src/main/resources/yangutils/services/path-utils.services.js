define([], function () {
    'use strict';

    function PathUtilsService(ArrayUtilsService){

        var service = {
                clearPath: clearPath,
                createPathElement: createPathElement,
                getModuleNameFromPath: getModuleNameFromPath,
                getStorageAndNormalizedPath: getStorageAndNormalizedPath,
                fillIdentifiers: fillIdentifiers,
                findIndexOfStrInPathStr: findIndexOfStrInPathStr,
                fillListNode: fillListNode,
                fillListRequestData: fillListRequestData,
                fillPath: fillPath,
                search: search,
                searchNodeByPath: searchNodeByPath,
                translate: translate,
                translatePathArray: translatePathArray,
                __test: {
                    PathElem: PathElem,
                    getModuleNodePair: getModuleNodePair,
                    isIdentifier: isIdentifier,
                },
            },
            parentPath = '..';

        return service;

        // TODO: add service's description
        function createPathElement(name, module, identifierStrings, moduleChanged, revision) {
            return new PathElem(name, module, identifierStrings, moduleChanged, revision);
        }

        // TODO: add service's description
        function search(node, path) {
            var pathElem = path.shift(),
                selNode = pathElem.name === parentPath ?
                    node.parent :
                    ArrayUtilsService.getFirstElementByCondition(node.children, function (child) {
                        return pathElem.checkNode(child);
                    });

            if (selNode !== null) {
                if (path.length) {
                    return search(selNode, path);
                } else {
                    return selNode;
                }
            } else {
                console.warn('search: cannot find element ', pathElem.name);
                return null;
            }
        }

        // TODO: add service's description
        function translate(path, prefixConverter, importNodes, getDefaultModuleCallback, notIdentifiers) {
            var pathStrElements = path.split('/').filter(function (e) {
                    return e !== '';
                }),
                pathArrayElements = [],
                index,
                maxIndex = pathStrElements.length,
                getLastElement = function (a) {
                    return pathArrayElements.length > 0 ? pathArrayElements[pathArrayElements.length - 1] : null;
                },
                getElementModule = function (e) {
                    return e ? e.module : '';
                },
                getModuleChange = function (actModule, lastElemModule) {
                    return (lastElemModule !== null) ? actModule !== lastElemModule : false;
                };

            for (index = 0; index < maxIndex; index += 1) {
                var actElem = pathStrElements[index],
                    lastElem = getLastElement(pathArrayElements),
                    checkIdentifier = notIdentifiers ? false : isIdentifier(actElem);

                if (checkIdentifier && lastElem) {
                    lastElem.addIdentifier(actElem.slice(1, -1));
                } else {

                    var lastElemModule = getElementModule(lastElem),
                        defaultModule = getDefaultModuleCallback ? getDefaultModuleCallback() : lastElemModule,
                        pair = getModuleNodePair(actElem, defaultModule),
                        processedModule = (prefixConverter && pair[0] !== lastElemModule) ?
                                                                                prefixConverter(pair[0]) : pair[0],
                        revision = importNodes ? searchForRevisionInImportNodes(processedModule, importNodes) : null,
                        pathElem = createPathElement(pair[1], processedModule, null, getModuleChange(processedModule, lastElemModule), revision);

                    pathArrayElements.push(pathElem);
                }
            }

            return pathArrayElements;
        }

        // TODO: add service's description
        function translatePathArray(pathArray) {
            var getIdentifiersValues = function (identifiers) {
                    return identifiers.map(function (i) {
                        return i.value.length ? i.value.replace(/\//g, '%2F') : '{' + i.label + '}';
                    }).join('/');
                },
                getLastElem = function (i) {
                    var result = null;
                    if ((i - 1) >= 0) {
                        result = pathArray[i - 1];
                    }
                    return result;
                },
                getModuleStr = function (actElem, lastElem) {
                    return ((lastElem && actElem.module && lastElem.module !== actElem.module) ?
                                                                                        (actElem.module + ':') : '');
                },
                getIdentifiersStr = function (actElem) {
                    return (actElem.hasIdentifier() ? '/' + getIdentifiersValues(actElem.identifiers) : '');
                },
                getElemStr = function (actElem, lastElem) {
                    return getModuleStr(actElem, lastElem) + actElem.name + getIdentifiersStr(actElem);
                };

            return pathArray.map(function (pe, i) {
                return getElemStr(pe, getLastElem(i));
            });
        }

        /**
         * Service for filling API url object from url string data
         * @param pathArrayIn
         * @param pathString
         */
        function fillPath(pathArrayIn, pathString) {
            var pathArray = trimPath(pathString).split('/'),
                pathPosition = 0;

            pathArrayIn.forEach(function (pathItem){
                if ( pathItem.hasIdentifier() ){
                    pathItem.identifiers.forEach(function (identifier){
                        pathPosition++;
                        identifier.value = isIdentifier(pathArray[pathPosition]) ? '' : pathArray[pathPosition];
                    });
                }
                pathPosition++;
            });

        }

        /**
         * Service for clearing api path object
         * @param pathArrayIn
         */
        function clearPath(pathArrayIn){
            pathArrayIn.forEach(function (pathItem){
                if ( pathItem.hasIdentifier() ){
                    pathItem.identifiers.forEach(function (identifier){
                        identifier.value = '';
                    });
                }
            });
        }

        // TODO: add service's description
        function getModuleNameFromPath(path){
            var pathArray = translate(trimPath(path));

            return pathArray.length > 1 ? pathArray[1].module : null;
        }

        // TODO: add service's description
        function searchNodeByPath(pathString, treeApis, treeData, disabledExpand, notIdentifiers) {
            var pathArray = translate(trimPath(pathString), null, null, null, notIdentifiers),
                module = pathArray.length > 1 ? pathArray[1].module : null,
                selectedTreeApi = module ? treeApis.filter(function (treeApi) {
                    return treeApi.module === module;
                })[0] : null,
                retObj = null;

            if (selectedTreeApi && pathArray.length) {
                var actElem = selectedTreeApi,
                    continueCondition = true;

                if ( !disabledExpand ) {
                    changeTreeDataByProp(treeData, ['expanded', 'selected'], [false, false]);
                }

                for (var i = 0; i < pathArray.length && continueCondition; ) {
                    if ( !disabledExpand ) {
                        changeTreeDataNode(actElem, treeData, 'expanded', true);
                    }

                    var nextElem = getActElementChild(actElem, pathArray[i].name);
                    if (nextElem !== null) {
                        actElem = nextElem;
                        i = i + ( actElem && actElem.identifiersLength > 0 ? actElem.identifiersLength + 1 : 1);
                    } else {
                        continueCondition = false;
                    }
                }

                if ( !disabledExpand ) {
                    changeTreeDataNode(actElem, treeData, 'selected', true);
                }

                if (actElem) {
                    retObj = { indexApi: actElem.indexApi, indexSubApi: actElem.indexSubApi };
                }
            }
            return retObj;
        }

        // TODO: add service's description
        function fillIdentifiers(identifiers, label, value) {
            identifiers.some(function (i) {
                var identifierMatch = i.label === label;
                if (identifierMatch) {
                    i.value = value || '';
                }

                return identifierMatch;
            });
        }

        // TODO: add service's description
        function fillListNode(node, label, value) {
            if (node.type === 'list' && node.actElemStructure !== null) {
                var nodeToFill = node.actElemStructure.getChildren('leaf', label)[0];

                if (nodeToFill) {
                    nodeToFill.fill(nodeToFill.label, value);
                }
            }
        }

        // TODO: add service's description
        function fillListRequestData(data, listLabel, label, value){
            if ( data.hasOwnProperty(listLabel) && data[listLabel].length ) {
                data[listLabel][0][label] = value;
            }
        }

        // TODO: add service's description
        function findIndexOfStrInPathStr(pathParts, targetStr) { // pathParts is path string split by '/'
            var targetIndex = -1;

            pathParts.some(function (p, i) {
                var condition = p === targetStr;
                if (condition) {
                    targetIndex = i;
                }
                return condition;
            });

            return targetIndex;
        }

        // TODO: add service's description
        function getStorageAndNormalizedPath(pathStr) {
            var pathParts = pathStr.split('/'),
                restconfIndex = findIndexOfStrInPathStr(pathParts, 'restconf'),
                storage = pathParts[restconfIndex + 1],
                normalizedPath = pathParts.slice(restconfIndex + 1).join('/');

            return { storage: storage, normalizedPath: normalizedPath };
        }

        /**
         * Base identifier object
         * @param label
         * @param value
         * @constructor
         */
        function Identifier(label, value) {
            this.label = label;
            this.value = value || '';
        }

        /**
         * Base path element object
         * @param name
         * @param module
         * @param identifierNames
         * @param moduleChanged
         * @param revision
         * @constructor
         */
        function PathElem(name, module, identifierNames, moduleChanged, revision) {
            this.name = name;
            this.module = module;
            this.identifiers = identifierNames ? identifierNames.map(function (name) {
                return new Identifier(name);
            }) : [];
            this.moduleChanged = moduleChanged || false;
            this.revision = revision;

            this.equals = function (comparedElem, compareIdentifierValues) {
                var result = this.name === comparedElem.name &&
                                this.module === comparedElem.module &&
                                this.identifiers.length === comparedElem.identifiers.length;

                if (result) {
                    var identifiersCnt = this.identifiers.length,
                        i;

                    for (i = 0; i < identifiersCnt && result; i++) {
                        result = this.identifiers[i].label === comparedElem.identifiers[i].label;
                        if (compareIdentifierValues) {
                            result = this.identifiers[i].value === comparedElem.identifiers[i].value;
                        }
                    }
                }

                return result;
            };

            this.hasIdentifier = function () {
                return this.identifiers.length > 0;
            };

            this.addIdentifier = function (name) {
                this.identifiers.push(new Identifier(name));
            };

            this.getIdentifierValues = function () {
                return this.identifiers.map(function (i) {
                    return i.value;
                });
            };

            this.toString = function () {
                return (this.module ? this.module + ':' : '') + this.name + '/' + (this.hasIdentifier() ?
                                                                    this.getIdentifierValues().join('/') + '/' : '');
            };

            this.checkNode = function (node) {
                return (this.module ? this.module === node.module : true) &&
                        (this.name ? this.name === node.label : true) &&
                        (this.revision ? this.revision === node.moduleRevision : true);
            };

            this.clone = function () {
                var copy = new PathElem(this.name, this.module, null, this.moduleChanged, this.revision);

                copy.identifiers = this.identifiers.map(function (i) {
                    return new Identifier(i.label, i.value);
                });

                return copy;
            };
        }

        // TODO: add function's description
        function trimPath(pathString) {
            var searchStr = 'restconf',
                output = pathString;

            if (pathString.indexOf(searchStr) > -1) {
                output = pathString.slice(pathString.indexOf(searchStr) + searchStr.length + 1);
            }

            return output;
        }

        // TODO: add function's description
        function changeTreeDataNode(treeApiNode, treeData, prop, val) {
            var sel = treeApiNode ? treeData.filter(function (d) {
                return d.branch.uid === treeApiNode.uid;
            }) : [];

            if (sel.length === 1) {
                sel[0].branch[prop] = val;
            }
        }

        // TODO: add function's description
        function changeTreeDataByProp(treeData, props, vals) {
            treeData.forEach(function (d, index) {
                props.forEach(function (v, i){
                    d.branch[v] = vals[i];
                });
            });
        }

        // TODO: add function's description
        function getActElementChild(actElem, childLabel) {
            var sel = actElem.children.filter(function (child) {
                    return child.label === childLabel;
                }),
                ret = sel.length === 1 ? sel[0] : null;

            return ret;
        }

        // TODO: add function's description
        function getModuleNodePair(pathString, defaultModule) {
            return pathString.indexOf(':') > -1 ? pathString.split(':') : [defaultModule, pathString];
        }

        /**
         * Tool for check if item is identifier
         * @param item
         * @returns {boolean}
         */
        function isIdentifier(item) {
            return (item.indexOf('{') === item.indexOf('}')) === false;
        }

        // TODO: add function's description
        function searchForRevisionInImportNodes(module, importNodes) {
            var revision = null,
                node = importNodes.filter(function (i) {
                    return i.label === module;
                })[0];

            if (node) {
                revision = node._revisionDate;
            }

            return revision;
        }
    }

    PathUtilsService.$inject = ['ArrayUtilsService'];

    return PathUtilsService;

});
