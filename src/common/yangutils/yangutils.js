angular.module('common.yangUtils', [])

.factory('arrayUtils', function() {

    var arrayUtils = {};

    arrayUtils.getFirstElementByCondition = function(list, condition) {
        var selItems = list.filter(function(item) {
            return condition(item);
        });
        return (selItems.length ? selItems[0] : null);
    };

    return arrayUtils;
})

.factory('pathUtils', function(arrayUtils) {

    var pathUtils = {},
        parentPath = '..';

    var PathElem = function(name, module, identifierName) {
        this.name = name;
        this.module = module;
        this.identifierName = identifierName;
        this.identifierValue = '';

        this.hasIdentifier = function() {
            return (identifierName ? true : false);
        };

        this.toString = function() {
            return (this.module ? this.module+':' : '')+this.name+'/'+(this.hasIdentifier() ? this.identifierValue + '/' : '');
        };

        this.checkNode = function(node) {
            return (this.module ? this.module === node.module : true) && (this.name ? this.name === node.label : true);
        };
    };

    var getModuleNodePair = function(pathString, defaultModule) {
        return pathString.indexOf(':') > -1 ? pathString.split(':') : [defaultModule, pathString];
    };

    var isIdentifier = function(item) {
        return (item.indexOf('{') === item.indexOf('}')) === false;
    };

    var createPathElement = function(pathString, identifierString, prefixConverter, defaultModule) {
        var pair = getModuleNodePair(pathString, defaultModule),
            //module can be either prefix or module name, if it's module name we don't need to convert it
            module = (prefixConverter && pair[0] !== defaultModule ? prefixConverter(pair[0]) : pair[0]),
            name = pair[1];

        return new PathElem(name, module, identifierString);
    };

    pathUtils.search = function(node, path) {
        var pathElem = path.shift(),
            selNode = (pathElem.name === parentPath ?
                node.parent :
                arrayUtils.getFirstElementByCondition(node.children, function(child) {
                    return pathElem.checkNode(child);
                }));

        if(selNode) {
            if(path.length) {
                return pathUtils.search(selNode, path);
            } else {
                return selNode;
            }
        } else {
            // console.warn('cannot find element ',pathElem,'in node',node);
            return null;
        }
    };

    pathUtils.translate = function(path, prefixConverter, defaultModule) {
        var lastUsedModule = defaultModule,

            pathStrArray = path.split('/').filter(function(item) {
                return item !== '';
            }).slice(),

            result = pathStrArray.map(function(item, index) {
                if(isIdentifier(item)) {
                    return null;
                } else {
                    var identifier,
                        pathElem;

                    if(pathStrArray.length > index+1 && isIdentifier(pathStrArray[index+1])) {
                        identifier = pathStrArray[index+1].slice(1, -1);
                    }

                    pathElem = createPathElement(item, identifier, prefixConverter, lastUsedModule);
                    // do we want to update? in api path should not, in other it shouldnt matter
                    // lastUsedModule = (pathElem.module ? pathElem.module : lastUsedModule); 

                    return pathElem;
                }
            }).filter(function(item) {
                return item !== null;
            });

        return result;
    };

    return pathUtils;
})

.factory('syncFact', function ($timeout) {
    var timeout = 10000;

    var SyncObject = function() {
        this.runningRequests = [];
        this.reqId = 0;
        this.timeElapsed = 0;

        this.spawnRequest = function(digest) {
            var id = digest+(this.reqId++).toString();
            this.runningRequests.push(id);
            //console.debug('adding request ',id,' total running requests  = ',this.runningRequests);
            return id;
        };

        this.removeRequest = function(id) {
            var index = this.runningRequests.indexOf(id);

            if (index > -1) {
                this.runningRequests.splice(index, 1);
                //console.debug('removing request ',id,' remaining requests = ',this.runningRequests);
            } else {
                console.warn('cannot remove request',id,'from',this.runningRequests,'index is',index);
            }
        };

        this.waitFor = function(callback) {
            var t = 1000,
                processes = this.runningRequests.length,
                self = this;

            if(processes > 0 && self.timeElapsed < timeout) {
                // console.debug('waitin on',processes,'processes',this.runningRequests);
                $timeout(function() { 
                    self.timeElapsed = self.timeElapsed + t;
                    self.waitFor(callback); 
                }, t);
            } else {
                callback();
            }
        };
    };

    return {
        generateObj: function() {
            return new SyncObject();
        }
    };
})

.factory('reqBuilder', function () {

    var namespace = 'flow-node-inventory';

    var builder = {
        namespace: namespace,
        createObj: function() {
            return {};
        },

        createList: function() {
            return [];
        },

        insertObjToList: function(list, obj) {
            list.push(obj);
        },

        insertPropertyToObj: function(obj, propName, propData) {
            var data = propData ? propData : {},
                name = propName;

            obj[name] = data;
        },

        resultToString: function(obj) {
            return JSON.stringify(obj, null, 4);
        }
    };

    return builder;

})

.factory('nodeWrapper', function (constants) {

    var comparePropToElemByName = function comparePropToElemByName(propName, elemName) {
        return propName.split(':')[1] === elemName; //TODO modify when namespace relations will be known
    };

    var wrapper = {

        wrap: function(node) {
            if(this.hasOwnProperty(node.type)) {
                this[node.type](node);
            }
        },

        wrapAll: function(node) {
            var self = this;
            self.wrap(node);
            node.children.forEach(function(child) {
                self.wrapAll(child);
            });
        },

        leaf: function(node) {
            node.value = '';

            node.buildRequest = function(builder, req) {
                var valueStr = '';

                try {
                    valueStr = node.value.toString();
                } catch(e) {
                    console.warn('cannot convert value',node.value);
                }

                if(valueStr) {
                    builder.insertPropertyToObj(req, node.label, valueStr);
                    return true;
                }
                return false;
            };

            node.fill = function(name, data) {
                var match = comparePropToElemByName(name, node.label);

                if(match) {
                    node.value = data;
                }

                return match;
            };

            node.clear = function() {
                node.value = '';
            };
        },
        
        container: function(node) {
            node.expanded = false;

            node.toggleExpand = function() {
                node.expanded = !node.expanded;
            };

            node.buildRequest = function(builder, req) {
                var added = false,
                    name = node.label,
                    objToAdd = builder.createObj();
                
                if(node.getByNodeType(constants.NODE_UI_DISPLAY).length) {
                    
                    node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                        var childAdded = child.buildRequest(builder, objToAdd);
                        added = added || childAdded;
                    });
                } else {
                    added = true;
                }

                if(added) {
                    builder.insertPropertyToObj(req, name, objToAdd);
                }

                return added;
            };

            node.fill = function(name, data) {
                var match = comparePropToElemByName(name, node.label);

                if (match && node.getByNodeType(constants.NODE_UI_DISPLAY).length) {
                    node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                        for(var prop in data) {
                            child.fill(prop, data[prop]);
                        }
                    });

                    node.expanded = true;
                }
                return match;
            };

            node.clear = function() {
                if (node.getByNodeType(constants.NODE_UI_DISPLAY).length) {
                    node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                        child.clear();
                    });
                }
            };
            
        },

        case: function(node) {
            node.buildRequest = function(builder, req) {
                var added = false;

                node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                    var childAdded = child.buildRequest(builder, req);
                    added = added || childAdded;
                });

                return added;
            };

            node.fill = function(name, data) {
                var filled = false;

                node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                    var childFilled = child.fill(name, data);
                    filled = filled || childFilled;
                });

                return filled;
            };

            node.clear = function() {
                node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                    child.clear();
                });
            };
        },

        choice: function(node) {
            node.choice = null;
            node.buildRequest = function(builder, req) {
                var added;

                if(node.choice) {
                    added = node.choice.buildRequest(builder, req);
                }

                return added;
            };

            node.fill = function(name, data) {
                var filled = false;
                
                node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                    var childFilled = child.fill(name, data);

                    if(childFilled) {
                        node.choice = child;
                    }

                    filled = filled || childFilled;
                    if(filled) {
                        return false;
                    }
                });

                return filled;
            };

            node.clear = function() {
                if(node.choice) {
                    node.choice.clear();
                    node.choice = null;
                }
            };
        },

        'leaf-list': function(node) {
            node.value = [];
            node.expanded = false;

            node.toggleExpand = function() {
                node.expanded = !node.expanded;
            };

            node.addListElem = function() {
                var newElement = {
                    value: ''
                };
                node.value.push(newElement);
            };

            node.removeListElem = function(elem){
                node.value.splice(node.value.indexOf(elem),1);
            };

            node.buildRequest = function(builder, req) {

                var valueArray = [];

                for( var i=0; i < node.value.length; i++ ) {
                    valueArray.push(node.value[i].value);
                }

                if(valueArray.length > 0) {
                    builder.insertPropertyToObj(req, node.label, valueArray);
                    return true;
                }

                return false;

            };


            node.fill = function(name, array) {
                var match = comparePropToElemByName(name, node.label),
                    newLeafListItem;

                if(match) {
                    
                    for ( var i=0; i< array.length; i++ ) {
                        newLeafListItem = {
                            value: array[i]
                        };
                        node.value.push(newLeafListItem);
                    }
                    
                }
                return match;
            }; 

            node.clear = function() {
                node.value = [];
            };

        },

        key: function(node) {
            // do this only on list, not on listElem because deepCopy on list doesn't copy property keys to listElem => don't do this when button for add new list is clicked
            if (node.parent.hasOwnProperty('refKey')) {
                node.parent.refKey = node.label.split(' ');
            }
        },

        list: function(node) {

            node.listElems = [];
            node.actElement = null;
            node.needAddNewListElem = true;
            node.refKey = [];

            var isInArray = function isInArray(array, key) {
                var found = false,
                    i = 0;

                while (!found && i<array.length) {
                    found = found || (array[i] === key);
                    i++;
                }
                return found;
            };

            var equalArrElems = function equalArrElems(savedKey, listElemKey) {
                var match = true;

                for(var i = 0; i < savedKey.length; i++) {
                    match = match && (savedKey[i] === listElemKey[i]);
                }
                return match;
            };

            var checkListElemKey = function checkListElemKey(listElem, keys, refKey) {
                var listElemKey = listElem.getByNodeType(constants.NODE_UI_DISPLAY).filter(function(child) {
                    return isInArray(refKey, child.label) && child.hasOwnProperty('value');
                }).map(function(child) {
                    return child.value;
                });

                var found = false,
                    i = 0;

                if (keys.length > 0) {
                    while (!found && i < keys.length) {
                        found = equalArrElems(keys[i], listElemKey);
                        i++;
                    }
                }

                if (found) {
                    return null;
                } else {
                    return listElemKey;
                }
            };

            node.buildRequest = function(builder, req) {
                var keys = [];  // array of listElemKey
                var listElemKey = [];  // array of key values from one listElement

                var added = false,
                    listToAdd = builder.createList();

                node.listElems.forEach(function(listElem) {
                    if (node.refKey.length) {
                        listElemKey = null;
                        listElemKey = checkListElemKey(listElem, keys, node.refKey);
                        if (listElemKey !== null) {
                            listElem.isValid = true;
                        }
                        else {
                            listElem.isValid = false;
                        }
                    } else {
                        listElem.isValid = true;
                    }

                    if (listElem.isValid) {
                        keys.push(listElemKey);
                        var elemAdded = listElem.listElemBuildRequest(builder, listToAdd);
                        added = added || elemAdded;
                    }
                });

                if(added) {
                    builder.insertPropertyToObj(req, node.label, listToAdd);
                }

                return added;
            };

            node.addListElem = function() {
                var copy = node.deepCopy();
                wrapper._listElem(copy);
                node.listElems.push(copy);
                node.needAddNewListElem = false;
                node.actElement = node.listElems[node.listElems.length - 1];
            };

            node.removeListElem = function(elem) {
                node.listElems.splice(node.listElems.indexOf(elem), 1);
                if(node.listElems.length) {
                    node.actElement = node.listElems[node.listElems.length - 1];
                } else {
                    node.actElement = null;
                }
            };

            node.fill = function(name, array) { //data is array
                var match = comparePropToElemByName(name, node.label),
                    lastIndex;

                if(match) {
                    for(var i in array) {
                        node.addListElem();

                        lastIndex = node.listElems.length - 1;
                        for(var prop in array[i]) {
                            node.needAddNewListElem = node.listElems[lastIndex].fillListElement( prop, array[i][prop]);
                        }
                    }
                }
                return match;
            };

            node.clear = function() {
                while(node.listElems.length > 0) {
                    node.listElems.pop();
                }
                node.needAddNewListElem = true;
            };
        },

        _listElem: function(node) {
            node.isValid = true;

            node.listElemBuildRequest = function(builder, req) {
                var added = false,
                    objToAdd = builder.createObj();

                node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                    var childAdded = child.buildRequest(builder, objToAdd);
                    added = added || childAdded;
                });

                if(added) {
                    builder.insertObjToList(req, objToAdd);
                }

                return added;
            };

            node.fillListElement = function(name, data) {
                var filled = false;

                node.getByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                    var childFilled = child.fill(name, data);
                    filled = filled || childFilled;
                });
                
                return filled;
            };

            node.children.forEach(function(child) {
                wrapper.wrapAll(child);
            });
        }
    };

    wrapper.__test = {
        comparePropToElemByName: comparePropToElemByName
    };

    return wrapper;
})

.factory('yinParser', function ($http, syncFact, constants, arrayUtils, pathUtils) {
    var augmentType = 'augment';
    var path = './assets';

    var Node = function(id, name, type, module, namespace, parent, nodeType, moduleRevision) {
        this.id = id;
        this.label = name;
        this.localeLabel = 'YANGUI_'+name.toUpperCase();
        this.type = type;
        this.module = module;
        this.children = [];
        this.parent = parent;
        this.nodeType = nodeType;
        this.namespace = namespace;
        this.moduleRevision = moduleRevision;

        this.appendTo = function(parentNode) {
            parentNode.children.push(this);
        };

        this.deepCopy = function deepCopy() {
            var copy = new Node(this.id, this.label, this.type, this.module, this.namespace, null, this.nodeType, this.moduleRevision);
            this.children.forEach(function(child) {
                var childCopy = child.deepCopy();
                childCopy.parent = copy;
                copy.children.push(childCopy);
            });
            return copy;
        };

        this.getByNodeType = function getByNodeType(nodeType) {
            return this.children.filter(function(child){
                return child.nodeType === nodeType;
            });
        };

    };

    var Augmentation = function(node) {
        this.node = node;
        this.path = (node.path ? node.path : []);

        this.apply = function(nodeList) {
            var targetNode = this.getTargetNodeToAugment(nodeList);

            if(targetNode) {
                this.node.children.forEach(function(child) {
                    child.appendTo(targetNode);
                });
            } else {
                console.warn('can\'t find target node for augmentation '+this.getPathString());
            }
        };

        this.getTargetNodeToAugment = function(nodeList) {
            return pathUtils.search({children: nodeList}, this.path.slice());
        };

        this.getPathString = function() {
            return this.path.map(function (elem) {
                return elem.module+':'+elem.name;
            }).join('/');
        };

    };

    var parentTag = function(xml){
        if (xml.get(0).tagName.toLowerCase() === 'module') {
            return xml.get(0);
        } else {
            return parentTag(xml.parent());
        }
    };

    var parseYang = function parseYang(yinPath, callback, errorCbk) {
        var yangParser = new YangParser();

        $http.get(path+yinPath).success(function (data) {
            var rootModule = $($.parseXML(data).documentElement).attr('name'),
                rootNamespace = $($.parseXML(data)).find('namespace').attr('uri'),
                rootModuleRevision = $($.parseXML(data)).find('revision').attr('date');

            yangParser.setCurrentModule(rootModule);
            yangParser.setCurrentNamespace(rootNamespace);
            yangParser.setModuleRevision(rootModuleRevision);
            yangParser.parse($.parseXML(data).documentElement, null);

            yangParser.sync.waitFor(function() {
                callback(yangParser.getRoots(), yangParser.getAugments());
            });
        }).error(function () {
            console.warn('can\'t find module: '+yinPath);
            errorCbk();
            return null;
        });
    };

    var YangParser = function() {
        this.currentModule = null;
        this.currentNamespace = null;
        this.rootNodes = [];
        this.nodeIndex = 0;
        this.sync = syncFact.generateObj();

        this.moduleRevision = null;
        
        this.getRoots = function() {
            return this.rootNodes.filter(function(node) {
                return node.type !== augmentType;
            });
        };

        this.getAugments = function() {
            return this.rootNodes.filter(function(node) {
                return node.type === augmentType;
            }).map(function(augNode) {
                return new Augmentation(augNode);
            });
        };

        this.setCurrentModule = function(module) {
            this.currentModule = module;
        };

        this.setCurrentNamespace = function(namespace) {
            var namespaceArray = namespace.split(':');

            namespaceArray.splice(0,1);
            this.currentNamespace = namespaceArray.join('-');
        };

        this.setModuleRevision = function(moduleRevision) {
            this.moduleRevision = moduleRevision;
        };

        this.createNewNode = function(name, type, parentNode, nodeType) {
            var node = new Node(this.nodeIndex++, name, type, this.currentModule, this.currentNamespace, parentNode, nodeType, this.moduleRevision);

            if(parentNode) {
                parentNode.children.push(node);
            } else {
                this.rootNodes.push(node);
            }

            //console.log(node);
            
            return node;
        };

        this.parse = function(xml, parent) {
            var self = this;

            $(xml).children().each(function(_, item) {
                var prop = item.tagName.toLowerCase();
                if(self.hasOwnProperty(prop)) {
                    self[prop](item, parent);
                } else {
                    // self.parse(this, parent);
                }
            });
        };

        this.leaf = function(xml, parent) {
            var type = 'leaf',
                name = $(xml).attr('name'),
                nodeType = constants.NODE_UI_DISPLAY;
            this.createNewNode(name, type, parent, nodeType);
        };

        this['leaf-list'] = function(xml, parent) {
            var type = 'leaf-list',
                name = $(xml).attr('name'),
                nodeType = constants.NODE_UI_DISPLAY;

            this.createNewNode(name, type, parent, nodeType);
        };

        this.container = function(xml, parent) {   
            var type = 'container',
                name = $(xml).attr('name'),
                nodeType = constants.NODE_UI_DISPLAY;
            
            if($(xml).children().length === 0) { //if empty add as element
                this.createNewNode(name, type, parent, nodeType);
            }
            else {
                var node = this.createNewNode(name, type, parent, nodeType);
                this.parse(xml, node);
            }
        };

        this.choice = function(xml, parent) {
            var type = 'choice',
                name = $(xml).attr('name'),
                self = this,
                nodeType = constants.NODE_UI_DISPLAY,
                node = this.createNewNode(name, type, parent, nodeType);

            $(xml).children('case').each(function() {
                self._case(this, node);
            });
        };

        this._case = function(xml, parent) {
            var type = 'case',
                name = $(xml).attr('name'),
                nodeType = constants.NODE_UI_DISPLAY,
                node = this.createNewNode(name, type, parent, nodeType);

            this.parse(xml, node);
        };

        this.list = function(xml, parent) {
            var type = 'list',
                name = $(xml).attr('name'),
                nodeType = constants.NODE_UI_DISPLAY,
                node = this.createNewNode(name, type, parent, nodeType);

            this.parse(xml, node);
        };

        
        this.key = function (xml, parent) {
            var type = 'key',
                name = $(xml).attr('value'),
                nodeType = constants.NODE_ALTER;
            
            this.createNewNode(name, type, parent, nodeType);
        };

        this._grouping = function(xml, parent, groupingName) {
            var self = this;

            $(xml).children('grouping[name=\''+groupingName+'\']').each(function() {
                self.parse(this, parent);
            });
        };
        
        this.uses = function(xml, parent) {  
            var self = this,
                $xml = $(xml),
                name = $xml.attr('name'),
                names = name.split(':'),
                importObject;

            // console.info('got uses with',name);
            
            if (names[1] === undefined) { //same module
                self._grouping(parentTag($xml), parent, names[0]);
            }
            else { //different module

                importObject = self._import(parentTag($xml), names[0]);
                // console.log(importObject);

                if ( importObject.moduleName ) {

                    var reqId = self.sync.spawnRequest(importObject.moduleName);

                    $http.get(path+'/yang2xml/'+importObject.fileName+'.yang.xml').success(function (data) {
                        self._grouping($.parseXML(data).documentElement, parent, names[1]);
                        //console.log('removing request', reqId);
                        self.sync.removeRequest(reqId);
                    });

                }

            }
        };

        this._import = function(xml, prefixName) {

            var self = this, 
                importTagModuleName,
                revisionDate,
                importObject = {};
                

            $(xml).children('import').each(function() {
                var importTag = $(this),
                    prefix = $(importTag.children('prefix[value=\''+prefixName+'\']'));
                
                importTagModuleName = prefix.parent().attr('module');

                if ( importTagModuleName ) {
                    revisionDate = importTag.children('revision-date').attr('date');
                    return false;
                } 
            });


            if ( revisionDate ) {

                var url = path+'/yang2xml/'+ importTagModuleName + '@' + revisionDate +'.yang.xml';

                $.ajax({
                    url: url,
                    type: 'GET',
                    async: false
                })
                .done(function() { 
                    importObject = {
                        moduleName: importTagModuleName,
                        revisionDate: revisionDate,
                        fileName: importTagModuleName + '@' + revisionDate
                    };
                }).fail(function() { 
                    importObject = {
                        moduleName: importTagModuleName,
                        revisionDate: revisionDate,
                        fileName: importTagModuleName
                    };
                });

            } else {
                importObject = {
                    moduleName: importTagModuleName,
                    revisionDate: revisionDate,
                    fileName: importTagModuleName
                };
            }

            return importObject;
        };

        this.augment = function(xml, parent) {  
            var type = augmentType,
                nodeType = constants.NODE_ALTER,
                self = this,
                prefixConverter = function (prefix) {
                    return self._import(parentTag($(xml)), prefix).moduleName;
                },
                pathString = $(xml).attr('target-node'),
                path = pathUtils.translate(pathString, prefixConverter, this.currentModule),
                augmentRoot = this.createNewNode(pathString, type, null, nodeType);

            augmentRoot.path = path;
            self.parse(xml, augmentRoot);
        };

        this.when = function(xml, parent) {
            var type = 'when',
                name = $(xml).attr('condition'),
                nodeType = constants.NODE_CONDITIONAL,
                node = this.createNewNode(name, type, parent, nodeType);

            node.getConditionResult = function() {
                return true;
            };

        };
    };

    return {
        parse: parseYang,
        __test: {
            path: path,
            parentTag: parentTag,
            yangParser: new YangParser(),
            Augmentation: Augmentation
        }
    };
})


.factory('apiConnector', function ($http, syncFact, arrayUtils, pathUtils) {
    var connector = {};

    var apiPathElemsToString = function(apiPathElems) {
        return apiPathElems.map(function(elem) {
            return elem.toString();
        }).join('');
    };

    var SubApi = function(pathTemplateString, operations) {
        this.node = null;
        this.pathTemplateString = pathTemplateString;
        this.pathArray = [];
        this.operations = operations;
        
        this.setNode = function(node) {
            this.node = node;
        };

        this.setPathArray = function(pathArray) {
            this.pathArray = pathArray;
        };

        this.buildApiRequestString = function() {
            return apiPathElemsToString(this.pathArray);
        };
    };

    var parseApiPath = function(path) {
        var moduleIndexStart = path.lastIndexOf('/'),
            revisionIndexStart = path.lastIndexOf('(');
        return ({module: path.slice(moduleIndexStart + 1, revisionIndexStart), revision: path.slice(revisionIndexStart + 1, -1)});
    };

    connector.processApis = function(apis, callback) {
        var processedApis = [],
            sync = syncFact.generateObj();


        apis.forEach(function(api) {
            var data = parseApiPath(api.path),
                reqID = sync.spawnRequest(api.path),
                apiObj = {
                    module: data.module,
                    revision: data.revision
                };

            $http.get(api.path).success(function(data) {
                var subApis = [];

                data.apis.forEach(function(subApi) {
                    var operations = subApi.operations.map(function(item) {
                            return item.method;
                        }),
                        subApiElem = new SubApi(subApi.path, operations);

                    subApis.push(subApiElem);
                });

                apiObj.basePath = data.basePath;
                apiObj.subApis = subApis;

                sync.removeRequest(reqID);
            }).error(function() {
                sync.removeRequest(reqID);
            });

            processedApis.push(apiObj);
        });

        sync.waitFor(function() {
            callback(processedApis);
        });
    };

    var getRootNodeByPath = function(module, nodeLabel, nodeList) {
        var selNode = arrayUtils.getFirstElementByCondition(nodeList, function(item) {
            return item.module === module && item.label === nodeLabel; //&& item.revision === api.revision; //after revisions are implemented
        });

        if(!selNode) {
            console.warn('cannot find root node for module',module,'label',nodeLabel);
        } 
        return selNode;
    };

   connector.linkApisToNodes = function(apiList, nodeList) {
        return apiList.map(function(api) {

            api.subApis = api.subApis.map(function(subApi) {
                var pathArray = pathUtils.translate(subApi.pathTemplateString, null, null),
                    rootNode = getRootNodeByPath(pathArray[1].module, pathArray[1].name, nodeList);

                subApi.setNode(pathArray.length > 2 ? pathUtils.search(rootNode, pathArray.slice(2)) : rootNode);
                subApi.setPathArray(pathArray);

                return subApi;
            });

            return api;
        });
    };

    return connector;
})

.factory('yangUtils', function ($http, yinParser, nodeWrapper, reqBuilder, syncFact, apiConnector) {

    var utils = {};

    utils.exportModulesLocales = function(modules) {
        var obj = {},
            localeNodes = ['leaf','list','container','choice', 'leaf-list'];

        var process = function process(node) {
            if(localeNodes.indexOf(node.type) >= 0 && obj.hasOwnProperty(node.localeLabel) === false) {
                obj[node.localeLabel] = node.label;
            }

            node.children.forEach(function(child) {
                process(child);
            });
        };

        modules.forEach(function(module) {
            process(module);
        });

        return JSON.stringify(obj, null, 4);
    };

    utils.generateNodesToApis = function(callback, errorCbk) {
        var allRootNodes = [],
            apiModules = [],
            topLevelSync = syncFact.generateObj(),
            reqApis = topLevelSync.spawnRequest('apis'),
            reqAll = topLevelSync.spawnRequest('all');

        
        $http.get('http://localhost:8080/apidoc/apis/').success(function (data) {
            apiConnector.processApis(data.apis, function(result) {
                apiModules = result;
                topLevelSync.removeRequest(reqApis);
            });
        }).error(function(result) {
            console.error('Error getting API data:',result);
            topLevelSync.removeRequest(reqApis);
        });

        $http.get('http://localhost:8080/restconf/modules/').success(function (data) {
            allRootNodes = utils.processModules(data.modules, function(result) {
                allRootNodes = result;
                topLevelSync.removeRequest(reqAll);
            });
        }).error(function(result) {
            console.error('Error getting API data:',result);
            topLevelSync.removeRequest(reqAll);
        });

        topLevelSync.waitFor(function () {
            try {
                callback(apiConnector.linkApisToNodes(apiModules, allRootNodes), allRootNodes);
            } catch(e) {
                errorCbk(e);
                throw(e); //do not lose debugging info
            }
        });
        
    };

    utils.processModules = function(loadedModules, callback) {
        var rootNodes = [],
            augments = [],
            syncModules = syncFact.generateObj();

            loadedModules.module.forEach(function(module) {
                var reqId = syncModules.spawnRequest(module.name);
                
                yinParser.parse('/yang2xml/'+module.name+'.yang.xml', function(nodes, moduleAugments) {
                    if(nodes.length) {
                        rootNodes = rootNodes.concat(nodes);
                    }

                    if(moduleAugments.length) {
                        augments = augments.concat(moduleAugments);
                    }

                    syncModules.removeRequest(reqId);
                }, function() {
                    syncModules.removeRequest(reqId);
                });
            });

        syncModules.waitFor(function() {
            console.info(rootNodes.length+' modules loaded',rootNodes);
            console.info(augments.length+' augments loaded',augments);

            var sortedAugments = augments.sort(function(a, b) {
                return a.path.length - b.path.length;
            });

            sortedAugments.map(function(elem) {
                elem.apply(rootNodes);
            });

            callback(rootNodes.map(function(node) {
                var copy = node.deepCopy();
                
                nodeWrapper.wrapAll(copy);
                return copy;
            }));
        });
    };


    utils.buildRequest = function(node) {
        var request = reqBuilder.createObj();
        node.buildRequest(reqBuilder, request);
        return request.flows; //TODO use REST API explorer when it will be available
    };

    utils.getRequestString = function(node) {
        var request = reqBuilder.createObj(),
            reqStr = '';

        node.buildRequest(reqBuilder, request);

        if(request && $.isEmptyObject(request) === false) {
            reqStr = reqBuilder.resultToString(request);
        }
        return reqStr;
    };

    utils.processNodes = function(invData) {
        var nodes =[];

        invData.node.forEach(function(node) {
            nodes.push(node.id);
        });
        return nodes;
    };

    utils.__test = {
    };

    return utils;

})

.factory('constants', function(){
    return  {
        NODE_UI_DISPLAY : 1,
        NODE_ALTER: 2,
        NODE_CONDITIONAL: 3,
    };
});