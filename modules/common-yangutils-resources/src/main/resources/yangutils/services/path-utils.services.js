define([], function () {
    'use strict';

    function PathUtilsService(ArrayUtilsService){
        var pathUtils = {},
            parentPath = '..';

        var Idenfitier = function(label, value) {
            this.label = label;
            this.value = value || '';
        };

        var PathElem = function (name, module, identifierNames, moduleChanged, revision) {
            this.name = name;
            this.module = module;
            this.identifiers = identifierNames ? identifierNames.map(function(name) {
                return new Idenfitier(name);
            }) : [];
            this.moduleChanged = moduleChanged || false;
            this.revision = revision;

            this.equals = function(comparedElem, compareIdentifierValues) {
                var result = this.name === comparedElem.name && this.module === comparedElem.module && this.identifiers.length === comparedElem.identifiers.length;

                if(result) {
                    var identifiersCnt = this.identifiers.length,
                        i;

                    for(i = 0; i < identifiersCnt && result; i++) {
                        result = this.identifiers[i].label === comparedElem.identifiers[i].label;
                        if(compareIdentifierValues) {
                            result = this.identifiers[i].value === comparedElem.identifiers[i].value;
                        }
                    }
                }

                return result;
            };

            this.hasIdentifier = function () {
                return this.identifiers.length > 0;
            };

            this.addIdentifier = function(name) {
                this.identifiers.push(new Idenfitier(name));
            };

            this.getIdentifierValues = function() {
                return this.identifiers.map(function(i) {
                    return i.value;
                });
            };

            this.toString = function () {
                return (this.module ? this.module + ':' : '') + this.name + '/' + (this.hasIdentifier() ? this.getIdentifierValues().join('/') + '/' : '');
            };

            this.checkNode = function (node) {
                return (this.module ? this.module === node.module : true) && (this.name ? this.name === node.label : true) && (this.revision ? this.revision === node.moduleRevision : true);
            };

            this.clone = function() {
                var copy = new PathElem(this.name, this.module, null, this.moduleChanged, this.revision);

                copy.identifiers = this.identifiers.map(function(i) {
                    return new Idenfitier(i.label, i.value);
                });

                return copy;
            };
        };

        var getModuleNodePair = function (pathString, defaultModule) {
            return pathString.indexOf(':') > -1 ? pathString.split(':') : [defaultModule, pathString];
        };

        var isIdentifier = function (item) {
            return (item.indexOf('{') === item.indexOf('}')) === false;
        };

        var searchForRevisionInImportNodes = function(module, importNodes) {
            var revision = null,
                node = importNodes.filter(function(i) {
                    return i.label === module;
                })[0];

            if(node) {
                revision = node._revisionDate;
            }

            return revision;
        };

        pathUtils.createPathElement = function (name, module, identifierStrings, moduleChanged, revision) {
            return new PathElem(name, module, identifierStrings, moduleChanged, revision);
        };

        pathUtils.search = function (node, path) {
            var pathElem = path.shift(),
                selNode = pathElem.name === parentPath ?
                    node.parent :
                    ArrayUtilsService.getFirstElementByCondition(node.children, function (child) {
                        return pathElem.checkNode(child);
                    });

            if (selNode !== null) {
                if (path.length) {
                    return pathUtils.search(selNode, path);
                } else {
                    return selNode;
                }
            } else {
                console.warn('pathUtils.search: cannot find element ',pathElem.name);
                return null;
            }
        };

        pathUtils.translate = function(path, prefixConverter, importNodes, getDefaultModuleCallback) {
            var pathStrElements = path.split('/').filter(function(e) {
                    return e !== '';
                }),
                pathArrayElements = [],
                index,
                maxIndex = pathStrElements.length,
                getLastElement = function(a) {
                    return pathArrayElements.length > 0 ? pathArrayElements[pathArrayElements.length - 1] : null;
                },
                getElementModule = function(e) {
                    return e ? e.module : '';
                },
                getModuleChange = function(actModule, lastElemModule) {
                    return (lastElemModule !== null) ? actModule !== lastElemModule : false;
                };

            for(index = 0; index < maxIndex; index += 1) {
                var actElem = pathStrElements[index],
                    lastElem = getLastElement(pathArrayElements);

                if(isIdentifier(actElem) && lastElem) {
                    lastElem.addIdentifier(actElem.slice(1, -1));
                } else {

                    var lastElemModule = getElementModule(lastElem),
                        defaultModule = getDefaultModuleCallback ? getDefaultModuleCallback() : lastElemModule,
                        pair = getModuleNodePair(actElem, defaultModule),
                        processedModule = (prefixConverter && pair[0] !== lastElemModule) ? prefixConverter(pair[0]) : pair[0],
                        revision = importNodes ? searchForRevisionInImportNodes(processedModule, importNodes) : null,
                        pathElem = pathUtils.createPathElement(pair[1], processedModule, null, getModuleChange(processedModule, lastElemModule), revision);

                    pathArrayElements.push(pathElem);
                }
            }

            return pathArrayElements;
        };

        pathUtils.translatePathArray = function(pathArray) {
            var getIdentifiersValues = function(identifiers) {
                    return identifiers.map(function(i) {
                        return i.value.replace(/\//g, '%2F');
                    }).join('/');
                },
                getLastElem = function(i) {
                    var result = null;
                    if((i - 1) >= 0) {
                        result = pathArray[i - 1];
                    }
                    return result;
                },
                getModuleStr = function(actElem, lastElem) {
                    return ((lastElem && actElem.module && lastElem.module !== actElem.module) ? (actElem.module + ':') : '');
                },
                getIdentifiersStr = function(actElem) {
                    return (actElem.hasIdentifier() ? '/' + getIdentifiersValues(actElem.identifiers) : '');
                },
                getElemStr = function(actElem, lastElem) {
                    return getModuleStr(actElem, lastElem) + actElem.name + getIdentifiersStr(actElem);
                };

            return pathArray.map(function(pe, i) {
                return getElemStr(pe, getLastElem(i));
            });
        };

        var trimPath = function(pathString) {
            var searchStr = 'restconf',
                output = pathString;

            if(pathString.indexOf(searchStr) > -1) {
                output = pathString.slice(pathString.indexOf(searchStr)+searchStr.length+1);
            }

            return output;
        };

        var changeTreeDataNode = function(treeApiNode, treeData, prop, val) {
            var sel = treeApiNode ? treeData.filter(function(d) {
                return d.branch.uid === treeApiNode.uid;
            }) : [];

            if(sel.length === 1) {
                sel[0].branch[prop] = val;
            }
        };

        var changeTreeDataByProp = function(treeData, props, vals) {
            treeData.forEach(function(d, index) {
                props.forEach(function(v, i){
                    d.branch[v] = vals[i];
                });
            });
        };

        pathUtils.fillPath = function(pathArrayIn, pathString) {
            var pathArray = trimPath(pathString).split('/'),
                pathPosition = 0;

            pathArrayIn.forEach(function(pathItem, index){
                if ( pathItem.hasIdentifier() ){
                    pathItem.identifiers.forEach(function(identifier){
                        pathPosition++;
                        identifier.value = pathArray[pathPosition];
                    });
                }
                pathPosition++;
            });

        };

        var getActElementChild = function(actElem, childLabel) {
            var sel = actElem.children.filter(function(child) {
                    return child.label === childLabel;
                }),
                ret = sel.length === 1 ? sel[0] : null;

            return ret;
        };

        pathUtils.getModuleNameFromPath = function(path){
            var pathArray = pathUtils.translate(trimPath(path));

            return pathArray.length > 1 ? pathArray[1].module : null;
        };

        pathUtils.searchNodeByPath = function(pathString, treeApis, treeData, disabledExpand) {
            var pathArray = pathUtils.translate(trimPath(pathString)),
                module = pathArray.length > 1 ? pathArray[1].module : null,
                selectedTreeApi = module ? treeApis.filter(function(treeApi) {
                    return treeApi.module === module;
                })[0] : null,
                retObj = null;

            if(selectedTreeApi && pathArray.length) {
                var actElem = selectedTreeApi,
                    continueCondition = true;

                if ( !disabledExpand ) {
                    changeTreeDataByProp(treeData, ['expanded','selected'], [false, false]);
                }

                for(var i = 0; i < pathArray.length && continueCondition; ) {
                    if ( !disabledExpand ) {
                        changeTreeDataNode(actElem, treeData, 'expanded', true);
                    }

                    var nextElem = getActElementChild(actElem, pathArray[i].name);
                    if(nextElem !== null) {
                        actElem = nextElem;
                        i = i + ( actElem && actElem.identifiersLength > 0 ? actElem.identifiersLength + 1 : 1);
                    } else {
                        continueCondition = false;
                    }
                }

                if ( !disabledExpand ) {
                    changeTreeDataNode(actElem, treeData, 'selected', true);
                }

                if(actElem) {
                    retObj = { indexApi: actElem.indexApi, indexSubApi: actElem.indexSubApi };
                }
            }
            return retObj;
        };

        pathUtils.fillIdentifiers = function(identifiers, label, value) {
            identifiers.some(function(i) {
                var identifierMatch = i.label === label;
                if(identifierMatch) {
                    i.value = value || '';
                }

                return identifierMatch;
            });
        };

        pathUtils.fillListNode = function(node, label, value) {
            if(node.type === 'list' && node.actElemStructure !== null) {
                var nodeToFill = node.actElemStructure.getChildren('leaf', label)[0];

                if(nodeToFill) {
                    nodeToFill.fill(nodeToFill.label, value);
                }
            }
        };

        pathUtils.fillListRequestData = function(data, listLabel, label, value){
            if ( data.hasOwnProperty(listLabel) && data[listLabel].length ) {
                data[listLabel][0][label] = value;
            }
        };

        pathUtils.findIndexOfStrInPathStr = function(pathParts, targetStr) { //pathParts is path string split by '/'
            var targetIndex = -1;

            pathParts.some(function(p, i) {
                var condition = p === targetStr;
                if(condition) {
                    targetIndex = i;
                }
                return condition;
            });

            return targetIndex;
        };

        pathUtils.getStorageAndNormalizedPath = function(pathStr) {
            var pathParts = pathStr.split('/'),
                restconfIndex = pathUtils.findIndexOfStrInPathStr(pathParts, 'restconf'),
                storage = pathParts[restconfIndex + 1],
                normalizedPath = pathParts.slice(restconfIndex + 1).join('/');

            return { storage: storage, normalizedPath: normalizedPath };
        };

        pathUtils.__test = {
            PathElem: PathElem,
            getModuleNodePair: getModuleNodePair,
            isIdentifier: isIdentifier
        };

        return pathUtils;
    }

    PathUtilsService.$inject=['ArrayUtilsService'];

    return PathUtilsService;

});