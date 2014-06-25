angular.module('common.yangUtils', [])
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

.factory('nodeWrapper', function () {

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
                if(node.value) {
                    builder.insertPropertyToObj(req, node.label, node.value);
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
                
                if(node.children.length) {
                    node.children.forEach(function(child) {  
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

                if (match && node.children.length) {
                    node.children.forEach(function(child) {
                        for(var prop in data) {
                            child.fill(prop, data[prop]);
                        }
                    });

                    node.expanded = true;
                }
                return match;
            };

            node.clear = function() {
                if (node.children.length) {
                    node.children.forEach(function(child) {
                        child.clear();
                    });
                }
            };
            
        },

        case: function(node) {
            node.buildRequest = function(builder, req) {
                var added = false;

                node.children.forEach(function(child) {
                    var childAdded = child.buildRequest(builder, req);
                    added = added || childAdded;
                });

                return added;
            };

            node.fill = function(name, data) {
                var filled = false;

                node.children.forEach(function(child) {
                    var childFilled = child.fill(name, data);
                    filled = filled || childFilled;
                });

                return filled;
            };

            node.clear = function() {
                node.children.forEach(function(child) {
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
                
                node.children.forEach(function(child) {
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

        list: function(node) {

            node.listElems = [];
            node.actElement = null;
            node.needAddNewListElem = true;

            node.addListElem = function() {
                var copy = node.deepCopy();
                wrapper.wrapAll(copy);
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

            var listElemBuildRequest = function(builder, req, node) {
                var added = false,
                    objToAdd = builder.createObj();

                node.children.forEach(function(child) {
                    var childAdded = child.buildRequest(builder, objToAdd);
                    added = added || childAdded;
                });

                if(added) {
                    builder.insertObjToList(req, objToAdd);
                }

                return added;
            };

            var fillListElement = function(name, data, node) {
                var filled = false;

                node.children.forEach(function(child) {
                    var childFilled = child.fill(name, data);
                    filled = filled || childFilled;
                });
                
                return filled;
            };

            node.buildRequest = function(builder, req) {
                var added = false,
                    listToAdd = builder.createList();

                node.listElems.forEach(function(listElem) {
                    var elemAdded = listElemBuildRequest(builder, listToAdd, listElem);
                    added = added || elemAdded;
                });

                if(added) {
                    builder.insertPropertyToObj(req, node.label, listToAdd);
                }

                return added;
            };

            node.fill = function(name, array) { //data is array
                var match = comparePropToElemByName(name, node.label),
                    lastIndex;

                if(match) {
                    for(var i in array) {
                        node.addListElem();

                        lastIndex = node.listElems.length - 1;
                        for(var prop in array[i]) {
                            node.needAddNewListElem = fillListElement( prop, array[i][prop], node.listElems[lastIndex]);
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
        }
    };

    return wrapper;
})

.factory('yinParser', function ($http, $timeout) {

    var path = './assets';
    var runningRequests = [];
    var reqId = 0;

    var spawnRequest = function(digest) {
        var id = digest+(reqId++).toString();
        runningRequests.push(id);
        // console.debug('adding request '+id+' total running requests  = '+runningRequests.length);
        return id;
    };

    var removeRequest = function(id) {
        var index = runningRequests.indexOf(id);

        if (index > -1) {
            runningRequests.splice(index, 1);
            // console.debug('removing request '+id+' remaining requests = '+runningRequests.length);
        }
    };

    var waitFor = function waitFor(callback) {
        var t = 10,
            processes = runningRequests.length;

        // console.debug('waiting for '+t+ 'ms, for '+processes+', processes: '+(processes > 0));

        if(processes > 0) {
            $timeout(function() { 
                waitFor(callback); 
            }, t);
        } else {
            callback();
        }
    };

    var Node = function(id, name, type, module) {
        this.id = id;
        this.label = name;
        this.localeLabel = 'YANGUI_'+name.toUpperCase();
        this.type = type;
        this.module = module;
        this.children = [];

        this.deepCopy = function deepCopy() {
            var copy = new Node(this.id, this.label, this.type, this.module);
            this.children.forEach(function(child) {
                copy.children.push(child.deepCopy());
            });
            return copy;
        };

    };

    var parentTag = function(xml){
        if (xml.get(0).tagName.toLowerCase() === 'module') {
            return xml.get(0);
        } else {
            return parentTag(xml.parent());
        }
    };

    var parseYang = function parseYang(yinPath, callback) {
        var result = null;

        runningRequests = [];
        reqId = 0; 

        $http.get(path+yinPath).success(function (data) {
            var rootModule = $($.parseXML(data).documentElement).attr('name');
        
            yangParser.reset();
            yangParser.setCurrentModule(rootModule);
            yangParser.parse(data, null);

            result = yangParser.rootNode;

            waitFor(function() {
                callback(result);
            });
        }).error(function () {
            console.warn('can\'t find module: '+yinPath);
            return null;
        });
    };

    var yangParser = {
        currentModule: null,
        rootNode: null,
        nodeIndex: 0,

        reset: function() {
            this.rootNode = null;
            this.nodeIndex = 0;
            this.currentModule = null;
        },
        setCurrentModule: function(module) {
            this.currentModule = module;
        },
        createNewNode: function(name, type, parentNode) {
            var node = new Node(this.nodeIndex++, name, type, this.currentModule);
            
            if(this.nodeIndex===1) {
                this.rootNode = node;
            }
            
            if(parentNode) {
                parentNode.children.push(node);
            }
            
            return node;
        },

        parse: function(xml, parent) {
            var self = this;
            
            $(xml).children().each(function() {                
                var prop = this.tagName.toLowerCase();

                if(self.hasOwnProperty(prop)) {
                    self[prop](this, parent);
                } else {
                    //self.parse(this, parent);
                }
            });
        },
        
        leaf: function(xml, parent) {
            var type = 'leaf',
                name = $(xml).attr('name');
            
            this.createNewNode(name, type, parent);
        },
        
        container: function(xml, parent) {   
            var type = 'container',
                name = $(xml).attr('name');
            
            if($(xml).children().length === 0) { //if empty add as element
                this.createNewNode(name, type, parent);
            }
            else {
                var node = this.createNewNode(name, type, parent);
                this.parse(xml, node);
            }
        },
        
        choice: function(xml, parent) {
            var type = 'choice',
                name = $(xml).attr('name'),
                self = this,
                node = this.createNewNode(name, type, parent);

            $(xml).children('case').each(function() {
                self._case(this, node);
            });
        },
        
        _case: function(xml, parent) {
            var type = 'case',
                name = $(xml).attr('name'),
                node = this.createNewNode(name, type, parent);

            this.parse(xml, node);
        },
        
        list: function(xml, parent) {
            var type = 'list',
                name = $(xml).attr('name'),
                node = this.createNewNode(name, type, parent);
            
            this.parse(xml, node);
        },
                
        _grouping: function(xml, parent, groupingName) {
            var self = this;

            $(xml).children('grouping[name=\''+groupingName+'\']').each(function() {
                self.parse(this, parent);
            });
        },
        
        uses: function(xml, parent) {  
            var self = this,
                $xml = $(xml),
                name = $xml.attr('name'),
                names = name.split(':');
            
            if (names[1] === undefined) { //same module
                self._grouping(parentTag($xml), parent, names[0]);            
            }
            else { //different module
                $(parentTag($xml)).children('import').each(function() {
                    var importTag = $(this);
                    
                    importTag.children('prefix[value=\''+names[0]+'\']').each(function() {
                        var importTagModule = importTag.attr('module'),
                            reqId = spawnRequest(importTagModule);

                        $http.get(path+'/yang2xml/'+importTagModule+'.yang.xml').success(function (data) {
                            self.setCurrentModule(importTagModule);
                            self._grouping($.parseXML(data).documentElement, parent, names[1]);
                            removeRequest(reqId);
                        });
                    });
                });
            }
        }
    };

    return {
        parse: parseYang
    };
})

.factory('yangUtils', function ($http, yinParser, nodeWrapper, reqBuilder) {

    var utils = {};

    utils.exportModulesLocales = function(modules) {
        var obj = {},
            localeNodes = ['leaf','list','container','choice'];

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

    utils.processModules = function(loadedModules, callback) {
        // console.info('loaded modules', loadedModules);
        loadedModules.module.forEach(function(module) {
            yinParser.parse('/yang2xml/'+module.name+'.yang.xml', function(node) {
                if(node) {
                    var copy = node.deepCopy();

                    nodeWrapper.wrapAll(copy);
                    callback(copy);
                }
            });
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

    utils.processFlows = function(nodeData) {
        var flows = [];

        nodeData['flow-node-inventory:table'].forEach(function(table) {
            var table_id = table['flow-node-inventory:id'];

            if(table.hasOwnProperty('flow-node-inventory:flow')) {
                table['flow-node-inventory:flow'].forEach(function(flow) {
                    var flowOjb = { table: table_id };
                    flowOjb.flow = flow['flow-node-inventory:id'];
                    flowOjb.data = flow;
                    flowOjb.label = 'table:'+flowOjb.table+' > flow:'+flowOjb.flow;
                    flows.push(flowOjb);
                });
            }
        });

        return flows;
    };

    return utils;

});