angular.module('common.yangUtils', [])
.factory('yangUtils', function () {

    var path = './assets';
    var utils = {};

    var builder = {
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
            var data = propData ? propData : {};                
            obj[propName] = data;
        },

        resultToString: function(obj) {
            return JSON.stringify(obj, null, 4);
        }
    };

    var filler = {};
    var wrapper = {};

    filler.convert = function(data) {
        return $(data);
    };

    filler.getDataTag = function(data) {
        return data.tagName.toLowerCase();
    };

    filler.getLeafData = function(data) {
        return $(data).text();
    };

    var yangTagToFunctionName = function(yangTag) {
        var fncName = yangTag.split('-')[0];
        yangTag.split('-').slice(1).forEach( function(item) {
            var str = item.toString();
            fncName += str.charAt(0).toUpperCase() + str.slice(1);
        });
        
        return fncName;
    };

    var parentTag = function(xml){
        if (xml.get(0).tagName.toLowerCase() === 'module') {
            return xml.get(0);
        } else {
            return parentTag(xml.parent());
        }
    };

    utils.parseYang = function parseYang(yinPath) { 
        var result = null;
        $.ajax(path+yinPath, {
                dataType: 'text',
                async: false,
                success: function (data) {        
                    var rootModule = $($.parseXML(data).documentElement).attr('name');
                    
                    yangParser.reset();
                    yangParser.setCurrentModule(rootModule);
                    yangParser.parse(data, null);

                    result = yangParser.rootNode;
                }
            });

        return result;
    };

    var Node = function(id, name, type, module) {
        this.id = id;
        this.label = name;
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

    wrapper = {

        wrapAll: function(node) {
            var self = this;
            this.wrap(node);
            node.children.forEach(function(child) {
                self.wrapAll(child);
            });
        },

        wrap: function(node) {
            if(this.hasOwnProperty(node.type)) {
                this[node.type](node);
            }
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

            node.fill = function(filler, data) {
                var match = (node.label === filler.getDataTag(data));

                if(match) {
                   node.value = filler.getLeafData(data);
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

            node.fill = function(filler, data) {
                var name = node.label,
                    match = (name == filler.getDataTag(data));

                if (match && node.children.length) {
                    node.children.forEach(function(child) {
                        filler.convert(data).children().each(function() {
                            child.fill(filler, this);
                        });
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

            node.fill = function(filler, data) {
                var filled = false;

                node.children.forEach(function(child) {
                    var childFilled = child.fill(filler, data);
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

            node.fill = function(filler, data) {
                var filled = false;
                
                node.children.forEach(function(child) {
                    var childFilled = child.fill(filler, data);

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
                console.info('selecting act list elem to', node.actElement);
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

            var fillListElement = function(filler, data, node) {
                var filled = false;

                node.children.forEach(function(child) {
                    var childFilled = child.fill(filler, data);
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

            node.fill = function(filler, data) {
                var match = (node.label === filler.getDataTag(data));

                if(match) {
                    var lastIndex;

                    if(node.needAddNewListElem) {
                        node.addListElem();
                    }

                    lastIndex = node.listElems.length - 1;
                    
                    filler.convert(data).children().each(function() {
                        fillListElement(filler, this, node.listElems[lastIndex]);
                    });

                    node.needAddNewListElem = match;
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
                var prop = yangTagToFunctionName(this.tagName.toLowerCase());

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
                        var importTagModule = importTag.attr('module');

                        $.ajax
                        ({
                            type: 'GET',
                            url: path+'/yang2xml/'+importTagModule+'.yang.xml',
                            dataType: 'xml',
                            async: false,
                            success: function(xml)
                            {
                                self.setCurrentModule(importTagModule);
                                self._grouping(xml.documentElement, parent, names[1]);
                            }
                        });
                    });
                });
            }
        }
    };

    var getNodeIdByText = function getNodeIdByText(inNodes, text) {
        var nodes = inNodes.filter(function(item, index) {
            return item.label === text;
        }),
            nodeId;
        
        if(nodes) {
            nodeId = nodes[0].id;
        }

        return nodeId;
    };

    utils.getTopologies = function(host, port) {
        var url = 'http://'+host+':'+port+'/restconf/operational'+'/network-topology:network-topology',
            topoIds = [];

        console.info('REQ:',url);
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'xml',
            async: false,
            success: function(data) {
                var $data = $(data.documentElement);

                $data.children('topology').each(function() {
                    var topologyId = $(this).children('topology-id:first').text();
                    if(topologyId) {
                        topoIds.push(topologyId);
                    }
                });
            }
        });

        return topoIds;
    };

    utils.getSingleTopologyData = function getSingleTopologyData(host, port, topoId) {
        var url = 'http://'+host+':'+port+'/restconf/operational'+'/network-topology:network-topology/topology/'+topoId,
            topoData = null;

        console.info('REQ:',url);
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'xml',
            async: false,
            success: function(data) {
                var nodes = [];
                var links = [];
                
                //console.info('success getting data from ', url);
                $(data).find('node node-id').each(function() {
                    nodes.push({'id': nodes.length.toString(), 'label': $(this).text()});
                });

                $(data).find('link').each(function() {
                    var srcTxt = $(this).find('destination dest-node').text(),
                        dstTxt = $(this).find('source source-node').text(),
                        srcId = getNodeIdByText(nodes, srcTxt),
                        dstId = getNodeIdByText(nodes, dstTxt),
                        linkId = links.length.toString();

                    if(srcId && dstId) {
                        links.push({id: linkId, 'from' : srcId, 'to': dstId, 'sourceName': srcTxt, 'targetText': dstTxt});
                    }
                    
                });

                topoData = {nodes:nodes,links:links};
            }
        });

        return topoData;
    };

    utils.getTopologyData = function(host, port) {
        var topologies = utils.getTopologies(host, port);
        if(topologies.length) {
            var data = utils.getSingleTopologyData(host, port, topologies[0]);
            return data.nodes;
        }
    };

    utils.getModules = function(host, port) {
        var modules = [],
            url = 'http://'+host+':'+port+'/restconf/modules/';
        
        console.info('REQ:',url);
        $.ajax({
                type: 'GET',
                url: url,
                dataType: 'xml',
                async:false,
                success: function(data) {
                    $(data.documentElement).children('module').each(function() {
                        var name = $(this).children('name:first').text(),
                            revision = $(this).children('revision:first').text();

                        modules.push({name: name, revision: revision, label: name+'-'+revision });
                    });
                }
        });

        return modules;
    };

    utils.getAPIs = function(host, port, module, revision) {
        var apis = [],
            url = 'http://'+host+':'+port+'/apidoc/apis/'+module+','+revision;

        console.info('REQ:',url);
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            async:false,
            success: function(data) {
                data.apis.forEach(function(api) {
                    //apis.push(api.path);
                    apis.push(api.path);
                });
            }
        });

        return apis;
    };

    utils.sendRequest = function(host, port, node ,table_id, flow_id, req) {
        var url = 'http://'+host+':'+port+'/restconf/config/opendaylight-inventory:nodes/node/'+node+'/table/'+table_id+'/flow/'+flow_id,
            data = req,
            type = 'json';

        console.info('REQ:',url);
        // console.info('data: ',data);
        $.ajax({
            type: 'PUT',
            url: url,
            data: data,
            contentType: 'application/'+type, 
            processData: false,
            async: false,
            success: function(data, textStatus) {
                console.info('result:',textStatus);
                alert('request sucessfull');
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                console.info('result:',textStatus, '\ndata:\n', errorThrown);
                alert('request failed');
            }
        });
    };

    utils.sendDeleteFlow = function(host, port, node ,table_id, flow_id) {
        var url = 'http://'+host+':'+port+'/restconf/config/opendaylight-inventory:nodes/node/'+node+'/table/'+table_id+'/flow/'+flow_id;

        console.info('REQ:',url);
        // console.info('data: ',data);
        $.ajax({
            type: 'DELETE',
            url: url,
            async: false,
            success: function(data, textStatus) {
                console.info('result:',textStatus);
                alert('request sucessfull');
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                console.info('result:',textStatus, '\ndata:\n', errorThrown);
                alert('request failed');
            }
        });
    };

    utils.getFlows= function(host, port, node) {
        var flows = [],
            url = 'http://'+host+':'+port+'/restconf/config/opendaylight-inventory:nodes/node/'+node;
        
        console.info('REQ:',url);
        $.ajax({
                type: 'GET',
                url: url,
                dataType: 'xml',
                async:false,
                success: function(data) {
                    $(data.documentElement).children('table').each(function() {
                        var table_id = $(this).children('id:first').text();
                        
                        $(this).children('flow').each(function() {
                            var flowOjb = { table: table_id };
                            flowOjb.flow = $(this).children('id:first').text();
                            flowOjb.data = this;
                            flowOjb.label = 'table:'+flowOjb.table+' > flow:'+flowOjb.flow;
                            flows.push(flowOjb);
                            //flows.push(this);
                        });
                    });
                }
        });

        return flows;
    };



    return {
        utils: utils,
        builder: builder,
        filler: filler,
        wrapper: wrapper
    };

});